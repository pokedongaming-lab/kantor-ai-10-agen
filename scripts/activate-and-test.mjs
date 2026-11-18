// Activate workflow & test webhook end-to-end
import { callMcp } from './n8n-client.mjs';

const WORKFLOW_ID = 'q5xHs8w1RuFABXqU';

async function main() {
  // Step 1: Activate (publish) the workflow
  console.log('=== STEP 1: Activating workflow ===');
  try {
    const pubResult = await callMcp('publish_workflow', { workflowId: WORKFLOW_ID });
    const pubContent = pubResult.structuredContent || pubResult;
    console.log('Publish result:', JSON.stringify(pubContent, null, 2));
  } catch (e) {
    console.log('Publish error (may need different approach):', e.message);
    // Try activate instead
    try {
      const actResult = await callMcp('activate_workflow', { workflowId: WORKFLOW_ID });
      console.log('Activate result:', JSON.stringify(actResult.structuredContent || actResult, null, 2));
    } catch (e2) {
      console.log('Activate also failed:', e2.message);
    }
  }

  // Step 2: Test the webhook
  console.log('\n=== STEP 2: Testing webhook ===');
  const testPayload = {
    post_id: 'TEST-001',
    topic: 'Test Auto Publish dari Kantor AI',
    target_platform: 'instagram',
    caption: '🤖 Test auto publish - AI & Tech Creator',
    hashtags: '#AI #Tech #Test',
    scheduled_time: new Date().toISOString(),
  };

  // Try production webhook URL
  const webhookUrl = `http://localhost:5678/webhook/auto-publish-andre`;
  console.log('Sending test payload to:', webhookUrl);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    const body = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', body);

    if (res.ok) {
      console.log('\n✅ Webhook test BERHASIL! End-to-end connection working.');
    } else {
      // Try test webhook URL
      console.log('\nTrying test webhook URL...');
      const testUrl = `http://localhost:5678/webhook-test/auto-publish-andre`;
      const res2 = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });
      const body2 = await res2.text();
      console.log('Test webhook status:', res2.status);
      console.log('Test webhook body:', body2);
    }
  } catch (e) {
    console.error('Webhook test error:', e.message);
  }

  // Step 3: Update auto-publish.mjs env
  console.log('\n=== INFO ===');
  console.log('Webhook URL untuk .env: http://localhost:5678/webhook/auto-publish-andre');
  console.log('Jalankan: PUBLISH_WEBHOOK_URL=http://localhost:5678/webhook/auto-publish-andre npm run publish');
}

main().catch((e) => console.error('Fatal:', e.message));
