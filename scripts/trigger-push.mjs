import { pushReadyContentNotification } from './telegram-bot-service.mjs';

pushReadyContentNotification(5984537762).then(() => {
  console.log('✅ Notifikasi awal berhasil dipush ke Telegram!');
  process.exit(0);
}).catch(console.error);
