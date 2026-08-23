"""
AI Image Classifier — Flask Web Application Server
"""

import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

from .model import load_model, classify_image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TEMPLATE_DIR = os.path.join(BASE_DIR, "frontend", "templates")
STATIC_DIR = os.path.join(BASE_DIR, "frontend", "static")

PORT = int(os.environ.get("PORT", 5000))

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR,
    static_url_path="/static"
)
CORS(app)

# Pre-load model on server initialization
load_model()


@app.route("/")
def index():
    """Serve the main web interface."""
    return render_template("index.html")


@app.route("/api/classify", methods=["POST"])
def api_classify():
    """Accept an image upload and return AI vs Real classification results."""
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    allowed_extensions = {"png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        return jsonify({"error": f"Unsupported file type: .{ext}"}), 400

    try:
        image_bytes = file.read()
        result = classify_image(image_bytes)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500


if __name__ == "__main__":
    print()
    print("=" * 54)
    print("   AI Image Detector is running!")
    print(f"   Open  http://localhost:{PORT}  in your browser")
    print("=" * 54)
    print()

    app.run(host="0.0.0.0", port=PORT, debug=False)
