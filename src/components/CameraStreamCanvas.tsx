/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { CameraFeed, BoundingBox } from '../types/surveillance.ts';
import { Camera, Radio, Video, RefreshCw, ZoomIn, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  camera: CameraFeed;
  boundingBoxes: BoundingBox[];
  isScanning: boolean;
  onCaptureFrame: (base64Image: string) => void;
  onRequestSimulatedIncident?: (targetType: 'vehicle' | 'person') => void;
}

export const CameraStreamCanvas: React.FC<Props> = ({
  camera,
  boundingBoxes,
  isScanning,
  onCaptureFrame,
  onRequestSimulatedIncident,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const animationFrameId = useRef<number | null>(null);

  // Simulation state for procedural CCTV rendering
  const simState = useRef({
    vehicleOffset1: 0,
    vehicleOffset2: 240,
    pedestrianOffset: 50,
    scanLineY: 0,
    scanDir: 1,
    timeTicker: Date.now(),
  });

  // Handle webcam toggle
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useWebcam) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Webcam access error:', err);
          setWebcamError('Não foi possível acessar a webcam local. Usando feed tático simulado.');
          setUseWebcam(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useWebcam]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const state = simState.current;

      // Update offsets
      state.vehicleOffset1 = (state.vehicleOffset1 + 1.8) % (width + 200);
      state.vehicleOffset2 = (state.vehicleOffset2 + 1.2) % (width + 200);
      state.pedestrianOffset = (state.pedestrianOffset + 0.6) % (width + 100);

      state.scanLineY += 2 * state.scanDir;
      if (state.scanLineY > height) state.scanDir = -1;
      if (state.scanLineY < 0) state.scanDir = 1;

      // Clear
      ctx.save();
      ctx.fillStyle = '#060b11';
      ctx.fillRect(0, 0, width, height);

      if (useWebcam && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw real webcam
        ctx.drawImage(videoRef.current, 0, 0, width, height);
      } else {
        // Draw synthetic high-fidelity CCTV scenario
        drawSyntheticCCTV(ctx, width, height, camera, state);
      }

      // Draw ALPR Laser Scanline if scanning
      if (isScanning) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, state.scanLineY);
        ctx.lineTo(width, state.scanLineY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.fillRect(0, Math.max(0, state.scanLineY - 40), width, 40);
        ctx.shadowBlur = 0;
      }

      // Draw Tactical Bounding Boxes
      if (boundingBoxes && boundingBoxes.length > 0) {
        boundingBoxes.forEach((b) => {
          const bx = (b.left / 100) * width;
          const by = (b.top / 100) * height;
          const bw = (b.width / 100) * width;
          const bh = (b.height / 100) * height;

          // Box border
          ctx.strokeStyle = b.color || '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(bx, by, bw, bh);

          // Tactical HUD corner ticks
          const tickLen = 12;
          ctx.fillStyle = b.color || '#ef4444';
          // Top-left
          ctx.fillRect(bx - 2, by - 2, tickLen, 3);
          ctx.fillRect(bx - 2, by - 2, 3, tickLen);
          // Top-right
          ctx.fillRect(bx + bw - tickLen + 2, by - 2, tickLen, 3);
          ctx.fillRect(bx + bw - 1, by - 2, 3, tickLen);
          // Bottom-left
          ctx.fillRect(bx - 2, by + bh - 1, tickLen, 3);
          ctx.fillRect(bx - 2, by + bh - tickLen + 2, 3, tickLen);
          // Bottom-right
          ctx.fillRect(bx + bw - tickLen + 2, by + bh - 1, tickLen, 3);
          ctx.fillRect(bx + bw - 1, by + bh - tickLen + 2, 3, tickLen);

          // Badge label
          ctx.fillStyle = b.color || '#ef4444';
          ctx.fillRect(bx, Math.max(0, by - 22), Math.min(bw, 260), 22);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(b.label, bx + 6, Math.max(15, by - 7));
        });
      }

      // Draw CCTV Telemetry Overlay
      drawCctvOverlay(ctx, width, height, camera, isScanning);

      ctx.restore();

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [camera, boundingBoxes, isScanning, useWebcam]);

  // Capture current canvas frame as base64
  const triggerCapture = () => {
    if (!canvasRef.current) return;
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
    onCaptureFrame(base64);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex flex-col">
      {/* CCTV Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        />
        {/* Hidden video tag for real webcam stream */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />

        {/* Live Status Watermark */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
          <span className="text-red-400 font-bold uppercase tracking-wider">AO VIVO // REC</span>
          <span className="text-slate-400">|</span>
          <span className="text-cyan-400">{camera.code}</span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-400">{camera.fps} FPS</span>
        </div>

        {/* Scan in progress alert tag */}
        {isScanning && (
          <div className="absolute top-3 right-3 bg-cyan-950/90 border border-cyan-500/80 text-cyan-300 px-3 py-1.5 rounded flex items-center space-x-2 shadow-lg animate-pulse text-xs font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>OCR & VISÃO COMPUTACIONAL GEMINI IA...</span>
          </div>
        )}

        {/* Camera Location Watermark */}
        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700/80 text-xs font-mono max-w-[70%]">
          <div className="text-slate-200 font-bold truncate">{camera.name}</div>
          <div className="text-slate-400 text-[11px] truncate">{camera.locationName} &bull; Direção {camera.direction}</div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded border border-slate-700 text-xs text-slate-300 font-mono">
          <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setZoomLevel((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1))}
            className="hover:text-cyan-400 px-1 py-0.5 rounded cursor-pointer"
            title="Ajustar zoom digital"
          >
            {zoomLevel}x
          </button>
        </div>
      </div>

      {/* Control Bar Below Video */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          {/* Real AI Scan Action */}
          <button
            onClick={triggerCapture}
            disabled={isScanning}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-semibold px-3 py-1.5 rounded shadow cursor-pointer transition-all active:scale-95"
            title="Capturar frame e rodar IA Gemini Vision"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>{isScanning ? 'Processando IA...' : 'Analisar Frame com IA'}</span>
          </button>

          {/* Toggle Webcam Button */}
          <button
            onClick={() => {
              setWebcamError(null);
              setUseWebcam(!useWebcam);
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
              useWebcam
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{useWebcam ? 'Webcam Ativa' : 'Testar com Minha Câmera'}</span>
          </button>
        </div>

        {/* Tactical Injection Helpers */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px] font-mono">Simular Enquadramento:</span>
          {onRequestSimulatedIncident && (
            <>
              <button
                onClick={() => onRequestSimulatedIncident('vehicle')}
                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 px-2.5 py-1 rounded cursor-pointer transition-all"
                title="Posicionar veículo procurado no campo de visão"
              >
                Veículo com Queixa
              </button>
              <button
                onClick={() => onRequestSimulatedIncident('person')}
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/40 px-2.5 py-1 rounded cursor-pointer transition-all"
                title="Posicionar pessoa desaparecida no campo de visão"
              >
                Pessoa Desaparecida
              </button>
            </>
          )}
        </div>
      </div>

      {webcamError && (
        <div className="px-4 py-1.5 bg-amber-950/80 border-t border-amber-700/50 text-amber-300 text-[11px]">
          {webcamError}
        </div>
      )}
    </div>
  );
};

// Helper: Procedural synthetic CCTV graphics
function drawSyntheticCCTV(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraFeed,
  state: { vehicleOffset1: number; vehicleOffset2: number; pedestrianOffset: number }
) {
  const isPedestrianScenario = camera.scenarioType === 'calcadao_pedestres';

  if (isPedestrianScenario) {
    // Sidewalk / pedestrian square background
    ctx.fillStyle = '#101720';
    ctx.fillRect(0, 0, width, height);

    // Stone tiles grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Street lamps / trees silhouettes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(60, 80, 16, 260);
    ctx.fillRect(40, 70, 56, 15);
    ctx.fillRect(width - 120, 90, 16, 250);

    // Pedestrian 1: Target Lucas (Navy jacket, gray hood, jeans)
    const px1 = (state.pedestrianOffset + 150) % (width + 60) - 30;
    drawPedestrian(ctx, px1, 160, '#1e3a8a', '#64748b', 'Lucas Gabriel M. [Alvo Âmbar]');

    // Pedestrian 2: Bystander
    const px2 = (state.pedestrianOffset + 350) % (width + 60) - 30;
    drawPedestrian(ctx, px2, 190, '#dc2626', '#fef08a', 'Pedestre [Civil]');
  } else {
    // Road / Highway scenario
    // Sky / City silhouette
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, width, height * 0.35);

    // Distant buildings
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, height * 0.15, 60, height * 0.2);
    ctx.fillRect(120, height * 0.08, 80, height * 0.27);
    ctx.fillRect(220, height * 0.18, 50, height * 0.17);
    ctx.fillRect(350, height * 0.12, 110, height * 0.23);
    ctx.fillRect(500, height * 0.16, 75, height * 0.19);
    ctx.fillRect(620, height * 0.1, 90, height * 0.25);

    // Road asphalt
    ctx.fillStyle = '#181f2a';
    ctx.fillRect(0, height * 0.35, width, height * 0.65);

    // Road lane markings
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 20]);
    // Lane 1 divider
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    ctx.lineTo(width, height * 0.58);
    ctx.stroke();

    // Lane 2 divider
    ctx.beginPath();
    ctx.moveTo(0, height * 0.82);
    ctx.lineTo(width, height * 0.82);
    ctx.stroke();
    ctx.setLineDash([]);

    // Highway barrier / curb
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, height * 0.35 - 8, width, 8);

    // Vehicle 1: Stolen Fiat Argo (Gray) - Target
    const v1x = (state.vehicleOffset1 % (width + 250)) - 100;
    drawCar(ctx, v1x, height * 0.42, '#64748b', 'ABC-4E29', 'Fiat Argo [ROUBO]');

    // Vehicle 2: Regular car (White)
    const v2x = ((state.vehicleOffset2 + 200) % (width + 250)) - 100;
    drawCar(ctx, v2x, height * 0.64, '#cbd5e1', 'RTA-9J12', 'VW Gol');
  }
}

