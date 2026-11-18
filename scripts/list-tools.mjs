// Find all available tools from n8n MCP
import { callMcp } from './n8n-client.mjs';

async function main() {
  const N8N_URL = 'http://localhost:5678/mcp-server/http';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzdjYjNiOC0xMzE5LTQyZWMtYTJlZi00NDQwMjU5MzQ2OWMiLCJpc3MiOiJuOG4iLCJqdGkiOiJhMzk4MjRhMi1jYTZmLTQ5NzctOGUyNC1mNTc0YWE1YTdlMjciLCJpYXQiOjE3OTQ2NjE3OTIsImF1ZCI6Im1jcC1zZXJ2ZXItYXBpIn0.c61gFCjqAoOLU84IkpElsDlE0XH-8t2gjxzVgVGydeo';
  
  const res = await fetch(N8N_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  });
  const text = await res.text();
  const line = text.split('\n').find((l) => l.startsWith('data: '));
  const data = JSON.parse(line.slice(6));
  const tools = data.result.tools;
  
  console.log('Total tools:', tools.length);
  console.log('\nAll tool names:');
  tools.forEach(t => console.log(`  - ${t.name}`));
}

main().catch((e) => console.error('Fatal:', e.message));
