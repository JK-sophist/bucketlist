# Took Backend (NestJS)

Took 서비스 메시징 + 키워드 매칭 구조를 반영한 NestJS 백엔드입니다.

## 핵심 도메인
- messages
- message_recipients
- anonymous_threads
- message_replies
- bridge_requests
- chat_rooms
- chat_messages
- keyword_master
- keyword_synonyms
- user_keywords
- message_keywords
- admin_logs
- admin_policies

## 주요 기능
- 키워드 정규화 (`keyword-normalizer`)
- 동의어 처리
- 추천 키워드 API
- 자유 키워드 입력
- 조건 + 키워드 + trust_score + 최근 활동 기반 매칭
- DB 1차 필터 기반 매칭 최적화
- 차단 관계/최근 N일 발송 이력 기반 후보 제외
- 관리자 기능: 유저/메시지/돌다리/채팅/키워드/정책/로그 관리
- 매칭 인덱스 제안: docs/matching-indexes.md

## 정책 키
- `MATCHING_CANDIDATE_LIMIT`
- `MATCHING_RECENT_EXCLUDE_DAYS`
- `MATCHING_USER_KEYWORD_WEIGHT`
- `MATCHING_MESSAGE_KEYWORD_WEIGHT`

## 실행
```bash
npm install
cp .env.example .env
npm run start:dev
```

## Docker
```bash
docker compose up --build
```
