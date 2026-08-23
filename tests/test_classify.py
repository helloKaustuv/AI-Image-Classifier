"""
API Integration Test for AI Image Classifier
"""
import urllib.request
import io
import json
from PIL import Image, ImageDraw

def test_api():
    img = Image.new('RGB', (300, 300), color=(120, 160, 200))
    draw = ImageDraw.Draw(img)
    draw.text((50, 140), "Sample Test Photo", fill=(255, 255, 255))
    
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    image_bytes = buf.getvalue()

    boundary = '----Boundary1234567890'
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="image"; filename="sample.jpg"\r\n'
        f'Content-Type: image/jpeg\r\n\r\n'
    ).encode('utf-8') + image_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

    req = urllib.request.Request(
        'http://127.0.0.1:5000/api/classify',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            print("API Response:", json.dumps(res, indent=2))
    except Exception as e:
        print(f"Error testing API (ensure server is running): {e}")

if __name__ == "__main__":
    test_api()
