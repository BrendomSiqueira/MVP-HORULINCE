/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { VehicleRecord, MissingPersonRecord, DetectionAlert } from '../types/surveillance.ts';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Eye,
  FileSearch,
  Scan,
} from 'lucide-react';
import { matchVehicleAgainstDatabase, matchPersonAgainstDatabase } from '../utils/securityLogic.ts';

interface Props {
  vehicles: VehicleRecord[];
  persons: MissingPersonRecord[];
  onTriggerAlert: (alert: DetectionAlert) => void;
}

export const ForensicLab: React.FC<Props> = ({ vehicles, persons, onTriggerAlert }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample quick test presets
  const samplePresets = [
    {
      title: 'Avenida - Fiat Argo Roubado (Placa ABC4E29)',
      type: 'vehicle',
      url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      hintPlate: 'ABC4E29',
    },
    {
      title: 'Rodovia - Corolla Furtado (Placa KZZ8810)',
      type: 'vehicle',
      url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop&q=80',
      hintPlate: 'KZZ8810',
    },
    {
      title: 'Praça Pública - Lucas (Alerta Âmbar)',
      type: 'person',
      url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
      hintName: 'Lucas Gabriel Mendes',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setSelectedImage(preset.url);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Build search target hints from our active database
      const activePlates = vehicles.filter((v) => v.status === 'ATIVO').map((v) => ({
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        color: v.color,
      }));

      const activePersons = persons.filter((p) => p.status === 'DESAPARECIDO').map((p) => ({
        name: p.fullName,
        age: p.age,
        gender: p.gender,
        clothing: p.clothingDescription,
      }));

      const res = await fetch('/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
          cameraContext: {
            name: 'Laboratório Forense de Imagens',
            location: 'Terminal de Upload do Operador',
          },
          searchTargets: {
            plates: activePlates,
            persons: activePersons,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao processar imagem no servidor');
      }

      const data = json.data;
      setAnalysisResult(data);

      // Check for vehicle match
      if (data.vehiclesDetected && data.vehiclesDetected.length > 0) {
        for (const v of data.vehiclesDetected) {
          const match = matchVehicleAgainstDatabase(
            { plate: v.plate, color: v.color, model: `${v.brand} ${v.model}` },
            vehicles
          );
          if (match) {
            data.matchedVehicleRecord = match.record;
            data.matchScore = match.score;
            data.matchType = match.matchType;
          }
        }
      }

      // Check for person match
      if (data.personsDetected && data.personsDetected.length > 0) {
        for (const p of data.personsDetected) {
          const match = matchPersonAgainstDatabase(
            {
              gender: p.gender,
              estimatedAge: p.estimatedAge,
              clothingText: p.clothingDescription,
            },
            persons
          );
          if (match) {
            data.matchedPersonRecord = match.record;
            data.matchScore = match.score;
            data.matchType = match.matchType;
          }
        }
      }
    } catch (err: any) {
      console.error('Forensic analysis error:', err);
      setErrorMessage(err.message || 'Falha na comunicação com o motor de IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createAlertFromForensic = () => {
    if (!analysisResult) return;

    const isVeh = Boolean(analysisResult.matchedVehicleRecord);
    const alertId = `alt-forensic-${Date.now()}`;

    const newAlert: DetectionAlert = {
      id: alertId,
      code: `AL-FOR-${Date.now().toString().slice(-4)}`,
      timestamp: 'Agora mesmo',
      cameraId: 'cam-forensic',
      cameraName: 'Análise Forense de Mídia / Upload',
      cameraLocation: 'Central de Triagem de Inteligência',
      originVideo: 'upload externo',
      targetType: isVeh ? 'VEICULO' : 'PESSOA',
      matchType: analysisResult.matchType || 'MATCH_CONFIRMADO',
      confidence: analysisResult.matchScore || 94,
      confidenceCategory: 'alta*',
      priority: isVeh ? analysisResult.matchedVehicleRecord.priority : 'CRITICA',
      reviewState: 'Pendente',
      tacticalSummary:
        analysisResult.matchSummary ||
        'Alvo confirmado durante perícia e extração forense com IA Gemini Vision.',
      vehicleData: isVeh
        ? {
            plateDetected: analysisResult.matchedVehicleRecord.plate,
            matchedRecord: analysisResult.matchedVehicleRecord,
            vehicleMakeModel: `${analysisResult.matchedVehicleRecord.brand} ${analysisResult.matchedVehicleRecord.model}`,
            vehicleColor: analysisResult.matchedVehicleRecord.color,
          }
        : undefined,
      personData: !isVeh && analysisResult.matchedPersonRecord
        ? {
            matchedRecord: analysisResult.matchedPersonRecord,
            personDescription: analysisResult.matchedPersonRecord.fullName,
            clothingObserved: analysisResult.personsDetected?.[0]?.clothingDescription || '',
            estimatedAge: String(analysisResult.matchedPersonRecord.age),
          }
        : undefined,
      boundingBoxes: [
        {
          top: 25,
          left: 25,
          width: 50,
          height: 50,
          label: `PERÍCIA IA: ${isVeh ? analysisResult.matchedVehicleRecord.plate : analysisResult.matchedPersonRecord.fullName}`,
          confidence: 0.94,
          color: '#ef4444',
        },
      ],
      acknowledged: false,
      dispatchStatus: 'NAO_DESPACHADO',
      cercoAtivado: false,
    };

    onTriggerAlert(newAlert);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-950/80 border border-cyan-800 rounded-xl text-cyan-400">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide font-mono">
              LABORATÓRIO FORENSE DE MÍDIA & UPLOAD EXTERNO
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Analise gravações de terceiros, fotos de celulares ou câmeras externas com o modelo Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md"
        >
          <Upload className="w-4 h-4" />
          <span>Fazer Upload de Imagem</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Preset Test Images */}
      <div>
        <span className="text-xs text-slate-400 font-mono block mb-2">
          Ou selecione uma evidência para teste rápido:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center space-x-3 ${
                selectedImage === preset.url
                  ? 'bg-cyan-950/90 border-cyan-500 text-white shadow-lg'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.title}
                className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-xs truncate">{preset.title}</div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                  {preset.type === 'vehicle' ? `Placa: ${preset.hintPlate}` : preset.hintName}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace: Preview & Analysis Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Canvas Preview */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800 select-none">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Evidência a ser analisada"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-mono">Nenhuma imagem selecionada.</p>
                <p className="text-[11px] text-slate-600">Selecione um caso de teste acima ou envie uma foto.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  GEMINI 3.8 FLASH: OCR E BIOMETRIA EM PROCESSAMENTO...
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              Resolução nativa ajustada para leitura forense de caracteres
            </span>
            <button
              onClick={runAnalysis}
              disabled={!selectedImage || isAnalyzing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{isAnalyzing ? 'Processando IA...' : 'Executar Análise de Visão IA'}</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 bg-red-950/80 border border-red-700 rounded-lg text-red-200 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Right: Forensic Technical Report */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <FileSearch className="w-4 h-4 text-cyan-400" />
                <span>LAUDO TÉCNICO DE EXTRAÇÃO FORENSE</span>
              </span>
              {analysisResult && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    analysisResult.matchFound
                      ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {analysisResult.matchFound ? 'ALVO RECONHECIDO' : 'SEM RESTRIÇÕES'}
                </span>
              )}
            </div>

            {analysisResult ? (
              <div className="space-y-4 text-xs font-mono">
                {/* Vehicles detected */}
                {analysisResult.vehiclesDetected && analysisResult.vehiclesDetected.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Veículos Detectados:
                    </span>
                    {analysisResult.vehiclesDetected.map((veh: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">{veh.brand} {veh.model}</span>
                          <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                            PLACA: {veh.plate || 'ILEGÍVEL'}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Cor: {veh.color} &bull; Tipo: {veh.vehicleType}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Persons detected */}
                {analysisResult.personsDetected && analysisResult.personsDetected.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Pessoas Detectadas:
                    </span>
                    {analysisResult.personsDetected.map((p: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-white font-bold">{p.gender} &bull; ~{p.estimatedAge} anos</span>
                          <span className="text-emerald-400">{Math.round((p.confidence || 0.9) * 100)}% conf.</span>
                        </div>
                        <div className="text-purple-300 text-[11px]">{p.clothingDescription}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Match Banner */}
                {analysisResult.matchSummary && (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      analysisResult.matchFound
                        ? 'bg-red-950/90 border-red-700 text-red-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold block mb-1">
                      {analysisResult.matchFound ? 'Resultado do Cruzamento de Dados:' : 'Status da Busca:'}
                    </span>
                    {analysisResult.matchSummary}
                  </div>
                )}

                {analysisResult.tacticalAdvice && (
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 text-[11px]">
                    <span className="text-cyan-400 font-bold block">Recomendação Operacional:</span>
                    {analysisResult.tacticalAdvice}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Execute a análise de visão computacional para visualizar os dados de telemetria e OCR.
              </div>
            )}
          </div>

          {/* Action to dispatch if match */}
          {analysisResult?.matchFound && (
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                onClick={createAlertFromForensic}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer transition-all text-xs font-mono shadow-lg animate-pulse"
              >
                <Send className="w-4 h-4" />
                <span>Emitir Alerta Operacional & Despachar Cerco</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
