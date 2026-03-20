import express from "express";
import cors from "cors";
import multer from "multer";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { PROMPT_CHANGE_OUTFIT } from "./prompt-change-outfit.js";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 6200;

const API_KEY = "nguyenviet02";
const PROXY_BASE = "https://ai-proxy.vietnx.io.vn";
const MODEL = "gemini-3.1-flash-image";
const API_URL = `${PROXY_BASE}/v1beta/models/${MODEL}:generateContent`;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure output directory exists
const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG, JPEG, and WebP images are allowed"));
    }
  },
});

// Default images caching strategy
const defaultModelPath = path.join(__dirname, "Model.png");
const defaultBackgroundPath = path.join(__dirname, "background.png");

// We read raw buffers once, but resize per-request just to be safe (or we can resize statically).
const defaultModelBuffer = fs.readFileSync(defaultModelPath);
const defaultBackgroundBuffer = fs.readFileSync(defaultBackgroundPath);

// For preview endpoints
const defaultModelBase64 = defaultModelBuffer.toString("base64");
const defaultBackgroundBase64 = defaultBackgroundBuffer.toString("base64");


// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Generate image endpoint
app.post(
  "/api/generate-image",
  upload.fields([
    { name: "outfit", maxCount: 1 },
    { name: "model", maxCount: 1 },
    { name: "background", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Outfit is required
      if (!req.files?.outfit?.[0]) {
        return res.status(400).json({ error: "Outfit image is required" });
      }

      // Helper to shrink any buffer to 1024px WebP
      const compressImage = async (buffer) => {
        const shrunk = await sharp(buffer)
          .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        return {
          base64: shrunk.toString("base64"),
          mime: "image/webp",
        };
      };

      // Outfit
      const outfitData = await compressImage(req.files.outfit[0].buffer);

      // Model: use uploaded or default
      let modelData;
      if (req.files?.model?.[0]) {
        modelData = await compressImage(req.files.model[0].buffer);
      } else {
        modelData = await compressImage(defaultModelBuffer);
      }

      // Background: use uploaded or default
      let backgroundData;
      if (req.files?.background?.[0]) {
        backgroundData = await compressImage(req.files.background[0].buffer);
      } else {
        backgroundData = await compressImage(defaultBackgroundBuffer);
      }

      const aspectRatio = req.body?.aspectRatio || "9:16";
      const resolution = req.body?.resolution || "2K";

      // Build the prompt — model is image 1, outfit is image 2, background is image 3
      const body = {
        contents: [
          {
            parts: [
              { text: PROMPT_CHANGE_OUTFIT },
              {
                inline_data: {
                  mime_type: modelData.mime,
                  data: modelData.base64,
                },
              },
              {
                inline_data: {
                  mime_type: outfitData.mime,
                  data: outfitData.base64,
                },
              },
              {
                inline_data: {
                  mime_type: backgroundData.mime,
                  data: backgroundData.base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio,
            imageSize: resolution,
          },
        },
      };

      console.log("[generate-image] Sending request to Gemini API...");

      const apiRes = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify(body),
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error(`[generate-image] API error (${apiRes.status}):`, errorText);
        return res.status(apiRes.status).json({
          error: `API request failed (${apiRes.status})`,
          details: errorText,
        });
      }

      const response = await apiRes.json();
      const parts = response.candidates?.[0]?.content?.parts || [];

      let resultImage = null;
      let resultText = null;

      for (const part of parts) {
        if (part.text) {
          resultText = part.text;
        } else if (part.inlineData) {
          resultImage = part.inlineData.data;
          // Save to output directory
          const filename = `generated_${Date.now()}.png`;
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, Buffer.from(resultImage, "base64"));
          console.log(`[generate-image] Image saved: ${filepath}`);
        }
      }

      if (resultImage) {
        res.json({
          success: true,
          image: `data:image/png;base64,${resultImage}`,
          text: resultText,
        });
      } else {
        res.status(500).json({
          error: "No image was generated",
          text: resultText,
        });
      }
    } catch (error) {
      console.error("[generate-image] Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Serve default images for preview in FE (uncompressed base64 for preview simplicity)
app.get("/api/defaults/model", (req, res) => {
  res.json({ image: `data:image/png;base64,${defaultModelBase64}` });
});

app.get("/api/defaults/background", (req, res) => {
  res.json({ image: `data:image/png;base64,${defaultBackgroundBase64}` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Gen-Content Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
