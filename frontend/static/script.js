/**
 * AI Image Detector — Frontend Logic
 * Handles drag-and-drop upload, API calls, and animated result rendering.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- DOM References ---
    const uploadZone    = document.getElementById("upload-zone");
    const fileInput     = document.getElementById("file-input");
    const previewSec    = document.getElementById("preview-section");
    const previewImg    = document.getElementById("preview-image");
    const loadingEl     = document.getElementById("loading");
    const resultsEl     = document.getElementById("results");
    const gaugeRing     = document.getElementById("gauge-ring");
    const confValue     = document.getElementById("confidence-value");
    const resultLabel   = document.getElementById("result-label");
    const aiBar         = document.getElementById("ai-bar");
    const realBar       = document.getElementById("real-bar");
    const aiScoreText   = document.getElementById("ai-score-text");
    const realScoreText = document.getElementById("real-score-text");
    const resetBtn      = document.getElementById("reset-btn");

    const CIRCUMFERENCE = 2 * Math.PI * 85; // ≈ 534.07, matches SVG circle r=85

    // --- Event Listeners ---

    // Click to open file picker
    uploadZone.addEventListener("click", () => fileInput.click());

    // File selected via picker
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // Drag & drop
    uploadZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.add("drag-over");
    });

    uploadZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove("drag-over");
    });

    uploadZone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadZone.classList.remove("drag-over");
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    // Prevent default drag behavior on the window to avoid accidental navigation
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => e.preventDefault());

    // Reset button
    resetBtn.addEventListener("click", resetUI);


    // --- Core Logic ---

    /**
     * Handle a selected image file: show preview and send to API.
     */
    function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            showError("Please upload an image file (PNG, JPG, etc.).");
            return;
        }

        // Validate file size (max 20 MB)
        if (file.size > 20 * 1024 * 1024) {
            showError("Image is too large. Please upload an image under 20 MB.");
            return;
        }

        // Read file and show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            show(previewSec, "fade-in");
            hide(uploadZone);

            // Send to API
            classifyImage(file);
        };
        reader.readAsDataURL(file);
    }

    /**
     * Send image to /api/classify and render results.
     */
    async function classifyImage(file) {
        show(loadingEl, "fade-in");
        hide(resultsEl);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/classify", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                showError(data.error || "Server returned an error.");
                resetUI();
                return;
            }

            hide(loadingEl);
            renderResults(data);

        } catch (err) {
            showError(
                "Could not connect to the server.\n" +
                "Make sure the Flask server is running."
            );
            resetUI();
        }
    }

    /**
     * Render classification results with animations.
     */
    function renderResults(data) {
        show(resultsEl, "fade-in");

        const isAI = data.label.includes("AI");
        const color = isAI ? "var(--color-ai)" : "var(--color-real)";

        // --- Confidence gauge ---
        const offset = CIRCUMFERENCE - (data.confidence / 100) * CIRCUMFERENCE;
        gaugeRing.style.stroke = color;

        // Trigger reflow before animating for smooth transition from reset state
        void gaugeRing.offsetWidth;
        gaugeRing.style.strokeDashoffset = offset;

        // Animate number counter
        animateCount(confValue, 0, Math.round(data.confidence), 1600);
        confValue.style.color = color;

        // --- Label badge ---
        resultLabel.textContent = data.label;
        resultLabel.className = `result-badge ${isAI ? "ai" : "real"}`;

        // --- Score bars (with slight delay for staggered effect) ---
        setTimeout(() => {
            aiBar.style.width   = data.ai_score + "%";
            realBar.style.width = data.real_score + "%";
            aiScoreText.textContent   = data.ai_score + "%";
            realScoreText.textContent = data.real_score + "%";
        }, 350);
    }

    /**
     * Smoothly animate a number from `start` to `end` over `duration` ms.
     * Uses ease-out cubic easing for a natural feel.
     */
    function animateCount(el, start, end, duration) {
        const t0 = performance.now();

        function tick(now) {
            const progress = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.round(start + (end - start) * eased);

            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    /**
     * Reset the UI back to the upload state.
     */
    function resetUI() {
        show(uploadZone);
        hide(previewSec);
        hide(loadingEl);
        hide(resultsEl);

        // Reset gauge to full offset (empty ring)
        gaugeRing.style.transition = "none";
        gaugeRing.style.strokeDashoffset = CIRCUMFERENCE;
        // Re-enable transition after a frame
        requestAnimationFrame(() => {
            gaugeRing.style.transition = "";
        });

        confValue.textContent = "0";
        confValue.style.color = "";

        aiBar.style.width   = "0%";
        realBar.style.width = "0%";
        aiScoreText.textContent   = "0%";
        realScoreText.textContent = "0%";

        fileInput.value = "";

        // Clean animation classes
        [previewSec, loadingEl, resultsEl].forEach((el) => {
            el.classList.remove("fade-in", "scale-in");
        });
    }


    // --- Helpers ---

    function show(el, animClass) {
        el.classList.remove("hidden");
        if (animClass) {
            el.classList.remove(animClass);
            void el.offsetWidth; // force reflow for re-triggering animation
            el.classList.add(animClass);
        }
    }

    function hide(el) {
        el.classList.add("hidden");
    }

    function showError(msg) {
        alert(msg);
    }
});
