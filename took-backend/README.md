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

## 주요 기능
- 키워드 정규화 (`keyword-normalizer`)
- 동의어 처리
- 추천 키워드 API
- 자유 키워드 입력
- 조건 + 키워드 + trust_score + 최근 활동 기반 매칭
- DB 1차 필터 기반 매칭 최적화
- 매칭 인덱스 제안: docs/matching-indexes.md

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
