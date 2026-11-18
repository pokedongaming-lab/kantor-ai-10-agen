// Helper MCP Client untuk n8n
import dotenv from 'dotenv';
dotenv.config();

const N8N_URL = process.env.N8N_URL || 'http://localhost:5678/mcp-server/http';
const TOKEN = process.env.N8N_API_TOKEN || process.env.N8N_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzdjYjNiOC0xMzE5LTQyZWMtYTJlZi00NDQwMjU5MzQ2OWMiLCJpc3MiOiJuOG4iLCJqdGkiOiJhMzk4MjRhMi1jYTZmLTQ5NzctOGUyNC1mNTc0YWE1YTdlMjciLCJpYXQiOjE3OTQ2NjE3OTIsImF1ZCI6Im1jcC1zZXJ2ZXItYXBpIn0.c61gFCjqAoOLU84IkpElsDlE0XH-8t2gjxzVgVGydeo';

export async function callMcp(toolName, args = {}) {
  const res = await fetch(N8N_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  const text = await res.text();
  const line = text.split('\n').find((l) => l.startsWith('data: '));
  if (!line) throw new Error('No SSE data returned: ' + text);
  const data = JSON.parse(line.slice(6));
  if (data.error) throw new Error(data.error.message);
  return data.result;
}
