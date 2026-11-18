const CLIENT_KEY = 'aw9lveu5ovjjf5et';
const REDIRECT_URI = encodeURIComponent('http://localhost:5678/rest/oauth2-credential/callback');
const SCOPES = encodeURIComponent('user.info.basic,video.upload,video.publish');

// URL resmi otorisasi TikTok OAuth v2
const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPES}&response_type=code&redirect_uri=${REDIRECT_URI}&state=indostill_auth`;

console.log('====================================================');
console.log('🎵 TIKTOK OAUTH2 AUTHORIZATION URL (@indostill.id)');
console.log('====================================================\n');
console.log('Buka tautan ini di browser untuk mengotorisasi akun @indostill.id:');
console.log(authUrl);
console.log('\n====================================================');
