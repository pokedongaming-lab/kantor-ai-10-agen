import fs from 'fs';

const CLIENT_KEY = 'aw9lveu5ovjjf5et';
const CLIENT_SECRET = 'qNw62xDzxZlEL3KbfamUWBpzA4eSceR7';
const REDIRECT_URI = 'https://indostillbusiness-dot.github.io/indostill.id/callback';

export async function exchangeTikTokCode(authCode) {
  const verifier = fs.readFileSync('scripts/pkce_verifier.txt', 'utf-8').trim();
  console.log(`Menukar auth code dengan Access Token TikTok resmi (@indostill.id)...`);
  
  const params = new URLSearchParams();
  params.append('client_key', CLIENT_KEY);
  params.append('client_secret', CLIENT_SECRET);
  params.append('code', authCode);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', verifier);

  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body: params.toString(),
  });

  const data = await res.json();
  console.log('Respons Token TikTok:', JSON.stringify(data, null, 2));

  if (data.data && data.data.access_token) {
    const tokenData = {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      open_id: data.data.open_id,
      expires_in: data.data.expires_in,
      scope: data.data.scope,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync('data/tiktok-token.json', JSON.stringify(tokenData, null, 2), 'utf-8');
    console.log('✅ Access Token TikTok berhasil disimpan di data/tiktok-token.json!');
  }

  return data;
}

if (process.argv[2]) {
  exchangeTikTokCode(process.argv[2]).catch(console.error);
}
