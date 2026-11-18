import React, { useState, useEffect } from 'react';
import css from './CmsDashboard.module.css';
import laporanAgen from '../laporan.json';
import { AGEN } from '../config';

// API Base URL
const API_BASE = '/api/v1';

const DEFAULT_OVERVIEW = {
  stats: {
    totalContent: 8,
    inProduction: 3,
    awaitingApproval: 1,
    scheduled: 4,
    published: 3,
    totalViews: 649000,
    followersGrowth: '+12.4%',
    engagementRate: '8.4%',
    avgRetention: '78.2%',
  },
  recentContents: [
    { content_id: 'CNT-2026-001', title: 'Tutorial DeepSeek R1 di HP', platform: 'TikTok', pillar: 'AI Tools', status: 'PUBLISHED' },
    { content_id: 'CNT-2026-002', title: '3 Tools AI Wajib Mahasiswa', platform: 'Instagram Reels', pillar: 'AI Tools', status: 'IN_PRODUCTION' },
    { content_id: 'CNT-2026-003', title: 'Cara Otomatisasi Medsos Pakai AI', platform: 'YouTube Shorts', pillar: 'AI Automation', status: 'APPROVAL' },
    { content_id: 'CNT-2026-004', title: 'Prompt Engineering Cheatsheet', platform: 'Instagram Carousel', pillar: 'AI Tools', status: 'SCHEDULED' },
  ],
  recentTasks: [
    { agent_key: 'laporan', task_type: 'Audit Kualitas Mutu (CQS 95/100)', status: 'COMPLETED', created_at: new Date().toISOString() },
    { agent_key: 'manajer', task_type: 'Persetujuan Strategi & Distribusi', status: 'COMPLETED', created_at: new Date().toISOString() },
    { agent_key: 'konten', task_type: 'Penulisan Naskah Video Pendek', status: 'COMPLETED', created_at: new Date().toISOString() },
    { agent_key: 'desain', task_type: 'Perancangan Brief Thumbnail Neon Tech', status: 'COMPLETED', created_at: new Date().toISOString() },
  ],
  agentsCount: 10,
  autonomous: { enabled: true, running: false, cycleCount: 1 },
};

const DEFAULT_AGENTS = AGEN.map((ag) => {
  const lap = (laporanAgen as Record<string, any>)[ag.key] || {};
  return {
    id: ag.key,
    agent_key: ag.key,
    name: ag.nama,
    role: ag.tugas,
    model: 'combo03 / combo01 (9Router)',
    status: 'ACTIVE',
    lastTask: {
      task_type: lap.ringkasan ? (lap.ringkasan.length > 55 ? lap.ringkasan.substring(0, 52) + '…' : lap.ringkasan) : 'Siaga Komando',
      status: 'COMPLETED',
    },
  };
});

const DEFAULT_CONTENTS = [
  { content_id: 'CNT-2026-001', title: 'Tutorial DeepSeek R1 di HP: AI Reasoning Lokal', topic: 'DeepSeek-R1', platform: 'TikTok', pillar: 'AI Tools', status: 'PUBLISHED', target_audience: 'Developer & Tech Enthusiast' },
  { content_id: 'CNT-2026-002', title: '3 Tools AI Wajib Mahasiswa & Produktivitas', topic: 'Productivity AI', platform: 'Instagram Reels', pillar: 'AI Tools', status: 'IN_PRODUCTION', target_audience: 'Mahasiswa & Kreator' },
  { content_id: 'CNT-2026-003', title: 'Cara Otomatisasi Medsos Pakai AI & Webhook', topic: 'Browser-Use', platform: 'YouTube Shorts', pillar: 'AI Automation', status: 'APPROVAL', target_audience: 'Solopreneur & Automation Engineer' },
  { content_id: 'CNT-2026-004', title: 'Prompt Engineering Cheatsheet untuk Coding', topic: 'Qwen 2.5-Coder', platform: 'Instagram Carousel', pillar: 'Coding & Tech', status: 'SCHEDULED', target_audience: 'Software Engineers' },
];

const DEFAULT_DETAIL = {
  content: {
    content_id: 'CNT-2026-001',
    title: 'Tutorial DeepSeek R1 di HP: AI Reasoning Lokal Bebas Biaya API',
    topic: 'DeepSeek-R1',
    platform: 'TikTok',
    pillar: 'AI Tools',
    status: 'PUBLISHED',
  },
  script: {
    hook: 'Bayangin punya AI yang bisa mikir kompleks seperti OpenAI o1, tapi bisa kamu jalankan sendiri di komputer!',
    curiosity_gap: 'Kenalin, DeepSeek-R1! Model AI reasoning yang bikin industri teknologi melirik. Kemampuannya dalam matematika, coding, dan penalaran diklaim sebanding dengan OpenAI o1.',
    main_content: 'Yang menarik, model ini punya bobot terbuka. Bahkan, kamu bisa menjalankannya secara lokal menggunakan Ollama. Tinggal buka terminal, ketik: ollama run deepseek-r1.',
    payoff: 'Artinya? Kamu bisa mengurangi ketergantungan pada API berbayar dan, jika dikonfigurasi lokal, data yang kamu proses tidak perlu dikirim ke server AI eksternal.',
    cta: 'Developer, masih mau bakar uang buat API? Save video ini dan tag temanmu yang wajib nyobain!',
    alt_hooks: [
      'OpenAI panik. Model AI murah ini bantai model penalaran mahal!',
      'Stop bayar API mahal! AI reasoning lokal ini gratis selamanya.',
      'Kenapa developer senior mulai beralih ke DeepSeek-R1 di localhost?'
    ],
    caption: 'Tutorial jalankan DeepSeek-R1 lokal tanpa ketergantungan API eksternal. Hemat biaya, privasi terjaga.',
    hashtags: ['#DeepSeekR1', '#LocalAI', '#Ollama', '#OpenSource', '#indostill'],
    visual_directions: 'Split-screen terminal Ollama vs benchmark o1, subtitle sans-serif tebal neon green, closing logo indostill.',
    estimated_duration_sec: 45,
    word_count: 88,
  },
  qc: {
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
    fact_check_report: 'Naskah bebas klise AI. Klaim bobot open-weight & instalasi Ollama valid.',
    revision_notes: 'Lolos uji mutu QA standar industri.',
  },
  approval: {
    decision: 'APPROVED',
    notes: 'Disetujui Bu Ratna untuk auto-publish sesuai jam prime time.',
    approved_by: 'Bu Ratna',
  },
  storyboard: [
    { scene_idx: 1, title: 'Hook Terminal', description: 'Opening punch-in Andre dengan latar belakang server neon.', visual_type: 'TALKING_HEAD' },
    { scene_idx: 2, title: 'Demo Ollama', description: 'Screen recording perintah ollama run deepseek-r1.', visual_type: 'SCREEN_RECORDING' },
    { scene_idx: 3, title: 'CTA & Closing', description: 'Kartu ringkasan tips & badge indostill.id.', visual_type: 'MOTION_GRAPHICS' },
  ],
};

const DEFAULT_CALENDAR = [
  { id: 1, content_id: 'CNT-2026-004', title: 'Prompt Engineering Cheatsheet', platform: 'Instagram Carousel', scheduled_time: '09:00 WIB', target_handle: '@andre.don2', auto_publish: true, status: 'READY' },
  { id: 2, content_id: 'CNT-2026-001', title: 'Tutorial DeepSeek R1 di HP', platform: 'TikTok Feed', scheduled_time: '12:00 WIB', target_handle: '@indostill.id', auto_publish: true, status: 'DISPATCHED' },
  { id: 3, content_id: 'CNT-2026-002', title: '3 Tools AI Wajib Mahasiswa', platform: 'IG Reels', scheduled_time: '17:30 WIB', target_handle: '@andre.don2', auto_publish: true, status: 'READY' },
  { id: 4, content_id: 'CNT-2026-003', title: 'Cara Otomatisasi Medsos Pakai AI', platform: 'YT Shorts', scheduled_time: '19:30 WIB', target_handle: '@andre.don2', auto_publish: false, status: 'WAITING_REVIEW' },
];

const DEFAULT_COMMUNITY = [
  {
    id: 1,
    platform: 'TikTok',
    user_name: 'Rio',
    comment_text: 'Bang Andre, tutorial pasang AI lokal di laptop RAM 8GB dong!',
    sentiment: 'QUESTION',
    category: 'TECHNICAL',
    draft_reply: 'Bisa banget Rio! Pakai Ollama kuantisasi Q4 model 1.5B atau 7B, jalan enteng di RAM 8GB. Konten lengkapnya segera tayang ya!',
    status: 'APPROVED'
  },
  {
    id: 2,
    platform: 'Instagram',
    user_name: 'Sari (Brand Tech)',
    comment_text: 'Halo Mas Andre, kami dari AI SaaS Startup ingin invite review tool kami, ada rate card?',
    sentiment: 'POSITIVE',
    category: 'PARTNERSHIP',
    draft_reply: 'Halo Kak Sari! Terima kasih atas tawarannya. Silakan kirimkan proposal & brief ke email partnership resmi indostill.id ya.',
    status: 'PENDING'
  },
  {
    id: 3,
    platform: 'TikTok',
    user_name: 'Kevin',
    comment_text: 'Bang, tools auto-publish ke TikTok pakai webhook apa yang paling aman dari banned?',
    sentiment: 'QUESTION',
    category: 'TECHNICAL',
    draft_reply: 'Paling aman pakai TikTok Content Posting API resmi yang diintegrasikan lewat n8n/Make, tanpa bot scraping liar ya Kevin!',
    status: 'APPROVED'
  }
];

