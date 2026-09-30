// GitHub Actions에서 매일 한 번 실행되어 등록된 기기로 알림을 보냅니다.
// 알림 문구(연속 기록 위험 여부)는 기기의 서비스 워커가 학습 기록을 보고 정합니다.
import webpush from 'web-push';

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, PUSH_SUBSCRIPTION } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) {
  console.error('저장소 Secrets에 VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION을 등록해 주세요.');
  process.exit(1);
}
webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:cisa-routine@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

let subs = JSON.parse(PUSH_SUBSCRIPTION);
if (!Array.isArray(subs)) subs = [subs];

let failed = 0;
for (const s of subs) {
  try {
    const r = await webpush.sendNotification(s, JSON.stringify({ type: 'streak' }), { TTL: 4 * 3600 });
    console.log('보냄', r.statusCode);
  } catch (e) {
    failed++;
    console.error('실패', e.statusCode, e.body);
    if (e.statusCode === 404 || e.statusCode === 410) console.error('구독이 만료됐어요. 앱 설정에서 알림을 다시 켜고 PUSH_SUBSCRIPTION을 갱신하세요.');
  }
}
if (failed === subs.length) process.exit(1);
