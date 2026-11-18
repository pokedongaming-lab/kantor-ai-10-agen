// Activate the workflow (toggle on) and then test
import { callMcp } from './n8n-client.mjs';

const WORKFLOW_ID = 'q5xHs8w1RuFABXqU';

async function main() {
  // List available tools that contain 'activ' or 'toggle'
  console.log('=== Searching for activate tools ===');
  
  // Try activate_workflow tool
  try {
    const r = await callMcp('activate_workflow', { workflowId: WORKFLOW_ID });
    console.log('activate_workflow result:', JSON.stringify(r.structuredContent || r, null, 2));
  } catch (e) {
    console.log('activate_workflow failed:', e.message);
  }

  // Try toggle_workflow
  try {
    const r = await callMcp('toggle_workflow', { workflowId: WORKFLOW_ID, active: true });
    console.log('toggle_workflow result:', JSON.stringify(r.structuredContent || r, null, 2));
  } catch (e) {
    console.log('toggle_workflow failed:', e.message);
  }

  // Try update_workflow 
  try {
    const r = await callMcp('update_workflow', { workflowId: WORKFLOW_ID, active: true });
    console.log('update_workflow result:', JSON.stringify(r.structuredContent || r, null, 2));
  } catch (e) {
    console.log('update_workflow failed:', e.message);
  }

  // Wait and test webhook
  console.log('\n=== Testing webhook after activation ===');
  await new Promise(r => setTimeout(r, 2000));
  
  const testPayload = {
    post_id: 'TEST-001',
    topic: 'Test Auto Publish dari Kantor AI',
    target_platform: 'instagram',
    caption: '🤖 Test auto publish',
  };

  try {
    const res = await fetch('http://localhost:5678/webhook/auto-publish-andre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    console.log('Webhook status:', res.status);
    const body = await res.text();
    console.log('Webhook response:', body);
  } catch (e) {
    console.error('Webhook error:', e.message);
  }
}

main().catch((e) => console.error('Fatal:', e.message));