// Procedural vehicle drawing
function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bodyColor: string,
  plate: string,
  label: string
) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x + 90, y + 65, 80, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 25, y + 42, 28, 26);
  ctx.fillRect(x + 130, y + 42, 28, 26);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 32, y + 48, 14, 14);
  ctx.fillRect(x + 137, y + 48, 14, 14);

  // Chassis bottom
  ctx.fillStyle = '#090d16';
  ctx.fillRect(x + 10, y + 36, 165, 18);

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x + 10, y + 18, 165, 26, 6);
  ctx.fill();

  // Cabin
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x + 45, y - 4, 95, 24, 6);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(x + 50, y - 2, 40, 18, 3);
  ctx.roundRect(x + 94, y - 2, 42, 18, 3);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(x + 168, y + 22, 7, 8);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 8, y + 22, 6, 8);

  // License plate tag on rear/front
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 140, y + 34, 30, 9);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 7px "JetBrains Mono", monospace';
  ctx.fillText(plate, x + 142, y + 41);

  ctx.restore();
}

// Procedural pedestrian drawing
function drawPedestrian(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  jacketColor: string,
  pantsColor: string,
  label: string
) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 110, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(x + 18, y + 15, 12, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#331b0a';
  ctx.beginPath();
  ctx.arc(x + 18, y + 12, 12, Math.PI, Math.PI * 2);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 13, y + 13, 10, 5);

  // Torso / Jacket
  ctx.fillStyle = jacketColor;
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 27, 24, 42, 4);
  ctx.fill();

  // Legs / Pants
  ctx.fillStyle = pantsColor;
  ctx.fillRect(x + 8, y + 69, 9, 36);
  ctx.fillRect(x + 19, y + 69, 9, 36);

  // Shoes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 6, y + 104, 12, 7);
  ctx.fillRect(x + 19, y + 104, 12, 7);

  ctx.restore();
}

function drawCctvOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: CameraFeed,
  isScanning: boolean
) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR') + '.' + String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');

  // Top header text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillText(`CAM-ID: ${camera.code}`, 12, 22);
  ctx.fillText(`${dateStr} ${timeStr}`, width - 180, 22);

  // Crosshair in center
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  const cx = width / 2;
  const cy = height / 2;
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy);
  ctx.lineTo(cx + 15, cy);
  ctx.moveTo(cx, cy - 15);
  ctx.lineTo(cx, cy + 15);
  ctx.stroke();

  // Scanline subtle texture effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let i = 0; i < height; i += 4) {
    ctx.fillRect(0, i, width, 1);
  }
}
