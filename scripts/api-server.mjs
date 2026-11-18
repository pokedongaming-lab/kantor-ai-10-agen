import express from 'express';
import cors from 'cors';
import { query } from './db.mjs';
import {
  executeResearch,
  executeScriptwriting,
  executeQualityControl,
  executeApproval,
  executePublishing,
} from './ai-orchestrator.mjs';
import {
  getAutonomousStatus,
  setAutonomousEnabled,
  runAutonomousCycle
} from './autonomous-daemon.mjs';
import { renderMalikiVideo, MALIKI_STYLES } from './maliki-video-engine.mjs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. OVERVIEW DASHBOARD STATS
app.get('/api/v1/overview', async (req, res) => {
  try {
    const contentsRes = await query('SELECT * FROM contents ORDER BY created_at DESC');
    const agentsRes = await query('SELECT * FROM agents');
    const tasksRes = await query('SELECT * FROM agent_tasks ORDER BY created_at DESC LIMIT 10');

    const contents = contentsRes.rows;
    const totalContent = contents.length;
    const inProduction = contents.filter(c => ['RESEARCHED', 'SCRIPT_READY', 'IN_PRODUCTION'].includes(c.status)).length;
    const awaitingApproval = contents.filter(c => c.status === 'APPROVAL').length;
    const scheduled = contents.filter(c => c.status === 'SCHEDULED').length;
    const published = contents.filter(c => c.status === 'PUBLISHED').length;

    res.json({
      success: true,
      data: {
        stats: {
          totalContent,
          inProduction,
          awaitingApproval,
          scheduled,
          published,
          totalViews: 148500,
          followersGrowth: '+12.4%',
          engagementRate: '8.6%',
          avgRetention: '76.2%'
        },
        recentContents: contents.slice(0, 5),
        recentTasks: tasksRes.rows,
        agentsCount: agentsRes.rows.length,
        autonomous: getAutonomousStatus()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. AGENTS LIST & MANAGEMENT
app.get('/api/v1/agents', async (req, res) => {
  try {
    const agentsRes = await query('SELECT * FROM agents ORDER BY id ASC');
    const recentTasks = await query(`
      SELECT DISTINCT ON (agent_key) agent_key, task_type, status, created_at
      FROM agent_tasks ORDER BY agent_key, created_at DESC
    `);
    
    const taskMap = {};
    recentTasks.rows.forEach(t => taskMap[t.agent_key] = t);

    const agentsWithTasks = agentsRes.rows.map(a => ({
      ...a,
      lastTask: taskMap[a.agent_key] || { task_type: 'Siaga Komando', status: 'COMPLETED' }
    }));

    res.json({ success: true, data: agentsWithTasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2B. RESEARCH & TREND RADAR (AGENT RAKA)
app.get('/api/v1/research', async (req, res) => {
  try {
    const ideasRes = await query(`
      SELECT ci.*, c.status as content_status, c.target_audience
      FROM content_ideas ci
      LEFT JOIN contents c ON ci.content_id = c.content_id
      ORDER BY ci.created_at DESC
    `);

    const trendRadarSources = [
      { source: 'GitHub Trending', focus: 'Open-Source AI & Local Developer Tools', velocity: 'Very High', status: 'MONITORING' },
      { source: 'Reddit r/LocalLLaMA', focus: 'Quantized LLMs, Ollama, VRAM benchmarks', velocity: 'High', status: 'MONITORING' },
      { source: 'Hugging Face Open LLM', focus: 'Reasoning models, DeepSeek, Qwen2.5', velocity: 'Extreme', status: 'MONITORING' },
      { source: 'TikTok Tech Creators', focus: 'Viral AI workflows, cursor shortcuts', velocity: 'High', status: 'MONITORING' },
      { source: 'Google Trends Indonesia', focus: 'Kecerdasan Buatan, Coding Pemula, AI Tools', velocity: 'Rising', status: 'MONITORING' }
    ];

    res.json({
      success: true,
      data: {
        agent: {
          name: 'Raka',
          role: 'Trend Intelligence & SEO Research Specialist',
          model: 'combo01 (9Router)',
          status: 'ACTIVE'
        },
        ideas: ideasRes.rows,
        trendRadarSources,
        scoringGuide: {
          viralPotential: '25% - Hook viral & share impulse',
          audienceRelevance: '20% - Developer & tech creator fit',
          trendMomentum: '20% - Kecepatan lonjakan tren terkini',
          shareSavePotential: '15% - Potensi simpan & referensi',
          personalBrand: '10% - Kesesuaian dengan indostill.id',
          seoPotential: '10% - Volume kata kunci & pencarian'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2C. AUTONOMOUS PIPELINE CONTROLS
app.get('/api/v1/autonomous/status', (req, res) => {
  res.json({ success: true, data: getAutonomousStatus() });
});

app.post('/api/v1/autonomous/toggle', (req, res) => {
  const { enabled } = req.body;
  const status = setAutonomousEnabled(enabled !== undefined ? enabled : true);
  res.json({ success: true, message: `Mode otonom berhasil diubah`, data: status });
});

app.post('/api/v1/autonomous/trigger', async (req, res) => {
  try {
    runAutonomousCycle(); // Run asynchronous cycle
    res.json({ success: true, message: 'Siklus otonom manual berhasil dipicu!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CONTENTS LIST
app.get('/api/v1/contents', async (req, res) => {
  try {
    const { status, pillar } = req.query;
    let sql = 'SELECT * FROM contents';
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (pillar) {
      params.push(pillar);
      conditions.push(`pillar = $${params.length}`);
    }
    if (conditions.length) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. CONTENT DETAIL (SCRIPT, QC, APPROVAL)
app.get('/api/v1/contents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contentRes = await query('SELECT * FROM contents WHERE content_id = $1', [id]);
    if (!contentRes.rows.length) return res.status(404).json({ success: false, error: 'Konten tidak ditemukan' });

    const content = contentRes.rows[0];
    const scriptRes = await query('SELECT * FROM content_scripts WHERE content_id = $1', [id]);
    const qcRes = await query('SELECT * FROM content_qc WHERE content_id = $1', [id]);
    const approvalRes = await query('SELECT * FROM content_approvals WHERE content_id = $1', [id]);
    const storyboardRes = await query('SELECT * FROM content_storyboards WHERE content_id = $1 ORDER BY scene_idx ASC', [id]);

    res.json({
      success: true,
      data: {
        content,
        script: scriptRes.rows[0] || null,
        qc: qcRes.rows[0] || null,
        approval: approvalRes.rows[0] || null,
        storyboard: storyboardRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. WORKFLOW TRIGGERS
app.post('/api/v1/workflow/research', async (req, res) => {
  try {
    const { topic, pillar } = req.body;
    if (!topic) return res.status(400).json({ success: false, error: 'Topic wajib diisi' });

    const result = await executeResearch(topic, pillar || 'AI Tools');
    res.json({ success: true, message: 'Riset tren selesai!', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/workflow/script', async (req, res) => {
  try {
    const { content_id } = req.body;
    if (!content_id) return res.status(400).json({ success: false, error: 'content_id wajib diisi' });

    const result = await executeScriptwriting(content_id);
    res.json({ success: true, message: 'Naskah video 5-Act berhasil ditulis!', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/workflow/qc', async (req, res) => {
  try {
    const { content_id, is_revision } = req.body;
    if (!content_id) return res.status(400).json({ success: false, error: 'content_id wajib diisi' });

    const result = await executeQualityControl(content_id, !!is_revision);
    res.json({ success: true, message: 'Quality control & fact-check selesai!', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/workflow/approval', async (req, res) => {
  try {
    const { content_id, decision, notes } = req.body;
    if (!content_id) return res.status(400).json({ success: false, error: 'content_id wajib diisi' });

    const result = await executeApproval(content_id, decision || 'APPROVED', notes);
    res.json({ success: true, message: 'Keputusan editorial Bu Ratna telah tercatat!', data: result });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/workflow/publish', async (req, res) => {
  try {
    const { content_id } = req.body;
    if (!content_id) return res.status(400).json({ success: false, error: 'content_id wajib diisi' });

    const result = await executePublishing(content_id);
    res.json({ success: true, message: 'Konten berhasil dipublikasikan!', data: result });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
});

// 5B. STUDIO MALIKI VIDEO ENGINE (LITA & BAYU)
app.get('/api/v1/video/styles', (req, res) => {
  res.json({ success: true, data: MALIKI_STYLES });
});

app.post('/api/v1/video/generate', async (req, res) => {
  try {
    const { content_id, style } = req.body;
    if (!content_id) return res.status(400).json({ success: false, error: 'content_id wajib diisi' });

    console.log(`🎬 API Request: Render Studio Maliki untuk ${content_id} (Gaya: ${style || 'tekno'})`);
    const result = await renderMalikiVideo(content_id, style || 'tekno');
    res.json({ success: true, message: 'Video motion Studio Maliki berhasil diproduksi!', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. EDITORIAL CALENDAR
app.get('/api/v1/calendar', async (req, res) => {
  try {
    const result = await query(`
      SELECT ec.*, c.title, c.pillar, c.qc_score, c.approval_status
      FROM editorial_calendar ec
      JOIN contents c ON ec.content_id = c.content_id
      ORDER BY ec.scheduled_time ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. COMMUNITY & ENGAGEMENT (FAJAR)
app.get('/api/v1/community', async (req, res) => {
  try {
    const commentsRes = await query('SELECT * FROM community_interactions ORDER BY created_at DESC');
    res.json({
      success: true,
      data: commentsRes.rows.length ? commentsRes.rows : [
        {
          id: 1,
          platform: 'TikTok',
          user_name: '@rizky_dev',
          comment_text: 'Bisa jalan di laptop RAM 8GB gak bang buat DeepSeek-R1?',
          sentiment: 'QUESTION',
          category: 'TECHNICAL',
          draft_reply: 'Bisa banget bro! Pakai ukuran 1.5B atau 7B format Q4 lewat Ollama, enteng banget di RAM 8GB. Coba ketik ollama run deepseek-r1:1.5b ya!',
          status: 'APPROVED'
        },
        {
          id: 2,
          platform: 'Instagram',
          user_name: '@sarah.uiux',
          comment_text: 'Keren penjelasannya padat! Bahas agentic AI buat scraping dong',
          sentiment: 'POSITIVE',
          category: 'OPPORTUNITY',
          draft_reply: 'Siap Kak Sarah! Konten berikutnya kita bahas browser-use buat automasi web ya, stay tuned!',
          status: 'PENDING'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. AFFILIATE & PARTNERSHIPS (SARI) - NO FINANCIAL DATA
app.get('/api/v1/monetization', async (req, res) => {
  try {
    const campaignsRes = await query('SELECT * FROM affiliate_campaigns ORDER BY created_at DESC');
    res.json({
      success: true,
      data: campaignsRes.rows.length ? campaignsRes.rows : [
        {
          id: 1,
          brand_name: 'Cursor IDE Pro',
          campaign_name: 'Developer Referral Q4',
          utm_link: 'https://indostill.id/ref/cursor-ai?utm_source=tiktok',
          platform: 'TikTok',
          clicks: 1420,
          leads: 184,
          ctr: 12.9,
          conversion_rate: 13.0,
          deliverables_status: 'COMPLETED'
        },
        {
          id: 2,
          brand_name: 'Hostinger Cloud VPS',
          campaign_name: 'Deploy Local LLM on Cloud',
          utm_link: 'https://indostill.id/ref/hostinger?utm_source=instagram',
          platform: 'Instagram',
          clicks: 860,
          leads: 92,
          ctr: 10.7,
          conversion_rate: 10.6,
          deliverables_status: 'IN_PROGRESS'
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. ANALYTICS & GROWTH REPORTS (DINA)
app.get('/api/v1/analytics', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        summary: {
          totalViews: 148500,
          avgWatchTimeSec: 28.4,
          avgCompletionRate: '68.2%',
          topPerformingHook: 'Model AI reasoning ini bantai OpenAI o1 tapi gratis?!',
          bestPostingHour: '19:30 WIB'
        },
        platformBreakdown: [
          { platform: 'TikTok', views: 98000, engagement: '9.4%', shareRate: '4.8%' },
          { platform: 'Instagram Reels', views: 42500, engagement: '7.8%', shareRate: '3.2%' },
          { platform: 'YouTube Shorts', views: 8000, engagement: '6.1%', shareRate: '2.1%' }
        ],
        topContent: [
          { title: 'DeepSeek-R1: AI Murah Yang Menantang OpenAI', views: 98400, retention: '82%', cqs: 94.5 },
          { title: 'Browser-Use: Agentic AI Web Automation', views: 32100, retention: '74%', cqs: 88.5 }
        ],
        recommendations: [
          'Tingkatkan konten bertema Open-Source AI reasoning karena memiliki retention 18% lebih tinggi dibanding tutorial umum.',
          'Format hook tanya langsung ("Masih bayar API?") menghasilkan completion rate 14% lebih tinggi.',
          'Waktu rilis paling efektif adalah pukul 19:00 - 20:30 WIB pada hari kerja.'
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. SYSTEM SETTINGS
app.get('/api/v1/settings', async (req, res) => {
  try {
    const settingsRes = await query('SELECT * FROM system_settings');
    res.json({ success: true, data: settingsRes.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI CMS BACKEND API SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Base URL: http://localhost:${PORT}/api/v1/overview`);
  console.log(`====================================================`);

  // Start autonomous background loop every 45 seconds
  setInterval(() => {
    runAutonomousCycle();
  }, 45000);
});
