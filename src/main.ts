import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const videoElement = document.createElement("video");
videoElement.style.display = "none";
document.body.appendChild(videoElement);

const canvasElement = document.createElement("canvas");
const canvasCtx = canvasElement.getContext("2d")!;
document.body.appendChild(canvasElement);

canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS);
      drawLandmarks(canvasCtx, landmarks);

      const fingerTip = landmarks[8];

      const x = fingerTip.x * canvasElement.width;
      const y = fingerTip.y * canvasElement.height;

      cursorX += (x - cursorX) * 0.3;
      cursorY += (y - cursorY) * 0.3;
    }
  }

  canvasCtx.beginPath();
  canvasCtx.arc(cursorX, cursorY, 15, 0, Math.PI * 2);
  canvasCtx.fillStyle = "rgba(0,255,255,0.9)";
  canvasCtx.shadowBlur = 20;
  canvasCtx.shadowColor = "cyan";
  canvasCtx.fill();

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});

camera.start();
