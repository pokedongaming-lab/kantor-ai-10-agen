import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const host = process.env.PG_HOST || 'localhost';
const port = parseInt(process.env.PG_PORT || '5432', 10);

export const pool = new Pool({
  host,
  port,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'aicms',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.warn('⚠️ PostgreSQL pool notice (recovering):', err.message);
});

// In-memory fallback data store when PostgreSQL is offline
const fallbackStore = {
  agents: [
    { id: 1, agent_key: 'manajer', name: 'Bu Ratna', role: 'Chief Content Strategist & Editorial Director', model: 'combo03', status: 'ACTIVE' },
    { id: 2, agent_key: 'riset', name: 'Raka', role: 'Trend Intelligence & SEO Research Specialist', model: 'combo03', status: 'ACTIVE' },
    { id: 3, agent_key: 'konten', name: 'Sekar', role: 'Content Strategist, Scriptwriter & Copywriter', model: 'combo01', status: 'ACTIVE' },
    { id: 4, agent_key: 'desain', name: 'Lita', role: 'Visual Content & Creative Director', model: 'combo05', status: 'ACTIVE' },
    { id: 5, agent_key: 'laporan', name: 'Doni', role: 'Editorial Quality Assurance & Fact Checker', model: 'combo03', status: 'ACTIVE' },
    { id: 6, agent_key: 'stok', name: 'Bayu', role: 'Media Asset & Creative Library Manager', model: 'combo03', status: 'ACTIVE' },
    { id: 7, agent_key: 'pesanan', name: 'Rina', role: 'Content Scheduler & Publishing Operations', model: 'combo03', status: 'ACTIVE' },
    { id: 8, agent_key: 'cs', name: 'Fajar', role: 'Community Growth & Engagement Manager', model: 'combo03', status: 'ACTIVE' },
    { id: 9, agent_key: 'keuangan', name: 'Sari', role: 'Partnership, Sponsorship & Affiliate Analyst', model: 'combo03', status: 'ACTIVE' },
    { id: 10, agent_key: 'kasir', name: 'Dina', role: 'Audience Intelligence & Performance Analyst', model: 'combo03', status: 'ACTIVE' },
  ],
  contents: [
    { id: 1, content_id: 'CNT-2026-001', title: 'Tutorial DeepSeek R1 di HP: AI Reasoning Lokal', topic: 'DeepSeek-R1', platform: 'TikTok', pillar: 'AI Tools', target_audience: 'Developer & Tech Enthusiast', status: 'PUBLISHED', qc_score: 95.0, approval_status: 'APPROVED', created_at: new Date().toISOString() },
    { id: 2, content_id: 'CNT-2026-002', title: '3 Tools AI Wajib Mahasiswa & Produktivitas', topic: 'Productivity AI', platform: 'Instagram Reels', pillar: 'AI Tools', target_audience: 'Mahasiswa & Kreator', status: 'IN_PRODUCTION', qc_score: 92.0, approval_status: 'APPROVED', created_at: new Date().toISOString() },
    { id: 3, content_id: 'CNT-2026-003', title: 'Cara Otomatisasi Medsos Pakai AI & Webhook', topic: 'Browser-Use', platform: 'YouTube Shorts', pillar: 'AI Automation', target_audience: 'Solopreneur & Automation Engineer', status: 'APPROVAL', qc_score: 93.5, approval_status: 'PENDING', created_at: new Date().toISOString() },
    { id: 4, content_id: 'CNT-2026-004', title: 'Prompt Engineering Cheatsheet untuk Coding', topic: 'Qwen 2.5-Coder', platform: 'Instagram Carousel', pillar: 'Coding & Tech', target_audience: 'Software Engineers', status: 'SCHEDULED', qc_score: 96.0, approval_status: 'APPROVED', created_at: new Date().toISOString() }
  ],
  agent_tasks: [
    { task_id: 'TSK-1', agent_key: 'laporan', content_id: 'CNT-2026-001', task_type: 'Audit Kualitas Mutu (CQS 95/100)', status: 'COMPLETED', created_at: new Date().toISOString() },
    { task_id: 'TSK-2', agent_key: 'manajer', content_id: 'CNT-2026-001', task_type: 'Persetujuan Strategi & Distribusi', status: 'COMPLETED', created_at: new Date().toISOString() },
    { task_id: 'TSK-3', agent_key: 'konten', content_id: 'CNT-2026-001', task_type: 'Penulisan Naskah Video Pendek', status: 'COMPLETED', created_at: new Date().toISOString() },
    { task_id: 'TSK-4', agent_key: 'desain', content_id: 'CNT-2026-001', task_type: 'Perancangan Brief Thumbnail Neon Tech', status: 'COMPLETED', created_at: new Date().toISOString() }
  ],
  content_scripts: [
    {
      content_id: 'CNT-2026-001',
      hook: 'Bayangin punya AI yang bisa mikir kompleks seperti OpenAI o1, tapi bisa kamu jalankan sendiri di komputer!',
      curiosity_gap: 'Kenalin, DeepSeek-R1! Model AI reasoning yang bikin industri teknologi melirik.',
      main_content: 'Kamu bisa menjalankannya secara lokal menggunakan Ollama. Tinggal buka terminal, ketik: ollama run deepseek-r1.',
      payoff: 'Artinya kamu bisa mengurangi ketergantungan pada API berbayar dan data lokal 100% aman.',
      cta: 'Developer, masih mau bakar uang buat API? Save video ini dan tag temanmu yang wajib nyobain!',
      alt_hooks: ['OpenAI panik. Model AI murah ini bantai o1!', 'Stop bayar API mahal! AI reasoning lokal gratis selamanya.'],
      caption: 'Tutorial jalankan DeepSeek-R1 lokal tanpa ketergantungan API eksternal.',
      hashtags: ['#DeepSeekR1', '#LocalAI', '#Ollama', '#OpenSource'],
      visual_directions: 'Split-screen terminal Ollama vs benchmark o1, subtitle sans-serif tebal.',
      estimated_duration_sec: 45,
      word_count: 88
    }
  ],
  content_qc: [
    {
      content_id: 'CNT-2026-001',
      hook_score: 19.0,
      story_score: 14.5,
      fact_score: 19.5,
      retention_score: 14.5,
      visual_score: 9.5,
      edu_score: 9.5,
      cta_score: 8.5,
      total_cqs: 95.0,
      status: 'PASS',
      anti_slop_passed: true,
      fact_check_report: 'Naskah bebas klise AI. Klaim bobot open-weight terverifikasi.',
      revision_notes: 'Lolos uji mutu QA standar industri.'
    }
  ],
  content_approvals: [
    { content_id: 'CNT-2026-001', decision: 'APPROVED', notes: 'Disetujui Bu Ratna untuk auto-publish sesuai prime time.', approved_by: 'Bu Ratna' }
  ],
  content_storyboards: [
    { scene_idx: 1, title: 'Hook Terminal', description: 'Opening punch-in Andre dengan latar belakang server neon.', visual_type: 'TALKING_HEAD' },
    { scene_idx: 2, title: 'Demo Ollama', description: 'Screen recording perintah terminal.', visual_type: 'SCREEN_RECORDING' },
    { scene_idx: 3, title: 'CTA & Closing', description: 'Kartu ringkasan tips & badge indostill.id.', visual_type: 'MOTION_GRAPHICS' }
  ],
  content_ideas: [
    { id: 1, content_id: 'CNT-2026-001', title: 'DeepSeek-R1 Lawan OpenAI o1', pillar: 'AI Tools', opportunity_score: 95.0, viral_potential: 24.5, audience_relevance: 19.5, trend_momentum: 19.0, share_save_potential: 14.5, brand_relevance: 9.5, seo_potential: 8.0, status: 'APPROVED' },
    { id: 2, content_id: 'CNT-2026-003', title: 'Browser-Use: Agentic AI Web Automation', pillar: 'AI Automation', opportunity_score: 93.5, viral_potential: 23.5, audience_relevance: 19.0, trend_momentum: 19.0, share_save_potential: 14.0, brand_relevance: 9.5, seo_potential: 8.5, status: 'APPROVED' },
    { id: 3, content_id: 'CNT-2026-004', title: 'Qwen 2.5-Coder di Laptop Spek Rendah', pillar: 'Coding & Tech', opportunity_score: 96.0, viral_potential: 24.0, audience_relevance: 20.0, trend_momentum: 19.5, share_save_potential: 15.0, brand_relevance: 9.5, seo_potential: 8.0, status: 'APPROVED' }
  ],
  editorial_calendar: [
    { id: 1, content_id: 'CNT-2026-004', scheduled_time: '09:00 WIB', title: 'Prompt Engineering Cheatsheet', pillar: 'Coding & Tech', qc_score: 96.0, approval_status: 'APPROVED' },
    { id: 2, content_id: 'CNT-2026-001', scheduled_time: '12:00 WIB', title: 'Tutorial DeepSeek R1 di HP', pillar: 'AI Tools', qc_score: 95.0, approval_status: 'APPROVED' },
    { id: 3, content_id: 'CNT-2026-002', scheduled_time: '17:30 WIB', title: '3 Tools AI Wajib Mahasiswa', pillar: 'AI Tools', qc_score: 92.0, approval_status: 'APPROVED' },
    { id: 4, content_id: 'CNT-2026-003', scheduled_time: '19:30 WIB', title: 'Cara Otomatisasi Medsos Pakai AI', pillar: 'AI Automation', qc_score: 93.5, approval_status: 'PENDING' }
  ],
  community_interactions: [],
  affiliate_campaigns: [],
  system_settings: []
};

