import * as fs from "node:fs";

const API_KEY = "nguyenviet02";
const PROXY_BASE = "https://ai-proxy.vietnx.io.vn";
const MODEL = "gemini-3.1-flash-image";
const API_URL = `${PROXY_BASE}/v1beta/models/${MODEL}:generateContent`;

import { PROMPT_CHANGE_OUTFIT } from "./prompt-change-outfit.js";

async function testGeneration() {
  console.log("Loading images...");
  const defaultModelImage = fs.readFileSync("./Model.png", { encoding: "base64" });
  const defaultBackgroundImage = fs.readFileSync("./background.png", { encoding: "base64" });
  // Just reuse the model image as a fake outfit to test payload
  const outfitImage = defaultModelImage; 

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT_CHANGE_OUTFIT },
          { inline_data: { mime_type: "image/png", data: defaultModelImage } },
          { inline_data: { mime_type: "image/png", data: outfitImage } },
          { inline_data: { mime_type: "image/png", data: defaultBackgroundImage } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "9:16", imageSize: "2K" },
    },
  };

  console.log("Sending request...", new Date().toISOString());
  const start = Date.now();
  
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    console.log(`Response status: ${res.status}`);
    const timeTaken = (Date.now() - start) / 1000;
    console.log(`Time taken: ${timeTaken} seconds`);

    if (!res.ok) {
      console.log("Error:", await res.text());
    } else {
      console.log("Success!");
    }
  } catch (err) {
    console.log("Request failed exception:", err.message);
  }
}

testGeneration();
