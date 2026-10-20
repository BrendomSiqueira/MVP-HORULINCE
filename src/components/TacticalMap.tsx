/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraFeed, PatrolUnit, DetectionAlert } from '../types/surveillance.ts';
import {
  Compass,
  Video,
  Shield,
  Radio,
  Layers,
  AlertTriangle,
  LocateFixed,
  Maximize2,
  Lock,
} from 'lucide-react';

interface Props {
  cameras: CameraFeed[];
  patrols: PatrolUnit[];
  activeAlerts: DetectionAlert[];
  selectedCameraId: string;
  onSelectCamera: (cameraId: string) => void;
  onSelectAlert: (alert: DetectionAlert) => void;
}

export const TacticalMap: React.FC<Props> = ({
  cameras,
  patrols,
  activeAlerts,
  selectedCameraId,
  onSelectCamera,
  onSelectAlert,
}) => {
  const [showRadarPulse, setShowRadarPulse] = useState(true);
  const [filterZone, setFilterZone] = useState<string>('ALL');

  const filteredCameras = filterZone === 'ALL'
    ? cameras
    : cameras.filter((c) => c.zone === filterZone);

  const zones = Array.from(new Set(cameras.map((c) => c.zone)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4">
      {/* Top Map Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/80 border border-cyan-800/80 rounded-xl text-cyan-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base font-mono">
              MAPA TÁTICO GIS // CERCO ELETRÔNICO METROPOLITANO
            </h3>
            <p className="text-xs text-slate-400">
              Posicionamento georreferenciado de sensores ALPR, câmeras de vias e viaturas operacionais
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zona:</span>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-transparent text-cyan-300 font-mono focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas as Zonas ({cameras.length})</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowRadarPulse(!showRadarPulse)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
              showRadarPulse
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Radar {showRadarPulse ? 'Ativo' : 'Pausado'}
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full aspect-[21/9] min-h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden select-none">
        {/* Synthetic Map Vector Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Tactical Arterial Roads Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Av. Paulista & Corredor Centro */}
          <path
            d="M 120 280 Q 280 200 480 210 T 780 180"
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          {/* Rodovia Pres. Dutra */}
          <path
            d="M 400 30 L 650 120 L 760 160"
            fill="none"
            stroke="rgba(56, 189, 248, 0.3)"
            strokeWidth="4"
          />
          {/* Marginal Pinheiros */}
          <path
            d="M 180 80 Q 220 220 200 320"
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="3"
          />

          {/* Active Cerco Vector (Connecting alert camera to downstream intercept points) */}
          {activeAlerts.map((alt) => {
            const originCam = cameras.find((c) => c.id === alt.cameraId);
            if (!originCam) return null;
            return (
              <g key={`cerco-line-${alt.id}`}>
                <circle
                  cx={`${originCam.coords.x}%`}
                  cy={`${originCam.coords.y}%`}
                  r="35"
                  fill="rgba(239, 68, 68, 0.15)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  className="animate-spin-slow"
                />
              </g>
            );
          })}
        </svg>

        {/* Radar Sweep Effect */}
        {showRadarPulse && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-cyan-500/20 pointer-events-none">
            <div className="w-full h-full rounded-full border border-cyan-500/10 animate-ping opacity-25" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/30" />
            <div className="absolute inset-[25%] rounded-full border border-cyan-500/20" />
          </div>
        )}

        {/* Camera Nodes */}
        {filteredCameras.map((camera) => {
          const isSelected = selectedCameraId === camera.id;
          const hasAlert = activeAlerts.some((a) => a.cameraId === camera.id);

          return (
            <div
              key={camera.id}
              style={{ left: `${camera.coords.x}%`, top: `${camera.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            >
              {/* Vision Cone */}
              <div
                className={`absolute pointer-events-none w-16 h-16 -top-8 -left-8 transition-opacity duration-300 ${
                  isSelected || hasAlert ? 'opacity-80' : 'opacity-30 group-hover:opacity-70'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full border-t-2 ${
                    hasAlert
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-slate-500 bg-slate-500/5'
                  }`}
                  style={{
                    transform:
                      camera.direction === 'NORTE'
                        ? 'rotate(0deg)'
                        : camera.direction === 'LESTE'
                        ? 'rotate(90deg)'
                        : camera.direction === 'SUL'
                        ? 'rotate(180deg)'
                        : 'rotate(270deg)',
                  }}
                />
              </div>

              {/* Pin Icon Button */}
              <button
                onClick={() => onSelectCamera(camera.id)}
                className={`relative p-2 rounded-full border-2 transition-transform duration-200 cursor-pointer shadow-lg active:scale-95 ${
                  hasAlert
                    ? 'bg-red-950 border-red-500 text-red-300 animate-bounce'
                    : isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 scale-125 ring-4 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-600 text-slate-300 hover:scale-110 hover:border-cyan-400'
                }`}
                title={`${camera.code} - ${camera.name}`}
              >
                <Video className="w-4 h-4" />
                {hasAlert && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              {/* Label Tooltip */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 border border-slate-700 px-2.5 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-30 font-mono text-[11px]">
                <div className="font-bold text-white">{camera.name}</div>
                <div className="text-slate-400 text-[10px]">{camera.code} &bull; {camera.resolution}</div>
                {hasAlert && <div className="text-red-400 font-bold text-[10px] animate-pulse">ALERTA ATIVO NO PONTO</div>}
              </div>
            </div>
          );
        })}

        {/* Patrol Units Pins */}
        {patrols.map((patrol) => (
          <div
            key={patrol.id}
            style={{ left: `${patrol.coords.x}%`, top: `${patrol.coords.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
          >
            <div className="p-1.5 rounded-md bg-emerald-950/90 border border-emerald-500 text-emerald-300 flex items-center space-x-1 shadow-md text-[10px] font-mono">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="font-bold">{patrol.code}</span>
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap text-slate-300 pointer-events-none z-30">
              {patrol.officerInCharge} ({patrol.agency}) - {patrol.status}
            </div>
          </div>
        ))}

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-300 space-y-1.5">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">LEGENDA DO SISTEMA</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Câmera ALPR Monitorando</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span>Alerta Crítico / Cerco Ativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
            <span>Viatura Policial Patrulhando</span>
          </div>
        </div>

        {/* Active Alert Notification Badge */}
        {activeAlerts.length > 0 && (
          <div className="absolute top-3 right-3 bg-red-950/90 border border-red-500 text-red-200 px-3 py-1.5 rounded-lg shadow-xl text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
            <span>{activeAlerts.length} Ocorrência(s) com Alerta Ativo</span>
          </div>
        )}
      </div>
    </div>
  );
};
