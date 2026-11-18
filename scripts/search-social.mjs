import { callMcp } from './n8n-client.mjs';

async function main() {
  const nodes = await callMcp('search_nodes', { queries: ['meta', 'facebook', 'http'] });
  console.log('Search results:');
  const content = nodes.content || nodes;
  if (Array.isArray(content)) {
    content.forEach(c => console.log(c.text || JSON.stringify(c)));
  }
}

main().catch(console.error);
