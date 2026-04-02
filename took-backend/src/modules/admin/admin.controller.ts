import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';

import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:userId/suspend')
  suspendUser(@Param('userId') userId: string, @Body('adminUserId') adminUserId: string) {
    return this.adminService.suspendUser(adminUserId, userId);
  }

  @Patch('users/:userId/block/:blockedUserId')
  blockUser(
    @Param('userId') userId: string,
    @Param('blockedUserId') blockedUserId: string,
    @Body('adminUserId') adminUserId: string,
  ) {
    return this.adminService.blockUser(adminUserId, userId, blockedUserId);
  }

  @Get('messages')
  getMessages() {
    return this.adminService.getMessages();
  }

  @Get('recipients')
  getRecipients() {
    return this.adminService.getRecipients();
  }

  @Get('threads')
  getThreads() {
    return this.adminService.getThreads();
  }

  @Get('replies')
  getReplies() {
    return this.adminService.getReplies();
  }

  @Get('bridges')
  getBridgeRequests() {
    return this.adminService.getBridgeRequests();
  }

  @Patch('bridges/:requestId/approve')
  approveBridge(
    @Param('requestId') requestId: string,
    @Body('adminUserId') adminUserId: string,
  ) {
    return this.adminService.approveBridge(adminUserId, requestId);
  }

  @Patch('bridges/:requestId/reject')
  rejectBridge(
    @Param('requestId') requestId: string,
    @Body('adminUserId') adminUserId: string,
  ) {
    return this.adminService.rejectBridge(adminUserId, requestId);
  }

  @Get('chat-rooms')
  getChatRooms() {
    return this.adminService.getChatRooms();
  }

  @Get('chat-messages')
  getChatMessages() {
    return this.adminService.getChatMessages();
  }

  @Get('keywords')
  getKeywords() {
    return this.adminService.getKeywords();
  }

  @Post('keywords')
  createKeyword(@Body('displayKeyword') displayKeyword: string) {
    return this.adminService.createKeyword(displayKeyword);
  }

  @Patch('keywords/:keywordId')
  updateKeyword(@Param('keywordId') keywordId: string, @Body() body: any) {
    return this.adminService.updateKeyword(keywordId, body);
  }

  @Delete('keywords/:keywordId')
  deleteKeyword(@Param('keywordId') keywordId: string) {
    return this.adminService.deleteKeyword(keywordId);
  }

  @Get('synonyms')
  getSynonyms() {
    return this.adminService.getSynonyms();
  }

  @Post('synonyms')
  createSynonym(@Body() body: { keywordMasterId: string; synonym: string }) {
    return this.adminService.createSynonym(body.keywordMasterId, body.synonym);
  }

  @Get('policies')
  getPolicies() {
    return this.adminService.getPolicies();
  }

  @Post('policies')
  setPolicy(@Body() body: { policyKey: string; policyValue: string }) {
    return this.adminService.setPolicy(body.policyKey, body.policyValue);
  }

  @Get('logs')
  getLogs() {
    return this.adminService.getLogs();
  }
}