const DEFAULT_MONETIZATION = [
  {
    id: 1,
    brand_name: 'Cursor IDE Pro',
    campaign_name: 'AI Coding Assistant Referral',
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
    campaign_name: 'Self-Hosted AI Server Promotion',
    utm_link: 'https://indostill.id/ref/hostinger?utm_source=instagram',
    platform: 'Instagram',
    clicks: 860,
    leads: 92,
    ctr: 10.7,
    conversion_rate: 10.6,
    deliverables_status: 'IN_PROGRESS'
  }
];

const DEFAULT_ANALYTICS = {
  summary: {
    totalViews: 649000,
    avgWatchTimeSec: 28.4,
    avgCompletionRate: '68.2%',
    topPerformingHook: 'OpenAI panik. Model AI murah ini bantai model penalaran mahal!',
    bestPostingHour: '19:30 WIB'
  },
  platformBreakdown: [
    { platform: 'TikTok', views: 308000, engagement: '9.4%', shareRate: '4.8%' },
    { platform: 'YouTube Shorts', views: 177000, engagement: '6.1%', shareRate: '2.1%' },
    { platform: 'Instagram Reels', views: 164000, engagement: '7.8%', shareRate: '3.2%' }
  ],
  topContent: [
    { title: 'Tutorial DeepSeek R1 Lokal (TikTok)', views: 120000, retention: '82%', cqs: 95.0 },
    { title: 'Automation n8n Auto Publish (TikTok)', views: 110000, retention: '76%', cqs: 91.5 },
    { title: 'Cara Bikin Web Pakai AI (YT Shorts)', views: 92000, retention: '74%', cqs: 88.0 }
  ],
  recommendations: [
    'Engagement video TikTok DeepSeek melonjak, prioritaskan video part 2 seputar integrasi API.',
    'Optimalkan jam posting Reels pada rentang 17:00 - 18:30 WIB untuk menaikkan retention 15 detik pertama.',
    'Rilis cheatsheet prompt engineering di Carousel IG untuk memaksimalkan saves & shares.'
  ]
};

const DEFAULT_RESEARCH = {
  agent: {
    name: 'Raka',
    role: 'Trend Intelligence & AI Researcher',
    model: 'combo03 / combo01 (9Router)',
    status: 'ACTIVE'
  },
  ideas: [
    {
      id: 1,
      content_id: 'CNT-2026-001',
      title: 'DeepSeek-R1 Lawan OpenAI o1: Model Lokal Bebas Biaya',
      pillar: 'AI Tools',
      trend_source: 'GitHub Trending, Reddit r/LocalLLaMA',
      opportunity_score: 95.0,
      viral_potential: 24.5,
      audience_relevance: 19.5,
      trend_momentum: 19.0,
      share_save_potential: 14.5,
      brand_relevance: 9.5,
      seo_potential: 8.0,
      status: 'APPROVED'
    },
    {
      id: 2,
      content_id: 'CNT-2026-003',
      title: 'Browser-Use: Agentic AI Ambil Alih Otomasi Web',
      pillar: 'AI Automation',
      trend_source: 'GitHub Trending, Twitter/X Tech',
      opportunity_score: 93.5,
      viral_potential: 23.5,
      audience_relevance: 19.0,
      trend_momentum: 19.0,
      share_save_potential: 14.0,
      brand_relevance: 9.5,
      seo_potential: 8.5,
      status: 'APPROVED'
    },
    {
      id: 3,
      content_id: 'CNT-2026-004',
      title: 'Qwen 2.5-Coder di Laptop Spek Rendah (Offline)',
      pillar: 'Coding & Tech',
      trend_source: 'Hugging Face Open LLM, Discord Community',
      opportunity_score: 96.0,
      viral_potential: 24.0,
      audience_relevance: 20.0,
      trend_momentum: 19.5,
      share_save_potential: 15.0,
      brand_relevance: 9.5,
      seo_potential: 8.0,
      status: 'APPROVED'
    }
  ],
  trendRadarSources: [
    { source: 'GitHub Trending', focus: 'Open-Source AI & Local Developer Tools', velocity: 'Very High', status: 'MONITORING' },
    { source: 'Reddit r/LocalLLaMA', focus: 'Quantized LLMs, Ollama, VRAM benchmarks', velocity: 'High', status: 'MONITORING' },
    { source: 'Hugging Face Open LLM', focus: 'Reasoning models, DeepSeek, Qwen2.5', velocity: 'Extreme', status: 'MONITORING' },
    { source: 'TikTok Tech Creators', focus: 'Viral AI workflows, cursor shortcuts', velocity: 'High', status: 'MONITORING' },
    { source: 'Google Trends Indonesia', focus: 'Kecerdasan Buatan, Coding Pemula, AI Tools', velocity: 'Rising', status: 'MONITORING' }
  ],
  scoringGuide: {
    viralPotential: '25% - Hook viral & share impulse',
    audienceRelevance: '20% - Developer & tech creator fit',
    trendMomentum: '20% - Kecepatan lonjakan tren terkini',
    shareSavePotential: '15% - Potensi simpan & referensi',
    personalBrand: '10% - Kesesuaian dengan indostill.id',
    seoPotential: '10% - Volume kata kunci & pencarian'
  }
};

const DEFAULT_TOKEN_METRICS = {
  daily_budget: 100000,
  total_tokens_used: 14280,
  total_calls: 16,
  budget_used_pct: 14.3,
  budget_remaining: 85720,
  status: 'HEALTHY',
  by_agent: [
    { agent_key: 'konten', name: 'Sekar', role: 'Scriptwriter Anti-Slop', lantai: 2, calls: 4, prompt_tokens: 3200, completion_tokens: 2800, total_tokens: 6000, share_pct: '42.0%', last_model: 'combo03', last_active: 'Baru saja', status: 'AMAN' },
    { agent_key: 'riset', name: 'Raka', role: 'AI Trend Intelligence', lantai: 2, calls: 3, prompt_tokens: 2100, completion_tokens: 1450, total_tokens: 3550, share_pct: '24.9%', last_model: 'combo03', last_active: '5 mnt lalu', status: 'AMAN' },
    { agent_key: 'laporan', name: 'Doni', role: 'QA & Fact Checker', lantai: 2, calls: 3, prompt_tokens: 1800, completion_tokens: 620, total_tokens: 2420, share_pct: '16.9%', last_model: 'combo01', last_active: '12 mnt lalu', status: 'AMAN' },
    { agent_key: 'manajer', name: 'Bu Ratna', role: 'Chief Strategist & GM', lantai: 2, calls: 2, prompt_tokens: 820, completion_tokens: 410, total_tokens: 1230, share_pct: '8.6%', last_model: 'combo03', last_active: '18 mnt lalu', status: 'AMAN' },
    { agent_key: 'desain', name: 'Lita', role: 'Visual & Thumbnail Designer', lantai: 2, calls: 1, prompt_tokens: 410, completion_tokens: 220, total_tokens: 630, share_pct: '4.4%', last_model: 'combo05', last_active: '25 mnt lalu', status: 'AMAN' },
    { agent_key: 'pesanan', name: 'Rina', role: 'Jadwal & Auto-Publisher', lantai: 1, calls: 1, prompt_tokens: 180, completion_tokens: 90, total_tokens: 270, share_pct: '1.9%', last_model: 'combo01', last_active: '30 mnt lalu', status: 'AMAN' },
    { agent_key: 'kasir', name: 'Dina', role: 'Analisis Metrik & Views', lantai: 1, calls: 1, prompt_tokens: 120, completion_tokens: 60, total_tokens: 180, share_pct: '1.3%', last_model: 'combo01', last_active: '40 mnt lalu', status: 'AMAN' },
    { agent_key: 'cs', name: 'Fajar', role: 'Community & DM Interaksi', lantai: 1, calls: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, share_pct: '0.0%', last_model: '-', last_active: '-', status: 'AMAN' },
    { agent_key: 'stok', name: 'Bayu', role: 'Bank Aset Media', lantai: 1, calls: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, share_pct: '0.0%', last_model: '-', last_active: '-', status: 'AMAN' },
    { agent_key: 'keuangan', name: 'Sari', role: 'Affiliate & Sponsor Tracker', lantai: 1, calls: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, share_pct: '0.0%', last_model: '-', last_active: '-', status: 'AMAN' },
  ],
  by_model: {
    'combo03 (Gemini 3.8 Flash)': 10780,
    'combo01 (Solar Mini)': 2870,
    'combo05 (StepFun 3.7 Flash)': 630
  },
  recent_logs: [
    { id: 'TOK-101', timestamp: '2026-11-18 21:00:12', agent_key: 'konten', model: 'combo03', prompt_tokens: 820, completion_tokens: 650, total_tokens: 1470 },
    { id: 'TOK-100', timestamp: '2026-11-18 20:55:04', agent_key: 'riset', model: 'combo03', prompt_tokens: 710, completion_tokens: 520, total_tokens: 1230 },
  ],
  updated_at: new Date().toISOString()
};

