// Fix webhook node parameters: path, method, responseMode
import { callMcp } from './n8n-client.mjs';

const WORKFLOW_ID = 'q5xHs8w1RuFABXqU';

async function main() {
  console.log('=== Updating webhook node parameters ===');
  
  const result = await callMcp('update_workflow', {
    workflowId: WORKFLOW_ID,
    operations: [
      {
        type: 'updateNodeParameters',
        nodeName: 'Webhook',
        parameters: {
          path: 'auto-publish-andre',
          httpMethod: 'POST',
          responseMode: 'responseNode',
        },
      },
      {
        type: 'updateNodeParameters',
        nodeName: 'Respond To Webhook',
        parameters: {
          respondWith: 'json',
          responseBody: '={{ JSON.stringify({ status: "received", post_id: $json.body?.post_id, platform: $json.body?.target_platform, topic: $json.body?.topic }) }}',
        },
      },
    ],
    versionName: 'v2 Fixed webhook params',
    versionDescription: 'Set webhook path to auto-publish-andre, method POST, responseMode responseNode. Respond node returns JSON with status.',
  });

  const content = result.content || result;
  if (Array.isArray(content)) {
    content.forEach(c => {
      if (typeof c.text === 'string') console.log(c.text);
      else console.log(JSON.stringify(c, null, 2));
    });
  } else {
    console.log(JSON.stringify(content, null, 2));
  }

  // Publish again to activate changes
  console.log('\n=== Publishing updated workflow ===');
  try {
    const pub = await callMcp('publish_workflow', { workflowId: WORKFLOW_ID });
    console.log('Publish:', JSON.stringify(pub.structuredContent || pub, null, 2));
  } catch (e) {
    console.log('Publish error:', e.message);
  }

  // Verify details
  console.log('\n=== Verifying webhook URL ===');
  const details = await callMcp('get_workflow_details', { workflowId: WORKFLOW_ID });
  const det = details.content || details;
  if (Array.isArray(det)) {
    det.forEach(c => {
      if (typeof c.text === 'string') {
        // Extract trigger info
        if (c.text.includes('triggerInfo')) {
          const parsed = JSON.parse(c.text);
          console.log(parsed.triggerInfo);
        } else if (c.text.includes('Production URL')) {
          console.log(c.text);
        }
      }
    });
  } else {
    const parsed = typeof det === 'string' ? JSON.parse(det) : det;
    if (parsed.triggerInfo) console.log(parsed.triggerInfo);
  }

  // Wait for webhook to register
  console.log('\n=== Testing webhook (waiting 3s for registration) ===');
  await new Promise(r => setTimeout(r, 3000));

  const testPayload = {
    post_id: 'TEST-001',
    topic: 'Test Auto Publish dari Kantor AI',
    target_platform: 'instagram',
    caption: '🤖 Test auto publish - AI & Tech Creator',
  };

  try {
    const res = await fetch('http://localhost:5678/webhook/auto-publish-andre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Response:', body);
    if (res.ok) {
      console.log('\n✅ WEBHOOK BERHASIL! End-to-end connection working!');
    }
  } catch (e) {
    console.error('Webhook error:', e.message);
  }
}

main().catch((e) => console.error('Fatal:', e.message));
