# CISA 루틴

직장인을 위한 CISA 하루 5분 학습 앱입니다. GitHub Pages로 배포합니다.

## 배포
1. 이 폴더의 파일을 저장소 루트에 그대로 올립니다. `.github` 폴더도 포함해야 알림이 작동합니다.
2. Settings > Pages에서 `main` 브랜치, `/ (root)`를 선택합니다.
3. 휴대폰에서 주소를 열고 홈 화면에 추가합니다.

교재 PDF, 백업 JSON, API 키는 저장소에 올리지 마세요.

## 앱을 닫아도 오는 알림 설정
앱 설정 탭의 안내를 따라 아래 Secrets를 등록합니다 (Settings > Secrets and variables > Actions).

| 이름 | 값 |
|---|---|
| VAPID_PUBLIC_KEY | 앱에서 만든 공개키 |
| VAPID_PRIVATE_KEY | 앱에서 만든 개인키 |
| VAPID_SUBJECT | mailto:본인이메일 |
| PUSH_SUBSCRIPTION | 기기에서 알림 켜기 후 나온 값 (여러 기기면 [값1, 값2]) |

- 알림 시각: `.github/workflows/streak-reminder.yml`의 cron (UTC). 기본은 한국 시간 21시입니다.
- GitHub 예약 실행은 몇 분에서 수십 분 늦을 수 있습니다.
- 저장소에 60일 동안 변경이 없으면 GitHub가 예약 실행을 멈춥니다. 멈추면 Actions 탭에서 다시 켜세요.
- 아이폰은 iOS 16.4 이상에서 홈 화면에 추가한 앱으로 열어야 알림을 받을 수 있습니다.

## 파일
- `index.html` 앱 본체
- `bank-d1.js` ~ `bank-d5.js` 도메인별 연습 문제 100개씩 (공식 출제 범위 기반 자체 작성, 기출이나 덤프 아님)
- `bank-n1.js` ~ `bank-n5.js`, `bank-n4b.js` 정리 노트의 개념을 바탕으로 새로 쓴 추가 문제 175개
- `sw.js` 오프라인 캐시와 알림 처리
- `push/send.mjs` 알림 발송 스크립트

## 학습 자료(PDF)
노트나 교재 PDF는 저장소에 넣지 말고 앱의 자료 탭에서 올리세요. 글자만 추출해 그 기기의 브라우저에만 저장됩니다. 읽기 화면에서 쪽 이동과 검색을 쓸 수 있습니다.