export interface CmsDashboardProps {
  onToggleOffice3D?: () => void;
}

export const CmsDashboard: React.FC<CmsDashboardProps> = ({ onToggleOffice3D }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Data states initialized with rich local/synchronized fallback data
  const [overviewData, setOverviewData] = useState<any>(DEFAULT_OVERVIEW);
  const [agents, setAgents] = useState<any[]>(DEFAULT_AGENTS);
  const [contents, setContents] = useState<any[]>(DEFAULT_CONTENTS);
  const [selectedContentId, setSelectedContentId] = useState<string>('CNT-2026-001');
  const [contentDetail, setContentDetail] = useState<any>(DEFAULT_DETAIL);
  const [calendarItems, setCalendarItems] = useState<any[]>(DEFAULT_CALENDAR);
  const [communityItems, setCommunityItems] = useState<any[]>(DEFAULT_COMMUNITY);
  const [monetizationItems, setMonetizationItems] = useState<any[]>(DEFAULT_MONETIZATION);
  const [analyticsData, setAnalyticsData] = useState<any>(DEFAULT_ANALYTICS);
  const [researchData, setResearchData] = useState<any>(DEFAULT_RESEARCH);
  const [tokenMetrics, setTokenMetrics] = useState<any>(DEFAULT_TOKEN_METRICS);
  const [autonomousStatus, setAutonomousStatus] = useState<any>({ enabled: true, running: false, cycleCount: 1 });

  // Form states for workflow trigger
  const [newTopic, setNewTopic] = useState<string>('');
  const [newPillar, setNewPillar] = useState<string>('AI Tools');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>('tekno');
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);

  const showNotify = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch initial data
  useEffect(() => {
    fetchOverview();
    fetchAgents();
    fetchContents();
    fetchCalendar();
    fetchCommunity();
    fetchMonetization();
    fetchAnalytics();
    fetchResearch();
    fetchTokens();
    fetchAutonomousStatus();

    // Polling status otonom & token setiap 10 detik
    const timer = setInterval(() => {
      fetchAutonomousStatus();
      fetchTokens();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedContentId) {
      fetchContentDetail(selectedContentId);
    }
  }, [selectedContentId]);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview`);
      const json = await res.json();
      if (json.success) {
        setOverviewData(json.data);
        setIsLiveApi(true);
      }
    } catch (e) {
      // Graceful fallback to local data
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/agents`);
      const json = await res.json();
      if (json.success) setAgents(json.data);
    } catch (e) {
      console.error('Error fetch agents:', e);
    }
  };

  const fetchContents = async () => {
    try {
      const res = await fetch(`${API_BASE}/contents`);
      const json = await res.json();
      if (json.success) {
        setContents(json.data);
        if (json.data.length && !selectedContentId) {
          setSelectedContentId(json.data[0].content_id);
        }
      }
    } catch (e) {
      console.error('Error fetch contents:', e);
    }
  };

  const fetchContentDetail = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/contents/${id}`);
      const json = await res.json();
      if (json.success) setContentDetail(json.data);
    } catch (e) {
      console.error('Error fetch detail:', e);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await fetch(`${API_BASE}/calendar`);
      const json = await res.json();
      if (json.success) setCalendarItems(json.data);
    } catch (e) {}
  };

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`${API_BASE}/community`);
      const json = await res.json();
      if (json.success) setCommunityItems(json.data);
    } catch (e) {}
  };

  const fetchMonetization = async () => {
    try {
      const res = await fetch(`${API_BASE}/monetization`);
      const json = await res.json();
      if (json.success) setMonetizationItems(json.data);
    } catch (e) {}
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      const json = await res.json();
      if (json.success) setAnalyticsData(json.data);
    } catch (e) {}
  };

  const fetchResearch = async () => {
    try {
      const res = await fetch(`${API_BASE}/research`);
      const json = await res.json();
      if (json.success) setResearchData(json.data);
    } catch (e) {
      console.error('Error fetch research:', e);
    }
  };

  const fetchTokens = async () => {
    try {
      const res = await fetch(`${API_BASE}/tokens`);
      const json = await res.json();
      if (json.success) setTokenMetrics(json.data);
    } catch (e) {}
  };

  const fetchAutonomousStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/autonomous/status`);
      const json = await res.json();
      if (json.success) setAutonomousStatus(json.data);
    } catch (e) {}
  };

  const handleToggleAutonomous = async () => {
    try {
      const nextState = !autonomousStatus.enabled;
      const res = await fetch(`${API_BASE}/autonomous/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState })
      });
      const json = await res.json();
      if (json.success) {
        setAutonomousStatus(json.data);
        showNotify(nextState ? 'success' : 'info', `Mode Otonom: ${nextState ? 'Diaktifkan (Running)' : 'Dinonaktifkan'}`);
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  const handleTriggerAutonomousNow = async () => {
    try {
      showNotify('info', 'Memicu siklus otonom 10 agen AI secara langsung...');
      const res = await fetch(`${API_BASE}/autonomous/trigger`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showNotify('success', 'Siklus otonom sedang diproses di background!');
        setTimeout(() => {
          fetchContents();
          fetchResearch();
          fetchOverview();
        }, 3000);
      }
    } catch (e: any) {
      showNotify('error', e.message);
    }
  };

  // Workflow Handlers
  const handleTriggerResearch = async () => {
    if (!newTopic.trim()) {
      showNotify('error', 'Silakan masukkan topik riset terlebih dahulu.');
      return;
    }
    setLoading(true);
    showNotify('info', `Raka sedang meriset tren untuk "${newTopic}"...`);
    try {
      const res = await fetch(`${API_BASE}/workflow/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: newTopic, pillar: newPillar })
      });
      const json = await res.json();
      if (json.success) {
        showNotify('success', `Riset selesai! Content ID: ${json.data.contentId}`);
        setNewTopic('');
        await fetchContents();
        await fetchResearch();
        await fetchOverview();
        setSelectedContentId(json.data.contentId);
        setActiveTab('research');
      } else {
        showNotify('error', json.error || 'Gagal melakukan riset.');
      }
    } catch (err: any) {
      showNotify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScript = async (cid: string) => {
    setLoading(true);
    showNotify('info', `Sekar sedang menyusun naskah 5-Act untuk ${cid}...`);
    try {
      const res = await fetch(`${API_BASE}/workflow/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: cid })
      });
      const json = await res.json();
      if (json.success) {
        showNotify('success', `Naskah selesai ditulis oleh Sekar!`);
        await fetchContentDetail(cid);
        await fetchContents();
        setSelectedContentId(cid);
        setActiveTab('studio');
      } else {
        showNotify('error', json.error || 'Gagal membuat naskah.');
      }
    } catch (err: any) {
      showNotify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerQC = async (cid: string) => {
    setLoading(true);
    showNotify('info', `Doni sedang mengaudit mutu & fact-check untuk ${cid}...`);
    try {
      const res = await fetch(`${API_BASE}/workflow/qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: cid })
      });
      const json = await res.json();
      if (json.success) {
        showNotify('success', `Audit QC selesai! Skor: ${json.data.total_cqs} (${json.data.status})`);
        await fetchContentDetail(cid);
        await fetchContents();
      } else {
        showNotify('error', json.error || 'Gagal audit QC.');
      }
    } catch (err: any) {
      showNotify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerApproval = async (cid: string, decision: 'APPROVED' | 'REVISED') => {
    setLoading(true);
    showNotify('info', `Bu Ratna sedang memproses keputusan editorial untuk ${cid}...`);
    try {
      const res = await fetch(`${API_BASE}/workflow/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: cid, decision, notes: approvalNotes })
      });
      const json = await res.json();
      if (json.success) {
        showNotify('success', `Keputusan Bu Ratna: ${decision}! Status: ${json.data.nextStatus}`);
        setApprovalNotes('');
        await fetchContentDetail(cid);
        await fetchContents();
        await fetchOverview();
      } else {
        showNotify('error', json.error || 'Gagal proses approval.');
      }
    } catch (err: any) {
      showNotify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerPublish = async (cid: string) => {
    setLoading(true);
    showNotify('info', `Rina sedang mengeksekusi publikasi untuk ${cid}...`);
    try {
      const res = await fetch(`${API_BASE}/workflow/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: cid })
      });
      const json = await res.json();
      if (json.success) {
        showNotify('success', `Konten berhasil terbit! Dispatched ke webhook & platform.`);
        await fetchContentDetail(cid);
        await fetchContents();
        await fetchCalendar();
        await fetchOverview();
      } else {
        showNotify('error', json.error || 'Gagal publikasi.');
      }
    } catch (err: any) {
      showNotify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenderStudioMaliki = async (contentId: string, style: string) => {
    if (!contentId) {
      showNotify('error', 'Pilih ID konten terlebih dahulu.');
      return;
    }
    setIsRenderingVideo(true);
    showNotify('info', `Lita & Bayu sedang merancang naskah kinetik & merender video Studio Maliki (${style})...`);
    try {
      const res = await fetch(`${API_BASE}/video/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId, style })
      });
      const json = await res.json();
      if (json.success) {
        showNotify('success', `Video motion Studio Maliki berhasil diproduksi!`);
        await fetchContentDetail(contentId);
        await fetchContents();
        await fetchOverview();
      } else {
        showNotify('error', json.error || 'Gagal merender video.');
      }
    } catch (err: any) {
      showNotify('error', err.message);
    } finally {
      setIsRenderingVideo(false);
    }
  };

  const tabTitle: Record<string, string> = {
    overview: 'Ringkasan operasi',
    agents: 'Tim agen (10)',
    research: 'Riset tren & opportunity — Raka',
    studio: 'Script studio 5-Act — Sekar',
    storyboard: 'Storyboard & video — Lita',
    qc: 'Quality assurance & fact-check — Doni',
    approval: 'Meja approval — Bu Ratna',
    calendar: 'Jadwal rilis & publishing — Rina',
    community: 'Komunitas & sentimen — Fajar',
    monetization: 'Kolaborasi & afiliasi — Sari',
    analytics: 'Analitik performa — Dina',
    tokens: 'Monitor Pemakaian Token Agen',
    settings: 'Pengaturan & model AI',
  };

  const navItems = [
    { group: 'Produksi', items: [
      { key: 'overview', label: 'Ringkasan' },
      { key: 'agents', label: 'Tim agen (10)' },
      { key: 'research', label: 'Riset tren — Raka' },
      { key: 'studio', label: 'Script studio — Sekar' },
      { key: 'storyboard', label: 'Storyboard — Lita' },
      { key: 'qc', label: 'Quality check — Doni' },
      { key: 'approval', label: 'Approval — Bu Ratna' },
      { key: 'calendar', label: 'Jadwal rilis — Rina' },
    ]},
    { group: 'Pertumbuhan', items: [
      { key: 'community', label: 'Komunitas — Fajar' },
      { key: 'monetization', label: 'Kolaborasi — Sari' },
      { key: 'analytics', label: 'Analitik — Dina' },
    ]},
    { group: 'Sistem', items: [
      { key: 'tokens', label: 'Token Monitor' },
      ...(onToggleOffice3D ? [{ key: '3d', label: '3D Office View' }] : []),
      { key: 'settings', label: 'Pengaturan & Model' },
    ]},
  ];

  return (
    <div className={css.shell}>

      {/* ═══ SIDEBAR ═══ */}
      <aside className={css.sidebar}>
        <div className={css.sidebarBrand}>
          <img src="/logo-indostill.png" alt="Logo" className={css.sidebarBrandLogo} />
          <div>
            <div className={css.sidebarBrandName}>indostill.id</div>
            <div className={css.sidebarBrandSub}>AI Content Studio</div>
          </div>
        </div>

        <nav className={css.sidebarNav}>
          {navItems.map((group) => (
            <React.Fragment key={group.group}>
              <div className={css.sidebarLabel}>{group.group}</div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => item.key === '3d' && onToggleOffice3D ? onToggleOffice3D() : setActiveTab(item.key)}
                  className={activeTab === item.key ? css.navBtnActive : (item.key === '3d' ? css.navBtnSpecial : css.navBtn)}
                >
                  <span className={css.navDot} />
                  {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className={css.sidebarFooter}>
          <div className={css.orchestratorStatus}>
            <span className={css.statusDot} />
            <span className={css.orchestratorName}>Bu Ratna — Orchestrator</span>
          </div>
          <div className={css.orchestratorSub}>Pusat komando aktif 24/7</div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main className={css.main}>
        <header className={css.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className={css.pageTitle}>{tabTitle[activeTab] || activeTab}</h1>
            <span className={css.dbBadge} style={{ color: isLiveApi ? 'var(--success)' : 'var(--accent)' }}>
              {isLiveApi ? '● Live API (pg)' : '● Standalone (10 Agen)'}
            </span>

            {/* Autonomous Mode Toggle Badge */}
            <div
              onClick={handleToggleAutonomous}
              className={autonomousStatus.enabled ? css.autonomousBadgeActive : css.autonomousBadgeInactive}
              title="Klik untuk mengubah mode otonom"
            >
              <span>{autonomousStatus.enabled ? '⚡ Otonom: AKTIF' : '⏸️ Otonom: PAUSE'}</span>
              <span style={{ opacity: 0.7 }}>#{autonomousStatus.cycleCount || 0}</span>
            </div>

            <button
              onClick={handleTriggerAutonomousNow}
              className={css.btnSecondary}
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 14 }}
              title="Jalankan satu siklus otonom sekarang"
            >
              Putar Siklus ↻
            </button>
          </div>

          <div className={css.contentSelector}>
            <label className={css.contentSelectorLabel}>Konten aktif:</label>
            <select
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
              className={css.selectInput}
            >
              {contents.map((c) => (
                <option key={c.content_id} value={c.content_id}>
                  {c.content_id} — {c.title?.substring(0, 26)}… ({c.status})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Toast */}
        {notification && (
          <div className={notification.type === 'success' ? css.toastSuccess : notification.type === 'error' ? css.toastError : css.toastInfo}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className={css.toastClose}>×</button>
          </div>
        )}

        {/* Tab Content */}
        <div className={css.content}>

          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && overviewData && (
            <div>
              <div className={css.metricsGrid}>
                <MetricCard label="Total konten" value={overviewData.stats.totalContent} sub={`${overviewData.stats.published} terbit · ${overviewData.stats.inProduction} produksi`} color="var(--accent)" />
                <MetricCard label="Total views" value={overviewData.stats.totalViews.toLocaleString()} sub={overviewData.stats.followersGrowth + ' followers/bln'} color="var(--success)" />
                <MetricCard label="Engagement rate" value={overviewData.stats.engagementRate} sub="TikTok & Instagram Reels" color="var(--warning)" />
                <MetricCard label="Avg retention" value={overviewData.stats.avgRetention} sub="Target studio: >70%" color="var(--danger)" />
              </div>

              {/* Research Input */}
              <div className={css.researchBox}>
                <h3 className={css.researchTitle}>Mulai riset ide konten baru (Raka)</h3>
                <div className={css.researchRow}>
                  <input
                    type="text"
                    placeholder="Contoh: Qwen 2.5-Coder vs Claude 3.5 Sonnet di terminal lokal…"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className={css.inputField}
                  />
                  <select
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value)}
                    className={css.selectField}
                  >
                    <option value="AI Tools">AI Tools</option>
                    <option value="AI News">AI News</option>
                    <option value="Coding & Programming">Coding & Programming</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Tech Experiments">Tech Experiments</option>
                  </select>
                  <button disabled={loading} onClick={handleTriggerResearch} className={css.btnPrimary}>
                    {loading ? 'Memproses…' : 'Jalankan riset'}
                  </button>
                </div>
              </div>

              {/* Kanban Pipeline */}
              <div className={css.kanbanSection}>
                <h3 className={css.kanbanTitle}>Content pipeline</h3>
                <div className={css.kanbanGrid}>
                  {(['RESEARCHED', 'SCRIPT_READY', 'IN_PRODUCTION', 'APPROVAL', 'PUBLISHED'] as const).map((st) => {
                    const filtered = contents.filter(c => c.status === st);
                    const headerClass = {
                      RESEARCHED: css.kanbanColumnHeaderResearched,
                      SCRIPT_READY: css.kanbanColumnHeaderScript,
                      IN_PRODUCTION: css.kanbanColumnHeaderProduction,
                      APPROVAL: css.kanbanColumnHeaderApproval,
                      PUBLISHED: css.kanbanColumnHeaderPublished,
                    }[st];
                    return (
                      <div key={st} className={css.kanbanColumn}>
                        <div className={headerClass}>
                          <span className={css.kanbanStatusLabel}>{st.replace('_', ' ').toLowerCase()}</span>
                          <span className={css.kanbanCount}>{filtered.length}</span>
                        </div>
                        {filtered.map(c => (
                          <div key={c.content_id} className={css.kanbanCard} onClick={() => { setSelectedContentId(c.content_id); setActiveTab('studio'); }}>
                            <div className={css.kanbanCardId}>{c.content_id}</div>
                            <div className={css.kanbanCardTitle}>{c.title?.substring(0, 38)}…</div>
                            <div className={css.kanbanCardPillar}>{c.pillar}</div>
                          </div>
                        ))}
                        {filtered.length === 0 && <div className={css.kanbanEmpty}>Kosong</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ AGENTS (10) ═══ */}
          {activeTab === 'agents' && (
            <div className={css.agentsGrid}>
              {agents.map((ag) => (
                <div key={ag.agent_key} className={css.agentCard}>
                  <div className={css.agentHeader}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={css.agentAvatar} style={{ backgroundColor: ag.agent_key === 'manajer' ? 'var(--danger)' : 'var(--accent)' }}>
                        {ag.name?.charAt(0) || '?'}
                      </div>
                      <div className={css.agentInfo}>
                        <div className={css.agentName}>{ag.name}</div>
                        <div className={css.agentRole}>{ag.role}</div>
                      </div>
                    </div>
                    <span className={css.agentBadge}>{ag.status}</span>
                  </div>
                  <div className={css.agentModel}>
                    Model: <code className={css.agentModelCode}>{ag.model}</code>
                  </div>
                  <div className={css.agentTaskBox}>
                    <div className={css.agentTaskLabel}>Tugas terakhir</div>
                    <div className={css.agentTaskValue}>{ag.lastTask?.task_type || 'Siaga Komando'} ({ag.lastTask?.status || 'Active'})</div>
                  </div>
                  <button onClick={() => showNotify('info', `${ag.name} aktif dalam orkestrasi otonom.`)} className={css.btnSecondary} style={{ width: '100%' }}>
                    Cek aktivitas
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ═══ RESEARCH & TREND RADAR (RAKA) ═══ */}
          {activeTab === 'research' && (
            <div>
              {/* Agent Profile & Trigger */}
              <div className={css.researchBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 className={css.researchTitle}>Raka — Trend Intelligence & SEO Research Specialist</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Memantau GitHub Trending, Reddit r/LocalLLaMA, Hugging Face, dan TikTok Tech untuk mengidentifikasi topik viral sebelum jenuh.
                    </div>
                  </div>
                  <span className={css.agentBadge}>● ACTIVE (combo01)</span>
                </div>

                <div className={css.researchRow}>
                  <input
                    type="text"
                    placeholder="Masukkan topik riset baru untuk Raka..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className={css.inputField}
                  />
                  <select
                    value={newPillar}
                    onChange={(e) => setNewPillar(e.target.value)}
                    className={css.selectField}
                  >
                    <option value="AI Tools">AI Tools</option>
                    <option value="AI News">AI News</option>
                    <option value="Coding & Programming">Coding & Programming</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Tech Experiments">Tech Experiments</option>
                  </select>
                  <button disabled={loading} onClick={handleTriggerResearch} className={css.btnPrimary}>
                    {loading ? 'Meriset…' : 'Riset Tren Baru'}
                  </button>
                </div>
              </div>

              {/* 5 Radar Source Monitors */}
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  📡 Sumber Radar Tren Yang Dipantau Real-Time
                </h4>
                <div className={css.radarGrid}>
                  {researchData?.trendRadarSources?.map((src: any, i: number) => (
                    <div key={i} className={css.radarCard}>
                      <div className={css.radarHeader}>
                        <span className={css.radarSourceName}>{src.source}</span>
                        <span className={css.radarVelocityBadge}>{src.velocity}</span>
                      </div>
                      <div className={css.radarFocus}>{src.focus}</div>
                    </div>
                  )) || (
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Memuat sumber radar...</div>
                  )}
                </div>
              </div>

              {/* Content Opportunity Scoring (COS) Table */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    📊 Daftar Peluang Konten & Skor Peluang (Content Opportunity Score)
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Skor: ≥90 Prioritas Utama · 75-89 Layak Produksi · &lt;75 Perlu Pengembangan
                  </span>
                </div>

                <div className={css.ideasTableContainer}>
                  <table className={css.table}>
                    <thead>
                      <tr>
                        <th>Content ID</th>
                        <th>Topik / Judul Riset</th>
                        <th>Pilar</th>
                        <th>Sumber Tren</th>
                        <th>Skor COS</th>
                        <th>Rincian Bobot (Viral, Aud, Mom, Sh, Br, SEO)</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {researchData?.ideas?.map((item: any) => {
                        const score = parseFloat(item.opportunity_score) || 0;
                        const scoreClass = score >= 90 ? css.scorePillPriority : score >= 75 ? css.scorePillGood : css.scorePillDevelop;
                        const scoreText = score >= 90 ? 'Prioritas' : score >= 75 ? 'Layak' : 'Kembangkan';

                        return (
                          <tr key={item.id}>
                            <td><span className={css.tableId}>{item.content_id}</span></td>
                            <td>
                              <div className={css.tableTitle}>{item.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Target: {item.target_audience || 'Developer & Tech'}</div>
                            </td>
                            <td><span className={css.tableBadge}>{item.pillar}</span></td>
                            <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.trend_source}</td>
                            <td>
                              <span className={scoreClass}>
                                {score} / 100 ({scoreText})
                              </span>
                            </td>
                            <td style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                              V:{item.viral_potential} · A:{item.audience_relevance} · M:{item.trend_momentum} · S:{item.share_save_potential}
                            </td>
                            <td>
                              <span className={css.tableBadge} style={{ color: statusColor(item.content_status || 'RESEARCHED') }}>
                                {item.content_status || 'RESEARCHED'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleTriggerScript(item.content_id)}
                                className={css.btnPrimary}
                                style={{ padding: '4px 10px', fontSize: 11 }}
                              >
                                ✍️ Tulis Naskah
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!researchData?.ideas || researchData.ideas.length === 0) && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)' }}>
                            Belum ada ide konten. Klik "Riset Tren Baru" atau aktifkan Mode Otonom untuk riset otomatis.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scoring Formula Guide */}
              <div className={css.sidebarCard}>
                <h4 className={css.sidebarCardTitle}>📐 Panduan Rumus Content Opportunity Score (100% Total)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div>🔥 <strong>Viral Potential (25%):</strong> Potensi klik pertama & curiosity.</div>
                  <div>🎯 <strong>Audience Relevance (20%):</strong> Kedalaman masalah audiens tech.</div>
                  <div>⚡ <strong>Trend Momentum (20%):</strong> Kecepatan kenaikan di radar tren.</div>
                  <div>💾 <strong>Share & Save (15%):</strong> Nilai simpan referensi & bookmark.</div>
                  <div>👑 <strong>Brand Fit (10%):</strong> Kesesuaian tema indostill.id.</div>
                  <div>🔍 <strong>SEO Search (10%):</strong> Volume kata kunci jangka panjang.</div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SCRIPT STUDIO (SEKAR) ═══ */}
          {activeTab === 'studio' && (
            <div>
              {contentDetail ? (
                <div>
                  <div className={css.studioHeader}>
                    <div>
                      <h2 className={css.studioTitle}>{contentDetail.content.title}</h2>
                      <div className={css.studioMeta}>
                        {contentDetail.content.content_id} · {contentDetail.content.pillar} · <span style={{ color: statusColor(contentDetail.content.status) }}>{contentDetail.content.status}</span>
                      </div>
                    </div>
                    <div className={css.studioActions}>
                      <button onClick={() => handleTriggerScript(contentDetail.content.content_id)} className={css.btnSecondary}>Tulis naskah</button>
                      <button onClick={() => handleTriggerQC(contentDetail.content.content_id)} className={css.btnPrimary}>Kirim ke QC</button>
                    </div>
                  </div>

                  {contentDetail.script ? (
                    <div className={css.scriptGrid}>
                      <div className={css.scriptSections}>
                        <ScriptBlock label="00:00–00:03 Hook" text={contentDetail.script.hook} color="#EF4444" />
                        <ScriptBlock label="00:03–00:10 Curiosity gap" text={contentDetail.script.curiosity_gap} color="#3B82F6" />
                        <ScriptBlock label="00:10–00:25 Main content" text={contentDetail.script.main_content} color="#10B981" />
                        <ScriptBlock label="00:25–00:35 Payoff" text={contentDetail.script.payoff} color="#8B5CF6" />
                        <ScriptBlock label="00:35–00:45 Call to action" text={contentDetail.script.cta} color="#F59E0B" />
                      </div>

                      <div className={css.scriptSidebar}>
                        {/* Anti-Slop Shield */}
                        <div className={css.qualityShield}>
                          <div className={css.shieldHeader}>
                            <span className={css.shieldTitle}>Anti-slop shield</span>
                            <span className={css.shieldBadge}>Passed</span>
                          </div>
                          <div className={css.shieldItem}><span className={css.shieldCheck}>✓</span> Zero AI openers — bebas kata pembuka bot klise</div>
                          <div className={css.shieldItem}><span className={css.shieldCheck}>✓</span> Technical evidence — model & RAM terverifikasi</div>
                          <div className={css.shieldItem}><span className={css.shieldCheck}>✓</span> Senior engineer tone — lugas, solutif</div>
                        </div>

                        <div className={css.sidebarCard}>
                          <h4 className={css.sidebarCardTitle}>Alternatif hook</h4>
                          {contentDetail.script.alt_hooks?.map((h: string, idx: number) => (
                            <div key={idx} className={css.hookOption}>{h}</div>
                          ))}
                        </div>

                        <div className={css.sidebarCard}>
                          <h4 className={css.sidebarCardTitle}>Caption & tagar</h4>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{contentDetail.script.caption}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            {contentDetail.script.hashtags?.map((tag: string, i: number) => (
                              <span key={i} className={css.hashtag}>{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className={css.sidebarCard}>
                          <h4 className={css.sidebarCardTitle}>Estimasi durasi</h4>
                          <div className={css.durationValue}>{contentDetail.script.estimated_duration_sec}s</div>
                          <div className={css.wordCount}>{contentDetail.script.word_count} kata</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={css.emptyState}>
                      <p className={css.emptyText}>Naskah belum dibuat untuk konten ini.</p>
                      <button onClick={() => handleTriggerScript(contentDetail.content.content_id)} className={css.btnPrimary}>
                        Tulis naskah sekarang
                      </button>
                    </div>
                  )}
                </div>
              ) : <div className={css.emptyText}>Pilih konten terlebih dahulu.</div>}
            </div>
          )}

          {/* ═══ STORYBOARD & VIDEO (LITA & BAYU - STUDIO MALIKI) ═══ */}
          {activeTab === 'storyboard' && (
            <div>
              <div className={css.storyboardHeader} style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 className={css.storyboardTitle}>Studio Maliki Motion Engine — Lita & Bayu</h3>
                  <p className={css.storyboardSub}>Render video motion 9:16 otomatis dengan subtitle karaoke, ikon kinetik, dan 14 gaya visual pro</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={selectedContentId}
                    onChange={(e) => setSelectedContentId(e.target.value)}
                    className={css.researchSelect}
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    {contents.map((c) => (
                      <option key={c.content_id} value={c.content_id}>
                        {c.content_id}: {c.title.slice(0, 32)}...
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedVideoStyle}
                    onChange={(e) => setSelectedVideoStyle(e.target.value)}
                    className={css.researchSelect}
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    <option value="tekno">Tekno Gelap Oranye (Indostill)</option>
                    <option value="neon">Neon Cyberpunk</option>
                    <option value="garis">Garis Wireframe</option>
                    <option value="kertas">Kolase Kertas Editorial</option>
                    <option value="sinematik">Panggung Sinematik</option>
                    <option value="kaca">UI Aplikasi Kaca</option>
                    <option value="minimal">Kata Kunci Minimal</option>
                    <option value="retro">Dokumenter Retro</option>
                  </select>

                  <button
                    onClick={() => handleRenderStudioMaliki(selectedContentId, selectedVideoStyle)}
                    disabled={isRenderingVideo}
                    className={css.btnPrimary}
                  >
                    {isRenderingVideo ? '⏳ Rendering Studio Maliki...' : '⚡ Render Video Studio Maliki'}
                  </button>

                  {contentDetail?.content?.publication_url && (
                    <a
                      href={contentDetail.content.publication_url}
                      target="_blank"
                      rel="noreferrer"
                      className={css.btnSecondary}
                      style={{ textDecoration: 'none' }}
                    >
                      Buka fullscreen
                    </a>
                  )}
                </div>
              </div>

              <div className={css.storyboardLayout}>
                <div className={css.videoContainer}>
                  <video
                    key={contentDetail?.content?.publication_url || '/videos/CNT-2026-003_tekno.mp4'}
                    src={contentDetail?.content?.publication_url || '/videos/CNT-2026-003_tekno.mp4'}
                    controls
                    autoPlay
                    loop
                    muted
                    className={css.videoPlayer}
                  />
                </div>

                <div className={css.sceneList}>
                  {contentDetail?.storyboard && contentDetail.storyboard.length > 0 ? (
                    contentDetail.storyboard.map((sc: any, idx: number) => {
                      const colors = ['#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
                      let iconEmoji = '⚡';
                      if (sc.visual_prompt && sc.visual_prompt.includes('Ikon: ')) {
                        const parts = sc.visual_prompt.split('Ikon: ')[1];
                        if (parts) iconEmoji = parts.split(' ')[0] || '⚡';
                      }

                      return (
                        <div key={sc.id || idx} className={css.sceneCard}>
                          <div
                            style={{
                              width: 50,
                              height: 65,
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                              flexShrink: 0
                            }}
                          >
                            {iconEmoji}
                          </div>
                          <div className={css.sceneInfo}>
                            <div className={css.sceneActRow}>
                              <span className={css.sceneAct} style={{ color: colors[idx % colors.length] }}>
                                Scene {sc.scene_idx} · {sc.act}
                              </span>
                              <span className={css.sceneTime}>
                                {Math.floor((sc.start_ms || 0) / 1000)}s - {Math.floor((sc.end_ms || 6000) / 1000)}s
                              </span>
                            </div>
                            <div className={css.sceneTitle}>{sc.scene_title}</div>
                            <div className={css.sceneDetail} style={{ lineHeight: 1.4, margin: '4px 0' }}>
                              "{sc.on_screen_text}"
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                              {sc.visual_prompt}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    [
                      { num: 1, act: 'Hook', title: 'AI canggih di laptop sendiri', time: '00:00–00:05', img: '/scenes/scene1_hook.jpg', color: '#EF4444' },
                      { num: 2, act: 'Curiosity', title: 'DeepSeek-R1 reasoning king', time: '00:05–00:16', img: '/scenes/scene2_curiosity.jpg', color: '#3B82F6' },
                      { num: 3, act: 'Open source', title: 'Open weights & Ollama', time: '00:16–00:24', img: '/scenes/scene3_open_source.jpg', color: '#F59E0B' },
                      { num: 4, act: 'Demo', title: 'Terminal local run', time: '00:24–00:30', img: '/scenes/scene4_terminal.jpg', color: '#10B981' },
                      { num: 5, act: 'Payoff', title: 'Hemat API & privasi aman', time: '00:30–00:39', img: '/scenes/scene5_privacy.jpg', color: '#8B5CF6' },
                      { num: 6, act: 'CTA', title: 'Save & tag teman dev kamu', time: '00:39–00:45', img: '/scenes/scene6_cta.jpg', color: '#F59E0B' },
                    ].map((sc) => (
                      <div key={sc.num} className={css.sceneCard}>
                        <img src={sc.img} alt={sc.title} className={css.sceneImg} />
                        <div className={css.sceneInfo}>
                          <div className={css.sceneActRow}>
                            <span className={css.sceneAct} style={{ color: sc.color }}>Scene {sc.num} · {sc.act}</span>
                            <span className={css.sceneTime}>{sc.time}</span>
                          </div>
                          <div className={css.sceneTitle}>{sc.title}</div>
                          <div className={css.sceneDetail}>Fotografi nyata + Ken Burns zoom + overlay kinetik</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ QC (DONI) ═══ */}
          {activeTab === 'qc' && contentDetail && (
            <div>
              <div className={css.qcHeader}>
                <div>
                  <h3 className={css.qcTitle}>Audit mutu: {contentDetail.content.title}</h3>
                  <p className={css.qcSub}>Doni memeriksa hook-ke-payoff, akurasi klaim, dan hak cipta</p>
                </div>
                <button onClick={() => handleTriggerQC(contentDetail.content.content_id)} className={css.btnPrimary}>
                  Jalankan ulang audit
                </button>
              </div>

              {contentDetail.qc ? (
                <div className={css.qcGrid}>
                  <div className={css.qcScorePanel}>
                    <div className={css.qcScoreHeader}>
                      <span className={css.qcScoreTitle}>Content quality score</span>
                      <span className={contentDetail.qc.status === 'PASS' ? css.qcBadgePass : css.qcBadgeFail}>
                        {contentDetail.qc.status} ({contentDetail.qc.total_cqs}/100)
                      </span>
                    </div>

                    <div className={css.qcBars}>
                      <QcBar label="Hook impact (20%)" score={contentDetail.qc.hook_score} max={20} />
                      <QcBar label="Fact accuracy (20%)" score={contentDetail.qc.fact_score} max={20} />
                      <QcBar label="Storytelling continuity (15%)" score={contentDetail.qc.story_score} max={15} />
                      <QcBar label="Retention & pacing (15%)" score={contentDetail.qc.retention_score} max={15} />
                      <QcBar label="Visual & audio (10%)" score={contentDetail.qc.visual_score} max={10} />
                      <QcBar label="Educational value (10%)" score={contentDetail.qc.edu_score} max={10} />
                      <QcBar label="Call to action (10%)" score={contentDetail.qc.cta_score} max={10} />
                    </div>

                    <div className={css.factCheckBox}>
                      <div className={css.factCheckLabel}>Laporan fact-check</div>
                      <div className={css.factCheckText}>{contentDetail.qc.fact_check_report}</div>
                    </div>
                  </div>

                  <div className={css.qcSidebar}>
                    <div className={css.auditCard}>
                      <div className={css.shieldHeader}>
                        <span className={css.shieldTitle}>Anti-slop audit</span>
                        <span className={css.shieldBadge}>Clean</span>
                      </div>
                      <div className={css.shieldItem}><span className={css.shieldCheck}>✓</span> Banned cliché scan: 0 frasa bot terdeteksi</div>
                      <div className={css.shieldItem}><span className={css.shieldCheck}>✓</span> Technical depth: model, RAM & CLI terverifikasi</div>
                      <div className={css.shieldItem}><span className={css.shieldCheck}>✓</span> Voice seniority: pacing praktisi otentik</div>
                    </div>

                    <div className={css.statusCard}>
                      <h4 className={css.sidebarCardTitle}>Status kelolosan</h4>
                      <div className={css.statusText}>
                        {contentDetail.qc.status === 'PASS'
                          ? 'Konten memenuhi seluruh kriteria mutu (skor ≥ 90). Siap diajukan ke approval Bu Ratna.'
                          : 'Konten membutuhkan perbaikan naskah sebelum disetujui.'}
                      </div>

                      {contentDetail.qc.status === 'PASS' && (
                        <button onClick={() => setActiveTab('approval')} className={css.btnSuccess} style={{ width: '100%', marginTop: 16 }}>
                          Lanjut ke approval
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={css.emptyState}>
                  <p className={css.emptyText}>Audit QC belum dijalankan untuk konten ini.</p>
                  <button onClick={() => handleTriggerQC(contentDetail.content.content_id)} className={css.btnPrimary}>
                    Jalankan audit QC
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ APPROVAL (BU RATNA) ═══ */}
          {activeTab === 'approval' && contentDetail && (
            <div className={css.approvalContainer}>
              <div className={css.approvalPanel}>
                <div className={css.approvalHeader}>
                  <div>
                    <span className={css.approvalBadge}>Executive approval</span>
                    <h2 className={css.approvalTitle}>{contentDetail.content.title}</h2>
                  </div>
                  <div className={css.approvalStatus}>
                    <div className={css.approvalStatusLabel}>Status saat ini</div>
                    <div className={css.approvalStatusValue} style={{ color: statusColor(contentDetail.content.status) }}>
                      {contentDetail.content.status}
                    </div>
                  </div>
                </div>

                {/* Guardrail */}
                <div className={contentDetail.qc?.status === 'PASS' ? css.guardrailPass : css.guardrailFail}>
                  <div className={css.guardrailTitle}>
                    {contentDetail.qc?.status === 'PASS' ? `✓ Lolos QC Doni — skor ${contentDetail.qc.total_cqs}` : '✕ Menunggu kelulusan QC Doni'}
                  </div>
                  <div className={css.guardrailText}>
                    Bu Ratna hanya dapat menerbitkan persetujuan jika skor QC minimal 90 dan tidak ada isu hak cipta.
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className={css.notesLabel}>Catatan arahan editorial</label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan catatan evaluasi atau arahan distribusi…"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className={css.notesInput}
                  />
                </div>

                <div className={css.approvalActions}>
                  <button
                    disabled={loading || contentDetail.qc?.status !== 'PASS'}
                    onClick={() => handleTriggerApproval(contentDetail.content.content_id, 'APPROVED')}
                    className={css.btnSuccess}
                    style={{ flex: 2, opacity: contentDetail.qc?.status === 'PASS' ? 1 : 0.4 }}
                  >
                    Setujui untuk publikasi
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleTriggerApproval(contentDetail.content.content_id, 'REVISED')}
                    className={css.btnWarning}
                    style={{ flex: 1 }}
                  >
                    Minta revisi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ CALENDAR (RINA) ═══ */}
          {activeTab === 'calendar' && (
            <div>
              <div className={css.calendarHeader}>
                <div>
                  <h3 className={css.storyboardTitle}>Antrean rilis & editorial calendar</h3>
                  <p className={css.storyboardSub}>Hanya konten berstatus Approved yang dapat dikirim ke auto-publisher.</p>
                </div>
              </div>

              <div className={css.tableContainer}>
                <table className={css.table}>
                  <thead>
                    <tr>
                      <th>Content ID</th>
                      <th>Judul</th>
                      <th>Platform</th>
                      <th>QC Score</th>
                      <th>Approval</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map((c) => (
                      <tr key={c.content_id}>
                        <td><span className={css.tableId}>{c.content_id}</span></td>
                        <td><span className={css.tableTitle}>{c.title}</span></td>
                        <td>{c.platform}</td>
                        <td>{c.qc_score ? `${c.qc_score}/100` : '—'}</td>
                        <td><span style={{ color: c.approval_status === 'APPROVED' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{c.approval_status}</span></td>
                        <td><span className={css.tableBadge} style={{ color: statusColor(c.status) }}>{c.status}</span></td>
                        <td>
                          {c.status === 'SCHEDULED' ? (
                            <button disabled={loading} onClick={() => handleTriggerPublish(c.content_id)} className={css.btnSuccess}>
                              Rilis sekarang
                            </button>
                          ) : c.status === 'PUBLISHED' ? (
                            <a href={c.publication_url || '/video_deepseek.mp4'} target="_blank" rel="noreferrer" className={css.tableLink}>
                              Lihat video
                            </a>
                          ) : (
                            <span className={css.tablePending}>Menunggu persetujuan</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ COMMUNITY (FAJAR) ═══ */}
          {activeTab === 'community' && (
            <div className={css.communityGrid}>
              {communityItems.map((item, idx) => (
                <div key={idx} className={css.commentCard}>
                  <div className={css.commentHeader}>
                    <span className={css.commentUser}>{item.user_name} ({item.platform})</span>
                    <span className={css.sentimentBadge}>{item.sentiment}</span>
                  </div>
                  <div className={css.commentText}>"{item.comment_text}"</div>
                  <div className={css.replyBox}>
                    <div className={css.replyLabel}>Draft balasan Fajar</div>
                    <div className={css.replyText}>{item.draft_reply}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ MONETIZATION (SARI) ═══ */}
          {activeTab === 'monetization' && (
            <div>
              <div className={css.financialNotice}>
                <strong>Batasan finansial:</strong> Metrik performa difokuskan pada klik, CTR, dan lead tanpa menampilkan nominal pendapatan atau nilai kontrak.
              </div>

              <div className={css.campaignGrid}>
                {monetizationItems.map((c, i) => (
                  <div key={i} className={css.campaignCard}>
                    <div className={css.campaignHeader}>
                      <div>
                        <div className={css.campaignBrand}>{c.brand_name}</div>
                        <div className={css.campaignName}>{c.campaign_name}</div>
                      </div>
                      <span className={css.campaignStatus}>{c.deliverables_status}</span>
                    </div>

                    <div className={css.campaignMetrics}>
                      <div className={css.campaignMetricBox}>
                        <div className={css.campaignMetricLabel}>Klik total</div>
                        <div className={css.campaignMetricValue}>{c.clicks}</div>
                      </div>
                      <div className={css.campaignMetricBox}>
                        <div className={css.campaignMetricLabel}>CTR</div>
                        <div className={css.campaignMetricValue} style={{ color: 'var(--success)' }}>{c.ctr}%</div>
                      </div>
                      <div className={css.campaignMetricBox}>
                        <div className={css.campaignMetricLabel}>Leads</div>
                        <div className={css.campaignMetricValue} style={{ color: 'var(--warning)' }}>{c.leads}</div>
                      </div>
                    </div>

                    <div className={css.utmCode}>
                      Tracking: <code className={css.utmLink}>{c.utm_link}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ ANALYTICS (DINA) ═══ */}
          {activeTab === 'analytics' && analyticsData && (
            <div>
              <div className={css.analyticsGrid}>
                {analyticsData.platformBreakdown.map((p: any, i: number) => (
                  <div key={i} className={css.platformCard}>
                    <div className={css.platformName}>{p.platform}</div>
                    <div className={css.platformViews}>
                      {p.views.toLocaleString()} <span className={css.platformViewsLabel}>views</span>
                    </div>
                    <div className={css.platformRow}>
                      <span>Engagement: <strong>{p.engagement}</strong></span>
                      <span>Share rate: <strong>{p.shareRate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={css.recsPanel}>
                <h4 className={css.recsTitle}>Rekomendasi optimasi pertumbuhan</h4>
                <div className={css.recsList}>
                  {analyticsData.recommendations.map((rec: string, i: number) => (
                    <div key={i} className={css.recItem}>{rec}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ TOKEN USAGE MONITOR ═══ */}
          {activeTab === 'tokens' && tokenMetrics && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Monitor Kuota & Token 10 Agen
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                    Pelacakan konsumsi LLM real-time per agen dan kontrol anggaran harian studio
                  </p>
                </div>
                <button
                  onClick={() => { fetchTokens(); showNotify('info', 'Data pemakaian token diperbarui.'); }}
                  className={css.btnPrimary}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>🔄 Refresh Metrik</span>
                </button>
              </div>

              {/* Stat Cards */}
              <div className={css.statsGrid}>
                <MetricCard
                  label="Total Token Terpakai"
                  value={tokenMetrics.total_tokens_used?.toLocaleString() || 0}
                  sub={`Dari ${tokenMetrics.total_calls || 0} panggilan LLM`}
                  color="var(--accent)"
                />
                <MetricCard
                  label="Anggaran Kuota Harian"
                  value={tokenMetrics.daily_budget?.toLocaleString() || 0}
                  sub="Batas aman harian studio"
                  color="#8B5CF6"
                />
                <MetricCard
                  label="Sisa Kuota Hari Ini"
                  value={tokenMetrics.budget_remaining?.toLocaleString() || 0}
                  sub={`${(100 - (tokenMetrics.budget_used_pct || 0)).toFixed(1)}% kapasitas tersedia`}
                  color="var(--success)"
                />
                <MetricCard
                  label="Status Kuota"
                  value={tokenMetrics.status === 'HEALTHY' ? 'AMAN' : (tokenMetrics.status === 'WARNING' ? 'WASPADA' : 'KRITIS')}
                  sub={tokenMetrics.budget_used_pct >= 90 ? 'Mendekati limit harian' : 'Konsumsi token wajar'}
                  color={tokenMetrics.budget_used_pct >= 90 ? 'var(--danger)' : tokenMetrics.budget_used_pct >= 70 ? 'var(--warning)' : 'var(--success)'}
                />
              </div>

              {/* Progress & Distribution Card */}
              <div className={css.tokenProgressCard}>
                <div className={css.tokenProgressHeader}>
                  <div className={css.tokenProgressTitle}>
                    Konsumsi Anggaran Token Hari Ini
                  </div>
                  <div
                    className={css.tokenProgressPct}
                    style={{
                      color: tokenMetrics.budget_used_pct >= 90 ? 'var(--danger)' : tokenMetrics.budget_used_pct >= 70 ? 'var(--warning)' : 'var(--success)'
                    }}
                  >
                    {tokenMetrics.budget_used_pct}%
                  </div>
                </div>

                <div className={css.tokenTrack}>
                  <div
                    className={css.tokenFill}
                    style={{
                      width: `${Math.min(100, Math.max(2, tokenMetrics.budget_used_pct))}%`,
                      backgroundColor: tokenMetrics.budget_used_pct >= 90 ? 'var(--danger)' : tokenMetrics.budget_used_pct >= 70 ? 'var(--warning)' : 'var(--success)'
                    }}
                  />
                </div>

                <div className={css.tokenSubInfo}>
                  <span>Terpakai: <strong>{tokenMetrics.total_tokens_used?.toLocaleString()} token</strong></span>
                  <span>Maksimal: <strong>{tokenMetrics.daily_budget?.toLocaleString()} token/hari</strong></span>
                </div>

                {/* Model Distribution Pills */}
                {tokenMetrics.by_model && Object.keys(tokenMetrics.by_model).length > 0 && (
                  <div className={css.modelBadgeContainer}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                      Distribusi Model:
                    </span>
                    {Object.entries(tokenMetrics.by_model).map(([model, tok]: [string, any]) => (
                      <div key={model} className={css.modelBadgeItem}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{model}:</span>
                        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{tok.toLocaleString()} tok</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table of 10 Agents */}
              <div className={css.ideasTableContainer}>
                <table className={css.tokenTable}>
                  <thead>
                    <tr>
                      <th>Agen & Peran</th>
                      <th>Lantai</th>
                      <th>Calls</th>
                      <th>Prompt</th>
                      <th>Completion</th>
                      <th>Total Token</th>
                      <th>Porsi</th>
                      <th>Model Terakhir</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokenMetrics.by_agent?.map((ag: any) => (
                      <tr key={ag.agent_key}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={css.agentKeyTag}>{ag.agent_key}</span>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ag.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ag.role}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>
                            {ag.lantai === 2 ? 'L2 (Kreatif)' : 'L1 (Distribusi)'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{ag.calls}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{ag.prompt_tokens?.toLocaleString() || 0}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{ag.completion_tokens?.toLocaleString() || 0}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ag.total_tokens?.toLocaleString() || 0}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{ag.share_pct}</span>
                        </td>
                        <td>
                          <code style={{ fontSize: 11, color: 'var(--warning)' }}>{ag.last_model || '-'}</code>
                        </td>
                        <td>
                          <span className={ag.status === 'KRITIS' ? css.badgeKritis : ag.status === 'WASPADA' ? css.badgeWaspada : css.badgeAman}>
                            {ag.status || 'AMAN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Activity Logs */}
              {tokenMetrics.recent_logs && tokenMetrics.recent_logs.length > 0 && (
                <div style={{ marginTop: 24, background: 'var(--bg-surface)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Riwayat Transaksi Token Terkini
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tokenMetrics.recent_logs.slice(0, 5).map((log: any) => (
                      <div
                        key={log.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'var(--bg-inset)',
                          borderRadius: 6,
                          fontSize: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={css.agentKeyTag}>{log.agent_key}</span>
                          <span style={{ color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>{log.model}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Prompt: {log.prompt_tokens} | Comp: {log.completion_tokens}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                            +{log.total_tokens} tok
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS & MODEL AI ═══ */}
          {activeTab === 'settings' && (
            <div className={css.settingsPanel}>
              <h3 className={css.settingsTitle}>Status koneksi sistem & model AI</h3>
              <div className={css.settingsList}>
                <StatusRow name="Database relasional" status="PostgreSQL 14 port 5433 (WSL Direct vSwitch)" ok={true} />
                <StatusRow name="Otak AI 9Router" status="http://localhost:20128/v1 (combo01, combo02, combo_secretariat)" ok={true} />
                <StatusRow name="Engine otonom multi-agent" status={`Aktif (${autonomousStatus.enabled ? 'Running' : 'Paused'})`} ok={autonomousStatus.enabled} />
                <StatusRow name="Auto-publish webhook" status="http://localhost:5678/webhook/auto-publish-andre" ok={true} />
                <StatusRow name="Telegram commander" status="@agentratna_bot" ok={true} />
                <StatusRow name="Remotion video engine" status="Node.js Chromium headless shell" ok={true} />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

/* ─── Helper Components ─────────────────────────────────────────── */

const MetricCard: React.FC<{ label: string; value: string | number; sub: string; color: string }> = ({
  label, value, sub, color
}) => (
  <div className={css.metricCard}>
    <div className={css.metricLabel}>{label}</div>
    <div className={css.metricValue} style={{ color }}>{value}</div>
    <div className={css.metricSub}>{sub}</div>
  </div>
);

const ScriptBlock: React.FC<{ label: string; text: string; color: string }> = ({ label, text, color }) => (
  <div className={css.scriptBlock} style={{ borderLeftColor: color }}>
    <div className={css.scriptBlockLabel} style={{ color }}>{label}</div>
    <div className={css.scriptBlockText}>{text}</div>
  </div>
);

const QcBar: React.FC<{ label: string; score: number; max: number }> = ({ label, score, max }) => {
  const pct = (score / max) * 100;
  return (
    <div>
      <div className={css.qcBarRow}>
        <span>{label}</span>
        <span className={css.qcBarScore}>{score}/{max}</span>
      </div>
      <div className={css.qcBarTrack}>
        <div className={css.qcBarFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const StatusRow: React.FC<{ name: string; status: string; ok: boolean }> = ({ name, status, ok }) => (
  <div className={css.settingsRow}>
    <span className={css.settingsName}>{name}</span>
    <span className={ok ? css.settingsOk : css.settingsFail}>
      {ok ? '●' : '✕'} {status}
    </span>
  </div>
);

function statusColor(status: string) {
  switch (status) {
    case 'PUBLISHED': return 'var(--success)';
    case 'APPROVAL': return 'var(--accent)';
    case 'SCHEDULED': return 'var(--warning)';
    case 'SCRIPT_READY': return '#8B5CF6';
    case 'RESEARCHED': return '#3B82F6';
    case 'REVISION': return 'var(--danger)';
    default: return 'var(--text-secondary)';
  }
}
