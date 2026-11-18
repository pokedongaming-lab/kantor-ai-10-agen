// Try to activate workflow via MCP update_workflow setWorkflowSettings
// Also try to use test_workflow 
import { callMcp } from './n8n-client.mjs';

const WORKFLOW_ID = 'q5xHs8w1RuFABXqU';

async function main() {
  // Approach 1: Try setWorkflowSettings with some dummy setting to see if it activates
  console.log('=== Try get_workflow_details to see current state ===');
  try {
    const details = await callMcp('get_workflow_details', { workflowId: WORKFLOW_ID });
    const content = details.content || details;
    if (Array.isArray(content)) {
      content.forEach(c => console.log(typeof c.text === 'string' ? c.text.substring(0, 1000) : JSON.stringify(c)));
    } else {
      console.log(JSON.stringify(content, null, 2).substring(0, 1000));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Approach 2: test_workflow to trigger webhook manually
  console.log('\n=== Try test_workflow ===');
  try {
    const test = await callMcp('test_workflow', { 
      workflowId: WORKFLOW_ID,
      payload: {
        post_id: 'TEST-001',
        topic: 'Test from MCP',
        target_platform: 'instagram'
      }
    });
    const content = test.content || test;
    if (Array.isArray(content)) {
      content.forEach(c => console.log(typeof c.text === 'string' ? c.text.substring(0, 1000) : JSON.stringify(c)));
    } else {
      console.log(JSON.stringify(content, null, 2).substring(0, 1000));
    }
  } catch (e) {
    console.log('test_workflow error:', e.message);
  }
}

main().catch((e) => console.error('Fatal:', e.message));
