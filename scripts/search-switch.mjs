import { callMcp } from './n8n-client.mjs';

async function main() {
  const nodes = await callMcp('search_nodes', { queries: ['switch', 'httpRequest'] });
  console.log('Search switch/http:');
  const content = nodes.content || nodes;
  if (Array.isArray(content)) {
    content.forEach(c => console.log(c.text || JSON.stringify(c)));
  }
}

main().catch(console.error);
