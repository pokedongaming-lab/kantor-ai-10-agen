import { callMcp } from './n8n-client.mjs';

async function main() {
  const nodes = await callMcp('search_nodes', { queries: ['telegram', 'instagram', 'tiktok'] });
  console.log('Search nodes result:');
  const content = nodes.content || nodes;
  if (Array.isArray(content)) {
    content.forEach(c => console.log(c.text || JSON.stringify(c)));
  } else {
    console.log(JSON.stringify(content, null, 2));
  }
}

main().catch(console.error);
