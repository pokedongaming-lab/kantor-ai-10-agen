import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const BASE_DIR = 'C:/Users/admin/kantor-ai-10-agen';
const REMOTION_DIR = path.join(BASE_DIR, 'indostill-video');
const OUTPUT_DIR = path.join(BASE_DIR, 'output', 'videos');

export function renderRemotionVideo() {
  console.log('🚀 Menjalankan Remotion Engine (React Programmatic Video)...');
  const rawOutput = path.join(OUTPUT_DIR, 'video_remotion_deepseek.mp4');
  const optimizedOutput = path.join(OUTPUT_DIR, 'video_remotion_deepseek_optimized.mp4');

  // 1. Render via Remotion CLI
  const renderCmd = `npx remotion render src/index.ts IndostillAnimatedVideo "${rawOutput}"`;
  console.log(`Rendering frames...`);
  execSync(renderCmd, { cwd: REMOTION_DIR, stdio: 'inherit' });

  // 2. Optimasi ukuran berkas via FFmpeg
  console.log(`Mengoptimasi video untuk mobile & Telegram...`);
  const optCmd = `ffmpeg -y -i "${rawOutput}" -c:v libx264 -crf 23 -preset veryfast -c:a aac -b:a 160k -pix_fmt yuv420p -movflags +faststart "${optimizedOutput}"`;
  execSync(optCmd, { stdio: 'inherit' });

  console.log(`✅ Remotion Video Sukses: ${optimizedOutput}`);
  return optimizedOutput;
}

if (process.argv[1] && process.argv[1].endsWith('render-remotion.mjs')) {
  renderRemotionVideo();
}
