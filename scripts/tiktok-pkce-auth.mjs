import crypto from 'crypto';
import fs from 'fs';

const CLIENT_KEY = 'aw9lveu5ovjjf5et';
const REDIRECT_URI = encodeURIComponent('https://indostillbusiness-dot.github.io/indostill.id/callback');
const SCOPES = encodeURIComponent('user.info.basic,video.upload,video.publish');

// Generate PKCE baru
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

fs.writeFileSync('scripts/pkce_verifier.txt', codeVerifier, 'utf-8');

const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPES}&response_type=code&redirect_uri=${REDIRECT_URI}&state=indostill_auth&code_challenge=${codeChallenge}&code_challenge_method=S256`;

console.log('====================================================');
console.log('🚀 TIKTOK OAUTH2 READY URL (@indostill.id)');
console.log('====================================================\n');
console.log('Buka tautan ini di browser:');
console.log(authUrl);
console.log('\n====================================================');
