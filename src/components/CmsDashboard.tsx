import React, { useState, useEffect } from 'react';
import css from './CmsDashboard.module.css';

// API Base URL
const API_BASE = '/api/v1';

export interface CmsDashboardProps {
  onToggleOffice3D?: () => void;
}

export const CmsDashboard: React.FC<CmsDashboardProps> = ({ onToggleOffice3D }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('CNT-2026-001');
  const [contentDetail, setContentDetail] = useState<any>(null);
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [communityItems, setCommunityItems] = useState<any[]>([]);
  const [monetizationItems, setMonetizationItems] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [researchData, setResearchData] = useState<any>(null);
  const [autonomousStatus, setAutonomousStatus] = useState<any>({ enabled: true, running: false, cycleCount: 0 });

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
    fetchAutonomousStatus();

    // Polling status otonom setiap 10 detik
    const timer = setInterval(() => {
      fetchAutonomousStatus();
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
      if (json.success) setOverviewData(json.data);
    } catch (e) {
      console.error('Error fetch overview:', e);
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
            <span className={css.dbBadge}>pg:5433</span>

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
