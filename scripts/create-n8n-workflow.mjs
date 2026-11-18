// Validate & Create Auto-Publish Workflow di n8n
import { callMcp } from './n8n-client.mjs';

const workflowCode = `
import { workflow, trigger, node } from '@n8n/workflow-sdk';

const webhookTrigger = trigger({
  name: 'Webhook Trigger',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 2,
  parameters: {
    path: 'auto-publish-andre',
    httpMethod: 'POST',
    responseMode: 'responseNode',
  },
});

const respond = node({
  name: 'Respond to Webhook',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1.1,
  parameters: {
    respondWith: 'json',
    responseBody: '={{ JSON.stringify({ status: "received", post_id: $json.body.post_id, platform: $json.body.target_platform, topic: $json.body.topic }) }}',
  },
});

export default workflow('auto-publish-andre', "Auto-Publish Social Media - Andre D Andreas")
  .add(webhookTrigger)
  .to(respond);
`;

async function main() {
  console.log('=== STEP 1: Validating workflow ===');
  const validation = await callMcp('validate_workflow', { code: workflowCode });
  const valContent = validation.structuredContent || validation;
  console.log('Validation result:', JSON.stringify(valContent, null, 2));

  if (valContent.valid === false) {
    console.error('Workflow is not valid. Fix errors first.');
    if (valContent.errors) console.error('Errors:', valContent.errors);
    process.exit(1);
  }

  console.log('\n=== STEP 2: Creating workflow in n8n ===');
  const creation = await callMcp('create_workflow_from_code', {
    code: workflowCode,
    name: "Auto-Publish Social Media - Andre D'Andreas",
    description: "Workflow webhook receiver untuk auto-publish konten media sosial Andre D'Andreas (Instagram Reels, TikTok, YouTube Shorts) dari Kantor AI 10 Agen.",
    versionName: 'v1 Webhook receiver',
    versionDescription: 'Webhook menerima payload konten dari scripts/auto-publish.mjs dan membalas status JSON.',
  });
  const createContent = creation.structuredContent || creation;
  console.log('Creation result:', JSON.stringify(createContent, null, 2));

  if (createContent.workflowId) {
    console.log('\n✅ Workflow berhasil dibuat!');
    console.log('   Workflow ID:', createContent.workflowId);
    console.log('   Nama:', createContent.name);
    console.log('   URL:', createContent.url);
    if (createContent.targetProject) {
      console.log('   Project:', createContent.targetProject.name, '(' + createContent.targetProject.type + ')');
    }
  } else if (createContent.error) {
    console.error('❌ Gagal membuat workflow:', createContent.error);
  }
}

main().catch((e) => console.error('Fatal:', e.message));
