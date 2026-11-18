// Activate workflow via n8n REST API (not MCP)
async function main() {
  const WORKFLOW_ID = 'q5xHs8w1RuFABXqU';
  
  // n8n REST API to activate workflow
  // PATCH /api/v1/workflows/:id with { active: true }
  const url = `http://localhost:5678/rest/workflows/${WORKFLOW_ID}`;
  
  // First get the owner's API key or use session cookie
  // Let's try using the n8n REST API with the owner endpoint
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Try without auth first - internal call
    },
    body: JSON.stringify({ active: true }),
  });
  
  console.log('Status:', res.status);
  const body = await res.text();
  console.log('Body:', body.substring(0, 500));

  if (res.status === 401 || res.status === 403) {
    console.log('\nTrying with cookie-based auth...');
    // Try the public API endpoint
    const res2 = await fetch(`http://localhost:5678/api/v1/workflows/${WORKFLOW_ID}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('API Status:', res2.status);
    const body2 = await res2.text();
    console.log('API Body:', body2.substring(0, 500));
  }
}

main().catch((e) => console.error('Fatal:', e.message));
