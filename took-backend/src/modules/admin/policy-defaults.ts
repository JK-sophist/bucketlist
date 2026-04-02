export type PolicyValueType = 'number' | 'string' | 'boolean' | 'json';

export interface PolicyDefault {
  key: string;
  category: string;
  value: string;
  valueType: PolicyValueType;
  description: string;
  editable: boolean;
}

export const POLICY_DEFAULTS: PolicyDefault[] = [
  {
    key: 'MATCHING_CANDIDATE_LIMIT',
    category: 'matching',
    value: '100',
    valueType: 'number',
    description: '매칭 1차 후보 최대 수',
    editable: true,
  },
  {
    key: 'MATCHING_RECENT_EXCLUDE_DAYS',
    category: 'matching',
    value: '7',
    valueType: 'number',
    description: '최근 발송 이력 제외 기간(일)',
    editable: true,
  },
  {
    key: 'MATCHING_USER_KEYWORD_WEIGHT',
    category: 'matching',
    value: '4',
    valueType: 'number',
    description: '유저 키워드 가중치',
    editable: true,
  },
  {
    key: 'MATCHING_MESSAGE_KEYWORD_WEIGHT',
    category: 'matching',
    value: '6',
    valueType: 'number',
    description: '메시지 키워드 가중치',
    editable: true,
  },
  {
    key: 'TRUST_SCORE_WEIGHT',
    category: 'matching',
    value: '0.2',
    valueType: 'number',
    description: '신뢰도 점수 가중치',
    editable: true,
  },
  {
    key: 'ACTIVITY_WEIGHT',
    category: 'matching',
    value: '1',
    valueType: 'number',
    description: '최근 활동 점수 가중치',
    editable: true,
  },
  {
    key: 'DAILY_FREE_MESSAGE_LIMIT',
    category: 'message',
    value: '20',
    valueType: 'number',
    description: '일일 무료 메시지 발송 제한',
    editable: true,
  },
  {
    key: 'MESSAGE_MAX_LENGTH',
    category: 'message',
    value: '500',
    valueType: 'number',
    description: '메시지 최대 길이',
    editable: true,
  },
  {
    key: 'FREE_KEYWORD_LIMIT',
    category: 'keyword',
    value: '10',
    valueType: 'number',
    description: '자유 키워드 입력 최대 개수',
    editable: true,
  },
  {
    key: 'RECOMMENDED_KEYWORD_LIMIT',
    category: 'keyword',
    value: '10',
    valueType: 'number',
    description: '추천 키워드 조회 기본 개수',
    editable: true,
  },
  {
    key: 'BRIDGE_MIN_ROUNDS',
    category: 'bridge',
    value: '1',
    valueType: 'number',
    description: '돌다리 신청 최소 라운드',
    editable: true,
  },
  {
    key: 'AUTO_HIDE_REPORT_THRESHOLD',
    category: 'report',
    value: '3',
    valueType: 'number',
    description: '자동 숨김 신고 임계치',
    editable: true,
  },
  {
    key: 'AUTO_SUSPEND_THRESHOLD',
    category: 'report',
    value: '5',
    valueType: 'number',
    description: '자동 정지 신고 임계치',
    editable: true,
  },
  {
    key: 'DUPLICATE_MESSAGE_BLOCK_MINUTES',
    category: 'message',
    value: '10',
    valueType: 'number',
    description: '중복 메시지 차단 시간(분)',
    editable: true,
  },
  {
    key: 'SUBSCRIPTION_EXTRA_CONDITION_LIMIT',
    category: 'subscription',
    value: '3',
    valueType: 'number',
    description: '구독 추가 조건 제한',
    editable: true,
  },
  {
    key: 'EXTRA_SEND_TICKET_PRICE',
    category: 'reward',
    value: '100',
    valueType: 'number',
    description: '추가 전송권 가격',
    editable: true,
  },
];
