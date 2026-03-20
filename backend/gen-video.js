import * as fs from "node:fs";

const API_KEY = "nguyenviet02";
const PROXY_BASE = "https://ai-proxy.vietnx.io.vn";
const MODEL = "veo-3.1";
const API_URL = `${PROXY_BASE}/v1beta/models/${MODEL}:predictLongRunning`;
const POLL_INTERVAL_MS = 10_000;

import { LIST_VIDEO_PROMPTS } from "./prompt-video.js";

async function main() {
  // Read reference images as base64
  const modelReferenceImage = fs.readFileSync("./Model.png", {
    encoding: "base64",
  });

  const selectedPrompt = LIST_VIDEO_PROMPTS[0];

  // Build the request body
  const body = {
    instances: [
      {
        prompt: selectedPrompt,
        referenceImages: [
          {
            image: {
              inlineData: { mimeType: "image/png", data: modelReferenceImage },
            },
            referenceType: "asset",
          },
        ],
      },
    ],
  };

  // Send the initial request to start video generation
  console.log("Submitting video generation request...");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  console.log(`Response status: ${res.status}`);

  const responseText = await res.text();
  console.log(`Response body: ${responseText || "(empty)"}`);

  if (!res.ok) {
    throw new Error(`API request failed (${res.status}): ${responseText}`);
  }

  if (!responseText) {
    throw new Error("API returned an empty response body");
  }

  const operationResponse = JSON.parse(responseText);
  const operationName = operationResponse.name;

  if (!operationName) {
    throw new Error(
      `No operation name returned: ${JSON.stringify(operationResponse)}`,
    );
  }

  console.log(`Operation started: ${operationName}`);
  console.log("Polling for completion...");

  // Poll the operation status until the video is ready
  while (true) {
    const statusRes = await fetch(`${PROXY_BASE}/v1beta/${operationName}`, {
      headers: {
        "x-goog-api-key": API_KEY,
      },
    });

    if (!statusRes.ok) {
      const errorText = await statusRes.text();
      throw new Error(
        `Status polling failed (${statusRes.status}): ${errorText}`,
      );
    }

    const statusResponse = await statusRes.json();

    if (statusResponse.done) {
      const videoUri =
        statusResponse.response?.generateVideoResponse?.generatedSamples?.[0]
          ?.video?.uri;

      if (!videoUri) {
        throw new Error(
          `Video generation completed but no URI found: ${JSON.stringify(statusResponse)}`,
        );
      }

      console.log(`Downloading video from: ${videoUri}`);

      // Download the video file
      const videoRes = await fetch(videoUri, {
        headers: {
          "x-goog-api-key": API_KEY,
        },
        redirect: "follow",
      });

      if (!videoRes.ok) {
        throw new Error(
          `Video download failed (${videoRes.status}): ${await videoRes.text()}`,
        );
      }

      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      fs.writeFileSync("veo3.1_with_reference_images.mp4", videoBuffer);
      console.log("Video saved as veo3.1_with_reference_images.mp4");
      break;
    }

    // Wait before polling again
    console.log("Video not ready yet, waiting 10 seconds...");
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main();
