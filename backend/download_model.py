"""
Model download utility for OpenAI CLIP ViT-B-32 weights.
"""
import os
import sys
import time
import urllib.request

URL = "https://openaipublic.azureedge.net/clip/models/40d365715913c9da98579312b702a82c18be219cc2a73407c4526f58eba950af/ViT-B-32.pt"
CACHE_DIR = os.path.expanduser("~/.cache/clip")
os.makedirs(CACHE_DIR, exist_ok=True)
TARGET_FILE = os.path.join(CACHE_DIR, "ViT-B-32.pt")
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCAL_COPY = os.path.join(ROOT_DIR, "ViT-B-32.pt")

def download_file():
    target = LOCAL_COPY if os.path.exists(LOCAL_COPY) else TARGET_FILE
    if os.path.exists(target) and os.path.getsize(target) > 300 * 1024 * 1024:
        print(f"[+] Model file found: {target} ({round(os.path.getsize(target)/1024/1024, 1)} MB)", flush=True)
        return target

    print(f"[*] Downloading CLIP ViT-B-32 model (~337 MB)...", flush=True)
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    
    with urllib.request.urlopen(req) as response:
        total_size = int(response.headers.get('content-length', 0))
        block_size = 1024 * 1024  # 1 MB
        downloaded = 0
        t0 = time.time()
        last_print = 0

        temp_target = LOCAL_COPY + ".tmp"
        with open(temp_target, 'wb') as out_file:
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                out_file.write(buffer)
                downloaded += len(buffer)
                now = time.time()
                if now - last_print > 2.0 or downloaded == total_size:
                    percent = (downloaded / total_size) * 100 if total_size else 0
                    speed = (downloaded / 1024 / 1024) / (now - t0 + 1e-6)
                    mb = downloaded / 1024 / 1024
                    tot_mb = total_size / 1024 / 1024
                    print(f"[*] Progress: {percent:.1f}% ({mb:.1f}/{tot_mb:.1f} MB) @ {speed:.2f} MB/s", flush=True)
                    last_print = now

        if os.path.exists(LOCAL_COPY):
            os.remove(LOCAL_COPY)
        os.rename(temp_target, LOCAL_COPY)
        print(f"[+] Download complete: {LOCAL_COPY} ({round(os.path.getsize(LOCAL_COPY)/1024/1024, 1)} MB)", flush=True)
        return LOCAL_COPY

if __name__ == "__main__":
    download_file()
