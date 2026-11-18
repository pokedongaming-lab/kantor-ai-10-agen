import { callMcp } from './n8n-client.mjs';

async function main() {
  const nodes = await callMcp('search_nodes', { query: 'telegram' });
  console.log('Telegram nodes:', JSON.stringify(nodes, null, 2));

  const creds = await callMcp('list_credentials', {});
  console.log('Available credentials in n8n:', JSON.stringify(creds, null, 2));
}

main().catch(console.error);
