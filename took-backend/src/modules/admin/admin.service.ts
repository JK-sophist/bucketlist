import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnonymousThread } from '../anonymous-threads/entities/anonymous-thread.entity';
import { BridgeRequest } from '../bridge-requests/entities/bridge-request.entity';
import { ChatMessage } from '../chat-messages/entities/chat-message.entity';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';
import { KeywordMaster } from '../keywords/entities/keyword-master.entity';
import { KeywordSynonym } from '../keywords/entities/keyword-synonym.entity';
import { MessageRecipient } from '../message-recipients/entities/message-recipient.entity';
import { MessageReply } from '../message-replies/entities/message-reply.entity';
import { Message } from '../messages/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { AdminLog } from './entities/admin-log.entity';
import { AdminPolicy } from './entities/admin-policy.entity';
import { PolicyHistory } from './entities/policy-history.entity';
import { PolicyService } from './policy.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageRecipient)
    private readonly recipientRepository: Repository<MessageRecipient>,
    @InjectRepository(AnonymousThread)
    private readonly threadRepository: Repository<AnonymousThread>,
    @InjectRepository(MessageReply)
    private readonly replyRepository: Repository<MessageReply>,
    @InjectRepository(BridgeRequest)
    private readonly bridgeRepository: Repository<BridgeRequest>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(KeywordMaster)
    private readonly keywordRepository: Repository<KeywordMaster>,
    @InjectRepository(KeywordSynonym)
    private readonly synonymRepository: Repository<KeywordSynonym>,
    @InjectRepository(AdminLog)
    private readonly logRepository: Repository<AdminLog>,
    private readonly policyService: PolicyService,
  ) {}

  getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async suspendUser(adminUserId: string, userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.isSuspended = true;
    const saved = await this.userRepository.save(user);
    await this.log(adminUserId, 'USER_SUSPEND', 'user', userId);

    return saved;
  }

  async blockUser(
    adminUserId: string,
    userId: string,
    blockedUserId: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const blocked = new Set(user.blockedUserIds ?? []);
    blocked.add(blockedUserId);
    user.blockedUserIds = Array.from(blocked);

    const saved = await this.userRepository.save(user);
    await this.log(adminUserId, 'USER_BLOCK', 'user', userId, { blockedUserId });

    return saved;
  }

  getMessages(): Promise<Message[]> {
    return this.messageRepository.find();
  }

  getRecipients(): Promise<MessageRecipient[]> {
    return this.recipientRepository.find();
  }

  getThreads(): Promise<AnonymousThread[]> {
    return this.threadRepository.find();
  }

  getReplies(): Promise<MessageReply[]> {
    return this.replyRepository.find();
  }

  getBridgeRequests(): Promise<BridgeRequest[]> {
    return this.bridgeRepository.find();
  }

  async approveBridge(adminUserId: string, requestId: string): Promise<BridgeRequest> {
    const request = await this.bridgeRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Bridge request not found');

    request.status = 'APPROVED';
    const saved = await this.bridgeRepository.save(request);
    await this.log(adminUserId, 'BRIDGE_APPROVE', 'bridge_request', requestId);

    return saved;
  }

  async rejectBridge(adminUserId: string, requestId: string): Promise<BridgeRequest> {
    const request = await this.bridgeRepository.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Bridge request not found');

    request.status = 'REJECTED';
    const saved = await this.bridgeRepository.save(request);
    await this.log(adminUserId, 'BRIDGE_REJECT', 'bridge_request', requestId);

    return saved;
  }

  getChatRooms(): Promise<ChatRoom[]> {
    return this.chatRoomRepository.find();
  }

  getChatMessages(): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find();
  }

  getKeywords(): Promise<KeywordMaster[]> {
    return this.keywordRepository.find();
  }

  createKeyword(displayKeyword: string): Promise<KeywordMaster> {
    return this.keywordRepository.save(
      this.keywordRepository.create({
        displayKeyword,
        normalizedKeyword: displayKeyword.toLowerCase().trim(),
      }),
    );
  }

  async updateKeyword(
    keywordId: string,
    payload: Partial<Pick<KeywordMaster, 'displayKeyword' | 'usageCount' | 'responseRate'>>,
  ): Promise<KeywordMaster> {
    const keyword = await this.keywordRepository.findOne({ where: { id: keywordId } });
    if (!keyword) throw new NotFoundException('Keyword not found');

    Object.assign(keyword, payload);
    return this.keywordRepository.save(keyword);
  }

  async deleteKeyword(keywordId: string): Promise<void> {
    await this.keywordRepository.delete({ id: keywordId });
  }

  getSynonyms(): Promise<KeywordSynonym[]> {
    return this.synonymRepository.find();
  }

  createSynonym(keywordMasterId: string, synonym: string): Promise<KeywordSynonym> {
    return this.synonymRepository.save(
      this.synonymRepository.create({ keywordMasterId, synonym }),
    );
  }

  getPolicies(): Promise<AdminPolicy[]> {
    return this.policyService.getPolicies();
  }

  setPolicy(params: {
    policyKey: string;
    policyValue: string;
    adminUserId?: string;
    reason?: string;
    category?: string;
    valueType?: 'number' | 'string' | 'boolean' | 'json';
    description?: string;
    editable?: boolean;
  }): Promise<AdminPolicy> {
    return this.policyService.setPolicy({
      policyKey: params.policyKey,
      policyValue: params.policyValue,
      updatedBy: params.adminUserId,
      reason: params.reason,
      category: params.category,
      valueType: params.valueType,
      description: params.description,
      editable: params.editable,
    });
  }

  getPolicyHistories(policyKey?: string): Promise<PolicyHistory[]> {
    return this.policyService.getPolicyHistories(policyKey);
  }

  getLogs(): Promise<AdminLog[]> {
    return this.logRepository.find({ order: { createdAt: 'DESC' } });
  }

  private async log(
    adminUserId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logRepository.save(
      this.logRepository.create({
        adminUserId,
        action,
        targetType,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      }),
    );
  }
}
