import urllib.request
import urllib.parse
import os
import time

OUTPUT_DIR = "C:/Users/admin/kantor-ai-10-agen/indostill-video/public/scenes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SCENES = [
    {
        "filename": "scene1_hook.jpg",
        "prompt": "futuristic quantum AI neural core glowing orb, cyberpunk dark server room, neon red and magenta lighting, high tech volumetric fog, 8k resolution, cinematic composition, vertical 9:16 wallpaper"
    },
    {
        "filename": "scene2_curiosity.jpg",
        "prompt": "two artificial intelligence humanoid robots facing each other in high tech duel, one glowing cyan neon one glowing orange, complex neural network circuits, dark futuristic lab, cinematic 8k, vertical 9:16"
    },
    {
        "filename": "scene3_open_source.jpg",
        "prompt": "holographic open source data vault unlocking, golden glowing digital crystal cube releasing streaming data particles, futuristic tech matrix, cinematic octane render 8k, vertical 9:16"
    },
    {
        "filename": "scene4_terminal.jpg",
        "prompt": "cyberpunk developer hands on glowing mechanical keyboard with holographic transparent monitor displaying green terminal code and matrix data stream, dramatic dark room, cinematic lighting, 8k, vertical 9:16"
    },
    {
        "filename": "scene5_privacy.jpg",
        "prompt": "holographic digital energy shield barrier protecting central glowing mainframe server, cyber security fortress, purple and blue laser grids, impenetrable firewall concept, cinematic 8k, vertical 9:16"
    },
    {
        "filename": "scene6_cta.jpg",
        "prompt": "glowing neon futuristic tech studio background, floating holographic smartphone showing bookmark and save icons, dark aesthetic, golden and yellow neon accents, cinematic 8k, vertical 9:16"
    }
]

def download_scenes():
    print(f"🚀 Generating {len(SCENES)} scene images via Flux Engine...")
    for idx, sc in enumerate(SCENES, 1):
        target_path = os.path.join(OUTPUT_DIR, sc["filename"])
        if os.path.exists(target_path) and os.path.getsize(target_path) > 30000:
            print(f"[{idx}/{len(SCENES)}] Already exists: {sc['filename']} ({os.path.getsize(target_path)} bytes)")
            continue

        encoded_prompt = urllib.parse.quote(sc["prompt"])
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=720&height=1280&model=flux&nologo=true&seed={idx * 137}"
        print(f"[{idx}/{len(SCENES)}] Downloading {sc['filename']}...")
        
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        success = False
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=45) as resp, open(target_path, "wb") as f:
                    f.write(resp.read())
                size = os.path.getsize(target_path)
                print(f"   ✓ Saved {sc['filename']} ({size} bytes)")
                success = True
                break
            except Exception as e:
                print(f"   ⚠️ Attempt {attempt+1} failed: {e}")
                time.sleep(3)
        if not success:
            print(f"   ❌ Failed to download {sc['filename']}")

if __name__ == "__main__":
    download_scenes()
