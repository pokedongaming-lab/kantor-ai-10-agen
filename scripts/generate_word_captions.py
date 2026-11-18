import asyncio
import json
import edge_tts
import os
import re

OUTPUT_DIR = "C:/Users/admin/kantor-ai-10-agen/indostill-video/public"
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "id-ID-ArdiNeural"

SCRIPT_TEXT = (
    "Bayangin punya AI yang bisa mikir kompleks seperti OpenAI o-one, tapi bisa kamu jalankan sendiri di komputer! "
    "Kenalin, DeepSeek-R1! Model AI reasoning yang bikin industri teknologi melirik. "
    "Kemampuannya dalam matematika, coding, dan penalaran diklaim sebanding dengan OpenAI o-one. "
    "Yang menarik, model ini punya bobot terbuka. Bahkan, kamu bisa menjalankannya secara lokal menggunakan Ollama. "
    "Tinggal buka terminal, ketik: ollama run deepseek-r1. Dan AI langsung berjalan di komputermu! "
    "Artinya? Kamu bisa mengurangi ketergantungan pada API berbayar dan, jika dikonfigurasi lokal, data yang kamu proses tidak perlu dikirim ke server AI eksternal. "
    "Developer, masih mau bakar uang buat API? Save video ini dan tag temanmu yang wajib nyobain!"
)

# 6 Clean Scenes mapped to Pak Andre's script
SCENE_DEFINITIONS = [
    {
        "id": "scene_hook",
        "act": "HOOK",
        "title": "AI CANGGIH DI LAPTOP SENDIRI",
        "tag": "🔥 BREAKING NEWS",
        "accent": "#FF0055",
        "startSentence": 0,
        "endSentence": 0
    },
    {
        "id": "scene_curiosity",
        "act": "CURIOSITY",
        "title": "DEEPSEEK-R1 REASONING KING",
        "tag": "⚡ OPENAI O1 RIVAL",
        "accent": "#00F0FF",
        "startSentence": 1,
        "endSentence": 3
    },
    {
        "id": "scene_open_weights",
        "act": "OPEN SOURCE",
        "title": "OPEN WEIGHTS & OLLAMA",
        "tag": "🔓 100% OPEN WEIGHTS",
        "accent": "#FFB800",
        "startSentence": 4,
        "endSentence": 5
    },
    {
        "id": "scene_demo_terminal",
        "act": "DEMONSTRASI",
        "title": "TERMINAL LOCAL RUN",
        "tag": "💻 OFFLINE TERMINAL",
        "accent": "#00FF66",
        "startSentence": 6,
        "endSentence": 7
    },
    {
        "id": "scene_payoff",
        "act": "PAYOFF",
        "title": "HEMAT API & PRIVASI AMAN",
        "tag": "🔒 ZERO CLOUD LEAK",
        "accent": "#B026FF",
        "startSentence": 8,
        "endSentence": 9
    },
    {
        "id": "scene_cta",
        "act": "CTA",
        "title": "SAVE & TAG TEMAN DEV KAMU",
        "tag": "🚀 INDOSTILL.ID",
        "accent": "#FFE600",
        "startSentence": 10,
        "endSentence": 11
    }
]

async def generate():
    comm = edge_tts.Communicate(SCRIPT_TEXT, VOICE, rate="+14%")
    
    audio_path = os.path.join(OUTPUT_DIR, "voiceover.mp3")
    sentences = []
    audio_data = bytearray()
    
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio_data.extend(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            start_ms = chunk["offset"] / 10000
            dur_ms = chunk["duration"] / 10000
            sentences.append({
                "text": chunk["text"],
                "startMs": round(start_ms),
                "endMs": round(start_ms + dur_ms),
            })
    
    with open(audio_path, "wb") as f:
        f.write(audio_data)
    print(f"✅ Audio saved: {audio_path} ({len(audio_data)} bytes)")
    
    # Generate word-level captions with proportional durations
    word_captions = []
    for sent in sentences:
        text = sent["text"].strip()
        if not text:
            continue
        words = text.split()
        if not words:
            continue
        
        total_chars = sum(len(w) for w in words)
        duration = sent["endMs"] - sent["startMs"]
        cursor = sent["startMs"]
        
        for w in words:
            word_dur = max(90, int(duration * len(w) / max(1, total_chars)))
            word_captions.append({
                "text": w,
                "startMs": round(cursor),
                "endMs": round(cursor + word_dur),
                "timestampMs": round(cursor + word_dur / 2),
                "confidence": 1
            })
            cursor += word_dur

    captions_path = os.path.join(OUTPUT_DIR, "voiceover_words.json")
    with open(captions_path, "w", encoding="utf-8") as f:
        json.dump(word_captions, f, indent=2, ensure_ascii=False)
    print(f"✅ Word captions: {len(word_captions)} words saved to {captions_path}")
    
    # Map scenes with exact startMs and endMs based on grouped sentences
    scenes_final = []
    for s_def in SCENE_DEFINITIONS:
        first_s = sentences[s_def["startSentence"]]
        last_s = sentences[s_def["endSentence"]]
        scenes_final.append({
            "id": s_def["id"],
            "act": s_def["act"],
            "title": s_def["title"],
            "tag": s_def["tag"],
            "accent": s_def["accent"],
            "startMs": first_s["startMs"],
            "endMs": last_s["endMs"],
            "text": " ".join([sentences[i]["text"] for i in range(s_def["startSentence"], s_def["endSentence"] + 1)])
        })
        
    scenes_path = os.path.join(OUTPUT_DIR, "scenes.json")
    with open(scenes_path, "w", encoding="utf-8") as f:
        json.dump(scenes_final, f, indent=2, ensure_ascii=False)
    print(f"✅ Scenes: {len(scenes_final)} scenes saved to {scenes_path}")
    for sc in scenes_final:
        print(f"   [{sc['startMs']:5d}ms - {sc['endMs']:5d}ms] {sc['act']}: {sc['title']}")

asyncio.run(generate())
