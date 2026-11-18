import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import {
  Caption,
  createTikTokStyleCaptions,
  TikTokPage,
} from "@remotion/captions";
import { TheBoldFont, loadFont } from "../load-font";

/* ------------------------------------------------------------------ */
/*  Interfaces                                                         */
/* ------------------------------------------------------------------ */
export interface SceneConfig {
  id: string;
  act: string;
  title: string;
  tag: string;
  accent: string;
  bgImage: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface IndostillVideoProps {
  titleHook: string;
  categoryTag: string;
  scenes: SceneConfig[];
  audioSrc: string;
  logoSrc: string;
  subtitles: Caption[];
}

const SWITCH_MS = 1400; // switch captions chunk every 1.4s

/* ================================================================== */
/*  INTERACTIVE SCENE OVERLAYS (GLASSMORPHISM & KINETIC GRAPHICS)     */
/* ================================================================== */

/** SCENE 1: Authentic Hero Terminal & Live AI Code Telemetry (Anti-Slop) */
const Scene1Interactive: React.FC<{ progress: number }> = ({ progress }) => {
  const terminalOpacity = interpolate(progress, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
  const terminalScale = interpolate(progress, [0, 0.2], [0.92, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const fullCommand = "ollama run qwen2.5-coder:1.5b";
  const typedCount = Math.floor(interpolate(progress, [0.08, 0.45], [0, fullCommand.length], { extrapolateRight: "clamp" }));
  const displayedCommand = fullCommand.slice(0, typedCount);
  const showOutput = progress > 0.48;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 40px",
      }}
    >
      {/* Authentic High-Craft macOS Terminal Window */}
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          background: "rgba(10, 14, 26, 0.94)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "2px solid rgba(0, 240, 255, 0.5)",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.25)",
          overflow: "hidden",
          opacity: terminalOpacity,
          transform: `scale(${terminalScale})`,
        }}
      >
        {/* Terminal Header Bar */}
        <div
          style={{
            background: "rgba(18, 24, 42, 0.98)",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF5F56" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FFBD2E" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#27C93F" }} />
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              color: "#8899AA",
              letterSpacing: 1,
            }}
          >
            indostill@macbook-pro: ~ (zsh)
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#00F0FF",
              background: "rgba(0, 240, 255, 0.12)",
              padding: "4px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0, 240, 255, 0.4)",
              fontFamily: TheBoldFont,
              letterSpacing: 1,
            }}
          >
            LOCAL ENGINE
          </div>
        </div>

        {/* Terminal Body */}
        <div style={{ padding: "30px 32px", fontFamily: "Consolas, monospace" }}>
          {/* Prompt line */}
          <div style={{ fontSize: 28, color: "#FFF", marginBottom: 16, display: "flex", alignItems: "center" }}>
            <span style={{ color: "#00FF66", marginRight: 12 }}>➜</span>
            <span style={{ color: "#00F0FF", marginRight: 14 }}>~</span>
            <span style={{ color: "#FFE600" }}>{displayedCommand}</span>
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 28,
                background: "#FFE600",
                marginLeft: 4,
                opacity: Math.sin(progress * 40) > 0 ? 1 : 0,
              }}
            />
          </div>

          {/* Model Output & Telemetry */}
          {showOutput && (
            <div style={{ marginTop: 20 }}>
              <div style={{ color: "#00F0FF", fontSize: 20, marginBottom: 12 }}>
                ✓ Model qwen2.5-coder:1.5b loaded into VRAM (0.8s)
              </div>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  padding: "16px 20px",
                  borderRadius: 12,
                  borderLeft: "4px solid #00F0FF",
                  color: "#D0E0F0",
                  fontSize: 22,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ color: "#FF0055" }}>// Zero cloud dependency. 100% Offline.</div>
                <div><span style={{ color: "#FFE600" }}>RAM Usage:</span> 1.18 GB / 8.00 GB</div>
                <div><span style={{ color: "#FFE600" }}>Token Speed:</span> 84 tokens/sec (CPU)</div>
                <div><span style={{ color: "#FFE600" }}>Privacy:</span> No external telemetry packet sent</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Pill Badge */}
      <div
        style={{
          marginTop: 35,
          fontFamily: TheBoldFont,
          fontSize: 26,
          color: "#FFFFFF",
          letterSpacing: 3,
          background: "linear-gradient(90deg, rgba(0, 240, 255, 0.25), rgba(255, 0, 85, 0.25))",
          backdropFilter: "blur(14px)",
          padding: "14px 34px",
          borderRadius: 30,
          border: "2px solid rgba(0, 240, 255, 0.6)",
          boxShadow: "0 10px 35px rgba(0, 240, 255, 0.35)",
        }}
      >
        ⚡ ZERO API COST • 100% LOCAL PRIVACY
      </div>
    </AbsoluteFill>
  );
};

