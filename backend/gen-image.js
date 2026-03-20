import * as fs from "node:fs";

const API_KEY = "nguyenviet02";
const PROXY_BASE = "https://ai-proxy.vietnx.io.vn";
const MODEL = "gemini-3.1-flash-image";
const API_URL = `${PROXY_BASE}/v1beta/models/${MODEL}:generateContent`;

async function main() {
  const prompt = PROMPT_CHANGE_OUTFIT;
  const aspectRatio = "9:16";
  const resolution = "2K";

  const defaultModelImage = fs.readFileSync("./Model.png", {
    encoding: "base64",
  });

  const defaultBackgroundImage = fs.readFileSync("./background.png", {
    encoding: "base64",
  });

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/png",
              data: defaultModelImage,
            },
          },
          {
            inline_data: {
              mime_type: "image/png",
              data: defaultBackgroundImage,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: resolution,
      },
    },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API request failed (${res.status}): ${errorText}`);
  }

  const response = await res.json();

  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("image.png", buffer);
      console.log("Image saved as image.png");
    }
  }
}

main();
