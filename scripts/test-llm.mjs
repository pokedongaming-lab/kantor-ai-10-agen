import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.ROUTER_API_URL || 'http://localhost:20128/v1';
const API_KEY = process.env.ROUTER_API_KEY || process.env.API_KEY || 'sk-3bddffff6829d29f-stg200-5e5fbe83';

async function test(modelName, stream = false) {
  console.log(`\nTesting model: ${modelName} (stream: ${stream})`);
  const res = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: 'Halo! Jawab 1 kalimat sapaan kreatif untuk tech creator Andre D\'Andreas.' }],
      stream: stream,
    }),
  });

  const text = await res.text();
  console.log('HTTP Status:', res.status);
  console.log('Response sample:', text.substring(0, 400));
}

async function main() {
  await test('combo03', false);
  await test('combo01', false);
  await test('combo05', false);
}

main().catch(console.error);
