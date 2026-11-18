// Get full workflow details including nodes to see webhook path
import { callMcp } from './n8n-client.mjs';

async function main() {
  // Get workflow SDK reference to check how to see nodes
  const details = await callMcp('get_workflow_details', { 
    workflowId: 'q5xHs8w1RuFABXqU',
    includeNodes: true 
  });
  const content = details.content || details;
  if (Array.isArray(content)) {
    content.forEach(c => {
      if (typeof c.text === 'string') console.log(c.text);
      else console.log(JSON.stringify(c, null, 2));
    });
  } else {
    console.log(JSON.stringify(content, null, 2));
  }
}

main().catch((e) => console.error('Fatal:', e.message));