let isPgOffline = false;

export async function query(text, params = []) {
  if (!isPgOffline) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.warn(`⚠️ PostgreSQL tidak dapat dihubungi (${err.code || err.message}). Mengaktifkan mode Standalone In-Memory Store.`);
      isPgOffline = true;
    }
  }

  // Handle in-memory fallback query matching
  const t = text.trim();

  if (t.includes('COUNT(*) as count FROM contents')) {
    return { rows: [{ count: fallbackStore.contents.length }] };
  }
  if (t.includes('COUNT(*) as agent_count FROM agents')) {
    return { rows: [{ current_time: new Date().toISOString(), agent_count: fallbackStore.agents.length }] };
  }
  if (t.startsWith('SELECT * FROM agents') || t.includes('FROM agents')) {
    return { rows: fallbackStore.agents };
  }
  if (t.includes('FROM agent_tasks')) {
    return { rows: fallbackStore.agent_tasks };
  }
  if (t.includes('FROM content_scripts WHERE content_id = $1')) {
    return { rows: fallbackStore.content_scripts.filter(s => s.content_id === params[0]) };
  }
  if (t.includes('FROM content_qc WHERE content_id = $1')) {
    return { rows: fallbackStore.content_qc.filter(q => q.content_id === params[0]) };
  }
  if (t.includes('FROM content_approvals WHERE content_id = $1')) {
    return { rows: fallbackStore.content_approvals.filter(a => a.content_id === params[0]) };
  }
  if (t.includes('FROM content_storyboards WHERE content_id = $1')) {
    return { rows: fallbackStore.content_storyboards };
  }
  if (t.includes('FROM content_ideas')) {
    return { rows: fallbackStore.content_ideas };
  }
  if (t.includes('FROM editorial_calendar')) {
    return { rows: fallbackStore.editorial_calendar };
  }
  if (t.includes('FROM contents WHERE content_id = $1')) {
    return { rows: fallbackStore.contents.filter(c => c.content_id === params[0]) };
  }
  if (t.includes('FROM contents')) {
    let result = [...fallbackStore.contents];
    if (params.length > 0) {
      result = result.filter(c => c.status === params[0] || c.pillar === params[0]);
    }
    return { rows: result };
  }
  if (t.includes('FROM community_interactions')) {
    return { rows: fallbackStore.community_interactions };
  }
  if (t.includes('FROM affiliate_campaigns')) {
    return { rows: fallbackStore.affiliate_campaigns };
  }
  if (t.includes('FROM system_settings')) {
    return { rows: fallbackStore.system_settings };
  }
  if (t.startsWith('INSERT INTO contents')) {
    const newContent = {
      content_id: params[0],
      title: params[1],
      topic: params[2],
      pillar: params[3],
      status: 'RESEARCHED',
      platform: 'TikTok',
      created_at: new Date().toISOString()
    };
    fallbackStore.contents.unshift(newContent);
    return { rows: [newContent] };
  }
  if (t.startsWith('UPDATE contents SET status = $1')) {
    const item = fallbackStore.contents.find(c => c.content_id === params[1]);
    if (item) item.status = params[0];
    return { rowCount: 1 };
  }

  // Default empty return
  return { rows: [], rowCount: 0 };
}

export async function testConnection() {
  try {
    const res = await query('SELECT NOW() as current_time, COUNT(*) as agent_count FROM agents');
    console.log(`✅ Database ready (Mode: ${isPgOffline ? 'Standalone In-Memory' : 'PostgreSQL ' + host + ':' + port})`);
    console.log('   Total agents registered:', res.rows[0].agent_count);
    return true;
  } catch (err) {
    console.error('❌ Failed connecting to database:', err.message);
    return false;
  }
}
