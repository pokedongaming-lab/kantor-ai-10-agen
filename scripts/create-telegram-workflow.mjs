// Helper n8n untuk membuat Command Center Telegram & Router Medsos
import { callMcp } from './n8n-client.mjs';

const telegramCommanderCode = `
import { workflow, trigger, node } from '@n8n/workflow-sdk';

const telegramTrigger = trigger({
  name: 'Telegram Trigger',
  type: 'n8n-nodes-base.telegramTrigger',
  typeVersion: 1.5,
  parameters: {
    updates: ['message'],
  },
});

const sendTelegram = node({
  name: 'Kirim Respon Telegram',
  type: 'n8n-nodes-base.telegram',
  typeVersion: 1.2,
  parameters: {
    resource: 'message',
    operation: 'sendMessage',
    chatId: '={{ $json.message.chat.id }}',
    text: '={{ "🤖 [PUSAT KOMANDO ALEX - ANDRE D\\\'ANDREAS]\\n\\nPesan diterima: " + $json.message.text + "\\n\\nStatus Tim:\\n- IG: @andre.don2 (Siap tayang)\\n- TikTok: @indostill.id (Siap tayang)\\n- Pipeline 10 Agen: Berjalan normal" }}',
  },
});

export default workflow('telegram-command-center', "Pusat Komando Telegram - Alex Lead Manager")
  .add(telegramTrigger)
  .to(sendTelegram);
`;

async function main() {
  console.log('Validating Telegram Commander Workflow...');
  const validation = await callMcp('validate_workflow', { code: telegramCommanderCode });
  console.log('Validation:', JSON.stringify(validation.structuredContent || validation, null, 2));

  console.log('Creating Telegram Commander Workflow in n8n...');
  const creation = await callMcp('create_workflow_from_code', {
    code: telegramCommanderCode,
    name: "Pusat Komando Telegram - Alex Lead Manager",
    description: "Pusat komando interaktif antara Andre D'Andreas dan 10 Agen AI studio via Telegram.",
    versionName: "v1 Telegram Commander",
    versionDescription: "Menerima pesan chat Telegram dan merespons status studio.",
  });
  console.log('Creation:', JSON.stringify(creation.structuredContent || creation, null, 2));
}

main().catch(console.error);
