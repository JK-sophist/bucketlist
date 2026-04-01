# Matching Index Suggestions

메시지 중심 매칭에서 DB 1차 필터(`gender`, `region`, `age`)와 정렬(`lastActiveAt`, `trustScore`) 최적화를 위한 권장 인덱스입니다.

## users

```sql
-- 성별/지역/나이 복합 필터
CREATE INDEX IF NOT EXISTS idx_users_gender_region_age
ON users (gender, region, age);

-- 최근 활동 + 신뢰도 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_users_last_active_trust
ON users ("lastActiveAt" DESC, "trustScore" DESC);
```

## user_keywords

```sql
-- 후보 유저 키워드 조회 최적화
CREATE INDEX IF NOT EXISTS idx_user_keywords_user_id
ON user_keywords ("userId");

-- 중복/교집합 연산 보조
CREATE INDEX IF NOT EXISTS idx_user_keywords_user_keyword
ON user_keywords ("userId", "keywordMasterId");
```

## message_keywords

```sql
-- 메시지 키워드 조회 최적화
CREATE INDEX IF NOT EXISTS idx_message_keywords_message_id
ON message_keywords ("messageId");

-- 교집합 연산 보조
CREATE INDEX IF NOT EXISTS idx_message_keywords_message_keyword
ON message_keywords ("messageId", "keywordMasterId");
```
