import os
import re
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path("C:/Users/admin/kantor-ai-10-agen")
OUTPUT_DIR = BASE_DIR / "output" / "videos"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
LOGO_PATH = BASE_DIR / "public" / "logo-indostill.png"
DEFAULT_BG = BASE_DIR / "output" / "images" / "bg_ai_battle.jpg"

VOICE = "id-ID-ArdiNeural"

def clean_script_for_tts(text: str) -> str:
    """Bersihkan format markdown, timestamp [00:00], dan karakter non-alfanumerik."""
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith("#") or (line.startswith("-") and ("Durasi" in line or "Visual" in line)):
            continue
        line = re.sub(r'\[\d{2}:\d{2}.*?\]', '', line)
        line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
        line = re.sub(r'`(.*?)`', r'\1', line)
        line = line.replace("OpenAI", "Open A I").replace("API", "A P I")
        line = line.strip()
        if line:
            cleaned_lines.append(line)
    return " ".join(cleaned_lines)

def generate_video(script_text: str, filename_base: str, title_hook: str, bg_image: Path = None):
    bg_path = bg_image or DEFAULT_BG
    if not bg_path.exists():
        print(f"⚠️ Background {bg_path} tidak ditemukan, mencari di folder images...")
        images = list((BASE_DIR / "output" / "images").glob("*.jpg")) + list((BASE_DIR / "output" / "images").glob("*.png"))
        if images:
            bg_path = images[0]

    clean_text = clean_script_for_tts(script_text)
    print(f"\n🎙️ Mengenerate Voiceover TTS ({VOICE}):\n\"{clean_text[:120]}...\"\n")

    audio_file = f"{filename_base}.mp3"
    sub_file = f"{filename_base}.vtt"
    output_video = f"{filename_base}.mp4"

    # 1. Jalankan edge-tts CLI untuk menghasilkan MP3 dan subtitle VTT sekaligus
    cmd_tts = [
        "edge-tts",
        "--text", clean_text,
        "--voice", VOICE,
        "--rate", "+12%",
        "--write-media", str(OUTPUT_DIR / audio_file),
        "--write-subtitles", str(OUTPUT_DIR / sub_file)
    ]
    subprocess.run(cmd_tts, check=True)

    # 2. Cek durasi audio dengan ffprobe
    probe_cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(OUTPUT_DIR / audio_file)
    ]
    duration = float(subprocess.check_output(probe_cmd).strip())
    print(f"⏱️ Durasi Audio: {duration:.1f} detik")

    # 3. Render video 1080x1920 (9:16) vertikal TikTok dengan Dynamic Visual Motion Background
    filter_complex = (
        f"[0:v]scale=1200:2133:force_original_aspect_ratio=increase,"
        f"crop=1080:1920:'(in_w-out_w)*(0.5+0.5*sin(t*0.4))':'(in_h-out_h)*(0.5+0.5*cos(t*0.25))',"
        f"drawbox=y=0:w=1080:h=1920:color=black@0.4:t=fill[bg_motion];"
        f"[2:v]scale=130:130[logo];"
        f"[bg_motion][logo]overlay=60:70[v1];"
        f"[v1]drawtext=fontfile='/Windows/Fonts/segoeui.ttf':text='indostill.id':fontsize=48:fontcolor=#00F0FF:x=210:y=112,"
        f"drawbox=y=220:w=1080:h=160:color=black@0.8:t=fill,"
        f"drawbox=y=220:w=1080:h=6:color=#00F0FF:t=fill,"
        f"drawbox=y=374:w=1080:h=6:color=#00F0FF:t=fill,"
        f"drawtext=fontfile='/Windows/Fonts/segoeuib.ttf':text='{title_hook}':fontsize=42:fontcolor=#FFFFFF:x=(w-text_w)/2:y=274,"
        f"subtitles='{sub_file}':force_style='Fontname=Arial,Fontsize=30,Bold=1,PrimaryColour=&H0000FFFF&,OutlineColour=&H00000000&,Outline=4,Shadow=3,Alignment=2,MarginV=420'[v]"
    )

    cmd_render = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(bg_path),
        "-i", audio_file,
        "-i", str(LOGO_PATH),
        "-t", str(duration),
        "-filter_complex", filter_complex,
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", output_video
    ]

    print(f"🚀 Me-render video MP4 vertikal 1080x1920 dengan visual {bg_path.name}...")
    subprocess.run(cmd_render, cwd=str(OUTPUT_DIR), check=True)
    full_output = OUTPUT_DIR / output_video
    print(f"✅ Video berhasil dibuat: {full_output}")
    return full_output

if __name__ == "__main__":
    sample_text = """
    OpenAI panik! Model AI murah ini bantai model penalaran mahal!
    Pertama: DeepSeek R1 pecahkan logika matematika dan coding kompleks setara OpenAI o1, tapi bobot modelnya terbuka gratis.
    Kedua: Jalan lokal offline! Buka terminal, ketik ollama run deepseek-r1, langsung jalan di laptop kamu tanpa bayar token API.
    Ketiga: Privasi penuh, source code kamu aman dari kebocoran cloud!
    Save video ini sekarang dan share ke teman developer kamu biar stop bakar duit API!
    """
    out = generate_video(sample_text, "video_tiktok_01_deepseek", "OPENAI PANIK?! DEEPSEEK-R1 OFFLINE")
    print(f"\n🎉 SELESAI! Video siap ditonton di:\n{out}")
