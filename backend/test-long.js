import * as fs from "node:fs";

const API_KEY = "nguyenviet02";
const PROXY_BASE = "https://ai-proxy.vietnx.io.vn";
const MODEL = "gemini-3.1-flash-image";
const API_URL = `${PROXY_BASE}/v1beta/models/${MODEL}:predictLongRunning`;
// wait, the payload format for predictLongRunning relies on instances and parameters!
import { PROMPT_CHANGE_OUTFIT } from "./prompt-change-outfit.js";

async function testLongRunning() {
  console.log("Loading images...");
  const defaultModelImage = fs.readFileSync("./Model.png", { encoding: "base64" });
  const defaultBackgroundImage = fs.readFileSync("./background.png", { encoding: "base64" });
  const outfitImage = defaultModelImage; 
  
  // This format is valid for veo, not sure for gemini-3.1-flash-image
  const body = {
    instances: [
      { prompt: PROMPT_CHANGE_OUTFIT }
    ]
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });
    console.log("predictLongRunning Status:", res.status, await res.text());
  } catch (err) {}
}

testLongRunning();
