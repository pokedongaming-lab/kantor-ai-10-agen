// Parse 9Router models and extract key combos for agent assignment
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.ROUTER_API_URL || 'http://localhost:20128/v1';
const API_KEY = process.env.ROUTER_API_KEY || process.env.API_KEY || 'sk-3bddffff6829d29f-stg200-5e5fbe83';

async function main() {
  const res = await fetch(`${API_URL}/models`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  const data = await res.json();
  
  // Focus on combo models (most efficient) and key ag/cu models
  const combos = data.data.filter(m => m.id.startsWith('combo'));
  const ag = data.data.filter(m => m.id.startsWith('ag/'));
  
  console.log('=== COMBO MODELS ===');
  combos.forEach(m => {
    const c = m.capabilities;
    console.log(`${m.id.padEnd(25)} | ctx:${(c.contextWindow/1000).toFixed(0)}k | out:${(m.max_completion_tokens/1000).toFixed(0)}k | vision:${c.vision?'Y':'N'} | search:${c.search?'Y':'N'} | tools:${c.tools?'Y':'N'} | reasoning:${c.reasoning?'Y':'N'} | think:${c.thinkingFormat||'none'}`);
  });
  
  console.log('\n=== AG MODELS (selected) ===');
  const selected_ag = ag.filter(m => !m.id.includes('-low') && !m.id.includes('-medium'));
  selected_ag.forEach(m => {
    const c = m.capabilities;
    console.log(`${m.id.padEnd(35)} | ctx:${(c.contextWindow/1000).toFixed(0)}k | out:${(m.max_completion_tokens/1000).toFixed(0)}k | vision:${c.vision?'Y':'N'} | search:${c.search?'Y':'N'} | reasoning:${c.reasoning?'Y':'N'} | think:${c.thinkingFormat||'none'}`);
  });

  // Quick test: call combo03 to confirm API works
  console.log('\n=== API Test (combo03) ===');
  const testRes = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'combo03',
      messages: [{ role: 'user', content: 'Jawab singkat: 1+1 = ?' }],
      max_completion_tokens: 50,
    }),
  });
  const testData = await testRes.json();
  console.log('Response:', testData.choices?.[0]?.message?.content || JSON.stringify(testData));
}

main().catch(e => console.error('Error:', e));