/** SCENE 2: Dual Benchmark Cards (OpenAI o1 vs DeepSeek-R1) */
const Scene2Interactive: React.FC<{ progress: number }> = ({ progress }) => {
  const mathWidth = interpolate(progress, [0.05, 0.65], [0, 97.3], { extrapolateRight: "clamp" });
  const codeWidth = interpolate(progress, [0.15, 0.75], [0, 96.1], { extrapolateRight: "clamp" });
  const reasoningWidth = interpolate(progress, [0.25, 0.85], [0, 95.8], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 50px",
      }}
    >
      {/* Versus Header */}
      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 35 }}>
        <div
          style={{
            background: "rgba(10, 16, 32, 0.85)",
            backdropFilter: "blur(12px)",
            padding: "16px 28px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.25)",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ fontSize: 18, color: "#8899AA", letterSpacing: 1 }}>LOCKED CLOUD</div>
          <div style={{ fontFamily: TheBoldFont, fontSize: 32, color: "#FFF" }}>OpenAI o1</div>
        </div>

        <div
          style={{
            fontFamily: TheBoldFont,
            fontSize: 38,
            color: "#FFE600",
            textShadow: "0 0 25px #FFE600",
          }}
        >
          VS
        </div>

        <div
          style={{
            background: "rgba(0, 30, 50, 0.85)",
            backdropFilter: "blur(12px)",
            padding: "16px 28px",
            borderRadius: 18,
            border: "2px solid #00F0FF",
            textAlign: "center",
            boxShadow: "0 0 35px rgba(0,240,255,0.45)",
          }}
        >
          <div style={{ fontSize: 18, color: "#00F0FF", letterSpacing: 1 }}>OPEN WEIGHTS</div>
          <div style={{ fontFamily: TheBoldFont, fontSize: 32, color: "#FFF" }}>DeepSeek-R1</div>
        </div>
      </div>

      {/* Benchmark Bars Frame */}
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: "rgba(6, 12, 26, 0.88)",
          backdropFilter: "blur(16px)",
          padding: "32px 42px",
          borderRadius: 28,
          border: "2px solid rgba(0,240,255,0.45)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
        }}
      >
        <div style={{ fontFamily: TheBoldFont, fontSize: 24, color: "#00F0FF", marginBottom: 22, letterSpacing: 2 }}>
          ⚡ ACCURACY BENCHMARK SCORE
        </div>

        {/* Math */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#FFF", marginBottom: 8 }}>
            <span>📐 Advanced Mathematics</span>
            <span style={{ color: "#00F0FF", fontFamily: TheBoldFont }}>97.3%</span>
          </div>
          <div style={{ height: 18, background: "#111a30", borderRadius: 9, overflow: "hidden" }}>
            <div style={{ width: `${mathWidth}%`, height: "100%", background: "linear-gradient(90deg, #00F0FF, #00FF66)", borderRadius: 9, boxShadow: "0 0 15px #00F0FF" }} />
          </div>
        </div>

        {/* Coding */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#FFF", marginBottom: 8 }}>
            <span>💻 Python & Coding Eval</span>
            <span style={{ color: "#00FF66", fontFamily: TheBoldFont }}>96.1%</span>
          </div>
          <div style={{ height: 18, background: "#111a30", borderRadius: 9, overflow: "hidden" }}>
            <div style={{ width: `${codeWidth}%`, height: "100%", background: "linear-gradient(90deg, #00FF66, #FFE600)", borderRadius: 9, boxShadow: "0 0 15px #00FF66" }} />
          </div>
        </div>

        {/* Logic Reasoning */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#FFF", marginBottom: 8 }}>
            <span>🧩 Multi-Step Logic Reasoning</span>
            <span style={{ color: "#FFB800", fontFamily: TheBoldFont }}>95.8%</span>
          </div>
          <div style={{ height: 18, background: "#111a30", borderRadius: 9, overflow: "hidden" }}>
            <div style={{ width: `${reasoningWidth}%`, height: "100%", background: "linear-gradient(90deg, #FFB800, #FF0055)", borderRadius: 9, boxShadow: "0 0 15px #FFB800" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** SCENE 3: Open Source Vault & Ollama */
const Scene3Interactive: React.FC<{ progress: number }> = ({ progress }) => {
  const bounce = Math.sin(progress * Math.PI * 3) * 12;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Glowing Lock Box */}
      <div
        style={{
          width: 360,
          height: 320,
          background: "rgba(10, 15, 30, 0.85)",
          backdropFilter: "blur(16px)",
          border: "3px solid #FFB800",
          borderRadius: 36,
          boxShadow: "0 0 70px rgba(255,184,0,0.55)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${bounce}px)`,
        }}
      >
        <div style={{ fontSize: 95 }}>🔓</div>
        <div style={{ fontFamily: TheBoldFont, fontSize: 34, color: "#FFF", marginTop: 8 }}>OPEN WEIGHTS</div>
        <div style={{ fontSize: 20, color: "#FFB800", letterSpacing: 2 }}>MIT / APACHE 2.0</div>
      </div>

      {/* Model sizes */}
      <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
        {["7B Laptop", "14B Workstation", "32B Studio", "70B Cluster"].map((variant, i) => (
          <div
            key={i}
            style={{
              background: "rgba(5, 10, 25, 0.88)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,184,0,0.5)",
              padding: "14px 22px",
              borderRadius: 16,
              color: "#FFF",
              fontFamily: TheBoldFont,
              fontSize: 22,
              boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
            }}
          >
            📦 {variant}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** SCENE 4: Terminal Window (ollama run deepseek-r1) */
const Scene4Interactive: React.FC<{ progress: number }> = ({ progress }) => {
  const fullCommand = "ollama run deepseek-r1";
  const typedCount = Math.floor(interpolate(progress, [0.05, 0.45], [0, fullCommand.length], { extrapolateRight: "clamp" }));
  const commandTyped = fullCommand.slice(0, typedCount);

  const showSuccess = progress > 0.52;
  const showTokens = progress > 0.72;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 50px",
      }}
    >
      {/* Terminal Window Frame */}
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          background: "rgba(4, 9, 18, 0.92)",
          backdropFilter: "blur(18px)",
          borderRadius: 24,
          border: "2px solid #00FF66",
          boxShadow: "0 0 65px rgba(0,255,102,0.45)",
          overflow: "hidden",
          fontFamily: "monospace",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: "#0c1524",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FF5F56" }} />
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FFBD2E" }} />
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#27C93F" }} />
          <div style={{ color: "#8899AA", fontSize: 20, marginLeft: 20 }}>terminal - bash (1080x1920)</div>
        </div>

        {/* Terminal Content */}
        <div style={{ padding: "35px 30px", minHeight: 390, fontSize: 32, lineHeight: 1.6 }}>
          <div style={{ color: "#FFF" }}>
            <span style={{ color: "#00FF66" }}>user@indostill-pc</span>:<span style={{ color: "#00F0FF" }}>~</span>${" "}
            <span style={{ color: "#FFE600", fontWeight: "bold" }}>{commandTyped}</span>
            <span style={{ animation: "blink 1s infinite", color: "#00FF66" }}>|</span>
          </div>

          {showSuccess && (
            <div style={{ color: "#00FF66", marginTop: 25, fontSize: 26 }}>
              <div>[✓] Model weights verified (Offline)</div>
              <div>[✓] GPU VRAM allocated: 5.4 GB</div>
              <div>[✓] DeepSeek-R1 reasoning engine ready!</div>
            </div>
          )}

          {showTokens && (
            <div
              style={{
                marginTop: 25,
                background: "rgba(0,255,102,0.12)",
                padding: "16px 20px",
                borderRadius: 14,
                color: "#FFFFFF",
                fontSize: 24,
                border: "1px dashed #00FF66",
              }}
            >
              🚀 <strong>AI BERJALAN 100% LOKAL DI LAPTOP!</strong>
              <div style={{ color: "#00F0FF", marginTop: 6 }}>Kecepatan: 42 tokens/sec (Tanpa Internet)</div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** SCENE 5: Payoff & Privacy Shield */
const Scene5Interactive: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 35,
      }}
    >
      {/* Cost Reduction Card */}
      <div
        style={{
          width: 820,
          background: "rgba(10, 6, 25, 0.88)",
          backdropFilter: "blur(16px)",
          border: "2px solid #B026FF",
          borderRadius: 26,
          padding: "28px 38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 0 50px rgba(176,38,255,0.45)",
        }}
      >
        <div>
          <div style={{ fontSize: 22, color: "#D186FF" }}>BIAYA TOKEN API</div>
          <div style={{ fontFamily: TheBoldFont, fontSize: 46, color: "#FFF" }}>HEMAT 100%</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, textDecoration: "line-through", color: "#FF5555" }}>$1,200 / bln</div>
          <div style={{ fontFamily: TheBoldFont, fontSize: 50, color: "#00FF66" }}>$0 / BULAN</div>
        </div>
      </div>

      {/* Privacy Shield Card */}
      <div
        style={{
          width: 820,
          background: "rgba(4, 15, 30, 0.88)",
          backdropFilter: "blur(16px)",
          border: "2px solid #00F0FF",
          borderRadius: 26,
          padding: "28px 38px",
          display: "flex",
          alignItems: "center",
          gap: 30,
          boxShadow: "0 0 50px rgba(0,240,255,0.35)",
        }}
      >
        <div style={{ fontSize: 80 }}>🛡️</div>
        <div>
          <div style={{ fontFamily: TheBoldFont, fontSize: 36, color: "#FFF" }}>PRIVASI DATA MUTLAK</div>
          <div style={{ fontSize: 24, color: "#A0F0FF", marginTop: 4 }}>
            Source code & data rahasia tidak pernah keluar ke server cloud pihak ketiga.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** SCENE 6: Call To Action (Save & Share) */
const Scene6Interactive: React.FC<{ progress: number }> = ({ progress }) => {
  const pulse = Math.sin(progress * Math.PI * 6) * 0.08 + 1.0;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 780,
          background: "rgba(10, 15, 20, 0.9)",
          backdropFilter: "blur(18px)",
          border: "3px solid #FFE600",
          borderRadius: 34,
          padding: "45px 40px",
          textAlign: "center",
          boxShadow: "0 0 70px rgba(255,230,0,0.5)",
          transform: `scale(${pulse})`,
        }}
      >
        <div style={{ fontSize: 85, marginBottom: 12 }}>💾 👥</div>
        <div style={{ fontFamily: TheBoldFont, fontSize: 48, color: "#FFE600", letterSpacing: 2 }}>
          SAVE VIDEO INI!
        </div>
        <div style={{ fontSize: 26, color: "#FFFFFF", marginTop: 14, lineHeight: 1.4 }}>
          Tag teman developer kamu biar nggak boncos lagi bayar API luar negeri!
        </div>

        <div
          style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 15,
            background: "#FFE600",
            color: "#000",
            padding: "18px 40px",
            borderRadius: 50,
            fontFamily: TheBoldFont,
            fontSize: 28,
            boxShadow: "0 10px 30px rgba(255,230,0,0.4)",
          }}
        >
          🚀 FOLLOW @indostill.id
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/*  MAIN EXPORTED COMPOSITION                                          */
/* ================================================================== */
export const IndostillAnimatedVideo: React.FC<IndostillVideoProps> = ({
  titleHook,
  categoryTag,
  scenes,
  audioSrc,
  logoSrc,
  subtitles,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  React.useEffect(() => {
    loadFont();
  }, []);

  /* Identify active scene */
  const sceneIdx = useMemo(() => {
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (timeMs >= scenes[i].startMs) return i;
    }
    return 0;
  }, [timeMs, scenes]);

  const currentScene = scenes[sceneIdx] || scenes[0];
  const sceneStartMs = currentScene.startMs;
  const sceneEndMs = currentScene.endMs;
  const sceneProgress = interpolate(
    timeMs,
    [sceneStartMs, sceneEndMs],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  /* Ken Burns effect per scene */
  const sceneStartFrame = (sceneStartMs / 1000) * fps;
  const sceneDurationFrames = Math.max(1, ((sceneEndMs - sceneStartMs) / 1000) * fps);
  const sceneLocalFrame = frame - sceneStartFrame;
  const bgScale = interpolate(
    sceneLocalFrame,
    [0, sceneDurationFrames],
    [1.04, 1.18],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const bgTranslateY = interpolate(
    sceneLocalFrame,
    [0, sceneDurationFrames],
    [0, -40],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  /* Build TikTok-style multi-word pages */
  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      captions: subtitles,
      combineTokensWithinMilliseconds: SWITCH_MS,
    });
  }, [subtitles]);

  /* Find active TikTok page */
  const activePage = useMemo(() => {
    return pages.find((p) => timeMs >= p.startMs && timeMs <= p.endMs);
  }, [pages, timeMs]);

  /* Overall progress ratio */
  const progressRatio = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#060913", overflow: "hidden" }}>
      {/* Voiceover Audio */}
      <Audio src={audioSrc} />

      {/* Layer 1: Dedicated Scene Background Image with Ken Burns Motion */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(currentScene.bgImage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale}) translateY(${bgTranslateY}px)`,
            filter: "brightness(0.65) contrast(1.15) saturate(1.1)",
          }}
        />
      </AbsoluteFill>

      {/* Layer 2: Cyber Gradient Vignette & HUD Overlay */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(6,9,19,0.55) 0%, rgba(6,9,19,0.35) 30%, rgba(6,9,19,0.7) 60%, rgba(6,9,19,0.96) 100%)",
        }}
      />

      {/* Layer 3: Cyber Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Layer 4: Interactive Mid-Layer Visuals (Middle 15% - 68% Height) */}
      <AbsoluteFill style={{ top: 120, height: 1100 }}>
        {sceneIdx === 0 && <Scene1Interactive progress={sceneProgress} />}
        {sceneIdx === 1 && <Scene2Interactive progress={sceneProgress} />}
        {sceneIdx === 2 && <Scene3Interactive progress={sceneProgress} />}
        {sceneIdx === 3 && <Scene4Interactive progress={sceneProgress} />}
        {sceneIdx === 4 && <Scene5Interactive progress={sceneProgress} />}
        {sceneIdx === 5 && <Scene6Interactive progress={sceneProgress} />}
      </AbsoluteFill>

      {/* Top Header & Branding (Top 0 - 150px) */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 50,
          right: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Studio Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={logoSrc} style={{ width: 60, height: 60, borderRadius: 14 }} />
          <div>
            <div style={{ fontFamily: TheBoldFont, fontSize: 26, color: "#FFFFFF", letterSpacing: 2 }}>
              INDOSTILL.ID
            </div>
            <div style={{ fontSize: 16, color: "#00F0FF", letterSpacing: 1 }}>
              TECH & AI STUDIO
            </div>
          </div>
        </div>

        {/* Scene Indicator & Tag */}
        <div
          style={{
            background: "rgba(5,10,20,0.85)",
            backdropFilter: "blur(12px)",
            padding: "10px 24px",
            borderRadius: 30,
            border: `2px solid ${currentScene.accent}`,
            color: currentScene.accent,
            fontFamily: TheBoldFont,
            fontSize: 20,
            letterSpacing: 2,
            boxShadow: `0 0 25px ${currentScene.accent}66`,
          }}
        >
          {currentScene.tag} ({sceneIdx + 1}/{scenes.length})
        </div>
      </div>

      {/* Floating Hook Badge (First 5 seconds) */}
      {timeMs < 5000 && (
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 50,
            right: 50,
            background: "linear-gradient(90deg, #FF0055, #FF5500)",
            padding: "16px 28px",
            borderRadius: 20,
            textAlign: "center",
            boxShadow: "0 10px 45px rgba(255,0,85,0.75)",
            zIndex: 12,
          }}
        >
          <span style={{ fontFamily: TheBoldFont, fontSize: 32, color: "#FFFFFF", letterSpacing: 2 }}>
            ⚡ {titleHook}
          </span>
        </div>
      )}

      {/* Layer 5: Kinetic Captions Section (Lower Third: 1280px - 1750px) */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 50,
          right: 50,
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        {activePage && (
          <div
            style={{
              background: "rgba(4, 8, 18, 0.9)",
              backdropFilter: "blur(16px)",
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: 28,
              padding: "24px 38px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.95)",
              maxWidth: 960,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {activePage.tokens.map((token, idx) => {
              const isCurrent = timeMs >= token.startMs && timeMs <= token.endMs;
              const isPast = timeMs > token.endMs;

              let wordColor = "#FFFFFF";
              let wordTransform = "scale(1)";
              let textShadow = "none";

              if (isCurrent) {
                wordColor = "#FFE600";
                wordTransform = "scale(1.28)";
                textShadow = "0 0 25px #FFE600, 0 0 45px #FF9900";
              } else if (isPast) {
                wordColor = "#778099";
              }

              return (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    margin: "4px 8px",
                    fontFamily: TheBoldFont,
                    fontSize: 44,
                    color: wordColor,
                    transform: wordTransform,
                    textShadow: textShadow,
                    transition: "transform 0.08s ease-out, color 0.08s ease-out",
                  }}
                >
                  {token.text}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Dots per Scene */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          zIndex: 25,
        }}
      >
        {scenes.map((sc, i) => (
          <div
            key={i}
            style={{
              width: i === sceneIdx ? 40 : 14,
              height: 14,
              borderRadius: 7,
              background: i === sceneIdx ? sc.accent : "rgba(255,255,255,0.25)",
              boxShadow: i === sceneIdx ? `0 0 15px ${sc.accent}` : "none",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Neon Progress Bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          background: "rgba(255,255,255,0.1)",
          zIndex: 30,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressRatio * 100}%`,
            background: "linear-gradient(90deg, #FF0055, #00F0FF, #00FF66, #FFE600)",
            boxShadow: "0 0 15px #00F0FF",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
