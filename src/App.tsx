import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { KANTOR } from './config';
import { IDLE_LABEL, idleAt, isNight, isoDay, lapseAt, missionBoard, officeDesks, params as readParams, type DeskState, type IdleSpot } from './office';
import { CmsDashboard } from './components/CmsDashboard';
import { GlbErrorBoundary } from './components/GlbErrorBoundary';

const OfficeScene = lazy(() => import('./OfficeScene'));
const OfficeScene3D = lazy(() => import('./OfficeScene3D'));

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function App() {
  const p = useMemo(() => readParams(new URLSearchParams(location.search)), []);
  const [viewMode, setViewMode] = useState<'dashboard' | 'office'>('dashboard');
  const [use3D, setUse3D] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [t, setT] = useState(0);
  const [open, setOpen] = useState<DeskState | null>(null);
  const drive = useRef<((t: number) => void) | null>(null);
  const anchors = useRef(new Map<string, HTMLElement>());
  const boardAnchor = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (p.rec) {
      const w = window as unknown as { __koFrame?: (t: number) => boolean };
      w.__koFrame = (x: number) => {
        flushSync(() => setT(x));
        drive.current?.(x);
        return !!drive.current;
      };
      return () => void delete w.__koFrame;
    }
    const start = performance.now();
    const id = window.setInterval(() => {
      setT((performance.now() - start) / 1000);
      setNow(new Date());
    }, 100);
    return () => window.clearInterval(id);
  }, [p.rec]);

  if (viewMode === 'dashboard') {
    return <CmsDashboard onToggleOffice3D={() => setViewMode('office')} />;
  }

  const lapse = p.lapse ? lapseAt(t) : null;
  const time = lapse?.time ?? p.time ?? hm(now);
  // Di Kantor AI 24/7, seluruh 10 agen selalu hadir dan aktif di kantor (tidak pernah pulang/hilang)
  const desks = officeDesks(isoDay(now), time, p.alwaysWork ?? true);
  const board = missionBoard(desks);
  const night = isNight(time);
  const withBubble = desks.filter((d) => d.bubble);
  const spotKey = withBubble.length ? withBubble[Math.floor(t / 2.5) % withBubble.length]!.desk.key : null;

  return (
    <div className="ko" data-night={night || undefined}>
      {/* Floating Toggle Button to AI CMS Dashboard */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', gap: 10 }}>
        <button
          onClick={() => setUse3D((v) => !v)}
          style={{
            backgroundColor: use3D ? '#1a0a2e' : '#0F1322',
            color: use3D ? '#c084fc' : '#aaa',
            border: `2px solid ${use3D ? '#c084fc' : '#444'}`,
            borderRadius: 12,
            padding: '12px 20px',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: use3D ? '0 8px 30px rgba(192,132,252,0.4)' : 'none',
          }}
        >
          🎮 {use3D ? '3D Premium Mode ✓' : '3D Premium Mode'}
        </button>
        <button
          onClick={() => setViewMode('dashboard')}
          style={{
            backgroundColor: '#0F1322',
            color: '#00F0FF',
            border: '2px solid #00F0FF',
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0,240,255,0.4)',
          }}
        >
          📊 BUKA AI CMS DASHBOARD
        </button>
      </div>

      <div className="ko-stage">
        <Suspense fallback={<div className="ko-loading">Menyiapkan kantor…</div>}>
          {use3D ? (
            <GlbErrorBoundary
              agentKey="OfficeScene3D"
              fallback={
                <OfficeScene
                  desks={desks}
                  night={night}
                  boardCount={Math.min(board.items.length, 8)}
                  anchors={anchors}
                  boardAnchor={boardAnchor}
                  cinematic={true}
                  drive={drive}
                />
              }
            >
              <OfficeScene3D
                desks={desks}
                night={night}
                boardCount={Math.min(board.items.length, 8)}
                anchors={anchors}
                boardAnchor={boardAnchor}
                cinematic={true}
                drive={drive}
              />
            </GlbErrorBoundary>
          ) : (
            <OfficeScene
              desks={desks}
              night={night}
              boardCount={Math.min(board.items.length, 8)}
              anchors={anchors}
              boardAnchor={boardAnchor}
              cinematic={true}
              drive={drive}
            />
          )}
        </Suspense>

        {desks.map((d) => {
          const idleResult = idleAt(d.desk.key, t);
          return (
            <Tag
              key={d.desk.key}
              d={d}
              spot={d.desk.key === spotKey}
              idle={idleResult.spot}
              refFn={(el) => {
                if (el) anchors.current.set(d.desk.key, el);
                else anchors.current.delete(d.desk.key);
              }}
              onOpen={() => setOpen(d)}
            />
          );
        })}

        <aside
          className="ko-board"
          ref={(el) => {
            boardAnchor.current = el;
          }}
        >
          <header className="ko-board-hd">
            <h2 className="ko-board-title">{KANTOR.nama}</h2>
            <p className="ko-board-sub">{KANTOR.subjudul}</p>
          </header>
          <ul className="ko-board-list">
            {board.items.slice(0, 8).map((it, i) => (
              <li key={i} className="ko-board-item">
                <span className="ko-board-bullet" style={{ background: it.color }} />
                <span className="ko-board-text">{it.name}: {it.text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {open && (
        <div className="ko-sheet" onClick={() => setOpen(null)}>
          <div className="ko-sheet-in" onClick={(e) => e.stopPropagation()}>
            <h3>
              {open.agen.nama} <small>· {open.desk.room}</small>
            </h3>
            <p className="ko-sheet-sum">
              <strong>Aktivitas:</strong> {open.doing.label}
            </p>
            {open.urgent.length > 0 && (
              <p className="ko-sheet-urgent">
                ⚠ {open.urgent.join(' · ')}
              </p>
            )}
            {open.waiting.length > 0 && (
              <ul>
                {open.waiting.map((w, i) => (
                  <li key={i}>⏳ {w}</li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => setOpen(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ d, spot, idle, refFn, onOpen }: { d: DeskState; spot: boolean; idle: IdleSpot | null; refFn: (el: HTMLElement | null) => void; onOpen: () => void }) {
  const label = idle && idle !== 'meja' ? IDLE_LABEL[idle] : d.doing.label;
  const a = d.doing.activity;
  const think = a === 'kerja' ? '</>' : a === 'laporan' ? '•••' : a === 'belajar' ? '📖' : idle === 'kopi' ? '☕' : idle === 'papan' ? '📌' : idle === 'sofa' ? '💬' : null;
  return (
    <div className="ko-tag" ref={refFn} data-act={a} style={{ ['--agent' as string]: d.desk.color }}>
      <div className="ko-tag-in">
        {d.bubble && spot && a !== 'pulang' && <p className="ko-bubble">{d.bubble}</p>}
        {think && !(d.bubble && spot) && <span className="ko-think">{think}</span>}
        <div className="ko-tag-row">
          <button type="button" className="ko-name" onClick={onOpen}>
            <span className="ko-dot" />
            {d.agen.nama}
            <span className="ko-name-act">{label}</span>
          </button>
          {d.waiting.length > 0 && (
            <button type="button" className="ko-bang" onClick={onOpen} aria-label={`${d.waiting.length} butir menunggu keputusan`}>
              !
            </button>
          )}
          {d.urgent.length > 0 && <span className="ko-urgent">⚠</span>}
        </div>
      </div>
    </div>
  );
}
