/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TEST_VIDEOS_HORULINCE, INITIAL_VEHICLES_HORULINCE } from '../data/mockSurveillanceData.ts';
import { TestVideoSource, VehicleRecord } from '../types/surveillance.ts';
import {
  Car,
  Video,
  FileCheck2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Search,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  vehiclesDatabase: VehicleRecord[];
  onSendToAlertCenter: (data: {
    plate: string;
    videoSource: string;
    confidence: string;
    confidenceScore: number;
    details: { makeModel: string; color: string; stickers?: string; damage?: string };
    candidateRecord?: VehicleRecord;
  }) => void;
}

export const VehicleQueryScreen: React.FC<Props> = ({ vehiclesDatabase, onSendToAlertCenter }) => {
  const [selectedVideo, setSelectedVideo] = useState<TestVideoSource>(TEST_VIDEOS_HORULINCE[0]);
  const [userCustomPlate, setUserCustomPlate] = useState('');
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const matchedDbRecord = vehiclesDatabase.find(
    (v) =>
      v.plate === selectedVideo.detectedPlate ||
      v.plate.slice(0, 6) === selectedVideo.detectedPlate.slice(0, 6)
  );

  const handleSelectVideo = (video: TestVideoSource) => {
    setSelectedVideo(video);
    setShowCandidateDetails(false);
    setUserCustomPlate('');
  };

  const handleSendToAlerts = () => {
    onSendToAlertCenter({
      plate: selectedVideo.detectedPlate,
      videoSource: selectedVideo.filename,
      confidence: selectedVideo.estimatedConfidence >= 90 ? 'alta*' : selectedVideo.estimatedConfidence >= 75 ? 'média*' : 'baixa*',
      confidenceScore: selectedVideo.estimatedConfidence,
      details: {
        makeModel: matchedDbRecord ? `${matchedDbRecord.brand} ${matchedDbRecord.model}` : 'Veículo não cadastrado',
        color: selectedVideo.detectedColor,
        stickers: selectedVideo.stickers,
        damage: selectedVideo.damage,
      },
      candidateRecord: matchedDbRecord,
    });
    setStatusMessage(`Evento com placa ${selectedVideo.detectedPlate} encaminhado para a Central de Alertas!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {statusMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 3-Column Layout Matching Figura 3 of paper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: 1. Vídeo de teste */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>1. Vídeo de teste</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Selecione um clipe pré-gravado para análise
              </p>
            </div>

            {/* Video List Selector */}
            <div className="space-y-2 mb-4">
              {TEST_VIDEOS_HORULINCE.map((video) => {
                const isSelected = selectedVideo.id === video.id;
                return (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between font-mono text-xs ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold text-cyan-300 block">{video.filename}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{video.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{video.fps} fps</span>
                  </button>
                );
              })}
            </div>

            {/* Video Simulation Canvas / Cropped Frame */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3 select-none">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
                {/* Visual road & car silhouette */}
                <div className="absolute inset-0 bg-slate-950 flex flex-col justify-end p-2">
                  <div className="w-full h-8 bg-slate-800 border-t border-slate-700 relative">
                    <div className="w-8 h-1 bg-white mx-auto mt-3 border-dashed" />
                  </div>
                  {/* Car illustration */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-14 bg-slate-700 rounded-t-xl border border-slate-500 flex flex-col items-center justify-center shadow-lg">
                    <div className="w-16 h-5 bg-slate-900 rounded-t-md mb-1" />
                    {/* Cropped Plate Target */}
                    <div className="bg-white border-2 border-red-500 px-2 py-0.5 rounded shadow">
                      <span className="font-mono font-bold text-xs text-black">
                        {selectedVideo.detectedPlate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-slate-700">
                  {selectedVideo.filename} &bull; {selectedVideo.location}
                </div>
              </div>

              {/* Cropped Plate Focus Badge matching Figura 3 */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono">
                <span className="text-[11px] text-slate-400">Recorte da Placa:</span>
                <span className="text-base font-bold text-white bg-slate-950 px-3 py-1 rounded border border-cyan-500/60 shadow">
                  {selectedVideo.detectedPlate}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-2">
            Quadro simulado com algoritmo YOLOv4 / OpenCV
          </div>
        </div>

        {/* Column 2: 2. Leitura e detalhes registrados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span>2. Leitura e detalhes registrados</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Extração automática do sensor OCR e atributos
              </p>
            </div>

            {/* Form Fields matching Figura 3 */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Placa lida:</span>
                <span className="font-bold text-base text-cyan-300 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                  {selectedVideo.detectedPlate}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Confiança estimada:</span>
                <span className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  {selectedVideo.estimatedConfidence}% (estimativa)
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Cor:</span>
                <span className="text-white capitalize font-medium">{selectedVideo.detectedColor}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Adesivos:</span>
                <span className="text-white">{selectedVideo.stickers}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Avarias:</span>
                <span className="text-white">{selectedVideo.damage}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 font-mono block">
              Conferência de marca, modelo e cor para mitigação de clonagem (Artigo Seção 3.4.2)
            </span>
          </div>
        </div>

        {/* Column 3: 3. Consulta à lista fictícia */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>3. Consulta à lista fictícia</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Cruzamento na base de veículos com queixa
              </p>
            </div>

            {/* Result Badge matching Figura 3 */}
            <div className="space-y-4 font-mono">
              <div>
                <span className="text-slate-400 text-xs block mb-1">Resultado:</span>
                <div
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center space-x-2 ${
                    selectedVideo.matchClassification === 'Correspondência exata'
                      ? 'bg-red-950/80 border-red-600 text-red-200'
                      : selectedVideo.matchClassification === 'Correspondência aproximada'
                      ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{selectedVideo.matchClassification}</span>
                </div>
              </div>

              {/* Detail message matching Figura 3 */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 text-[10px] block uppercase font-bold mb-1">Diagnóstico da Comparação:</span>
                <span>{selectedVideo.divergenceNotes}</span>
              </div>

              {/* Action Button: Registro de teste candidato */}
              <button
                onClick={() => setShowCandidateDetails(!showCandidateDetails)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all flex items-center justify-center space-x-2 shadow"
              >
                <span>Registro de teste candidato</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Candidate Record Card if expanded */}
              {showCandidateDetails && matchedDbRecord && (
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-cyan-500/50 text-xs font-mono space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-cyan-300">Placa Oficial: {matchedDbRecord.plate}</span>
                    <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800 font-bold">
                      {matchedDbRecord.alertType}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {matchedDbRecord.brand} {matchedDbRecord.model} ({matchedDbRecord.year}) &bull; {matchedDbRecord.color}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Boletim: {matchedDbRecord.policeReportNumber} &bull; Local: {matchedDbRecord.incidentLocation}
                  </div>
                  <button
                    onClick={handleSendToAlerts}
                    className="w-full mt-2 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs cursor-pointer transition-all shadow"
                  >
                    Encaminhar para Central de Alertas
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Legal Footnote exact from Figura 3 */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[11px] font-mono text-slate-500 text-center italic">
              Sem consulta real a sistemas policiais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
