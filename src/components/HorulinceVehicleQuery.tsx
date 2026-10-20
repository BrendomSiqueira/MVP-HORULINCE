/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VehicleRecord, DetectionAlert } from '../types/surveillance.ts';
import {
  Car,
  Video,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileSearch,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import { matchVehicleAgainstDatabase, calculatePlateMatchScore } from '../utils/securityLogic.ts';

interface Props {
  vehicleDatabase: VehicleRecord[];
  onOpenFoundVehiclePresentation: (vehicle: VehicleRecord, queryContext: any) => void;
  onLogAudit: (action: any, target: string, justification: string) => void;
}

export const HorulinceVehicleQuery: React.FC<Props> = ({
  vehicleDatabase,
  onOpenFoundVehiclePresentation,
  onLogAudit,
}) => {
  // Test videos list according to Figure 3
  const testVideos = [
    { id: 'teste_01.mp4', label: 'teste_01.mp4', plate: 'TST1A23', color: 'prata', sticker: 'sim (traseira)', damage: 'amassado', confidence: 82 },
    { id: 'teste_02.mp4', label: 'teste_02.mp4', plate: 'ABC4E29', color: 'cinza', sticker: 'não', damage: 'sem avaria visível', confidence: 96 },
    { id: 'teste_03.mp4', label: 'teste_03.mp4', plate: 'KZZ8810', color: 'preto', sticker: 'não', damage: 'sem avaria visível', confidence: 91 },
    { id: 'teste_04.mp4', label: 'teste_04.mp4', plate: 'BRA2E19', color: 'prata', sticker: 'não', damage: 'sem avaria visível', confidence: 94 },
    { id: 'teste_05.mp4', label: 'teste_05.mp4', plate: 'ZZZ9999', color: 'branco', sticker: 'não', damage: 'sem avaria visível', confidence: 60 },
  ];

  const [selectedVideo, setSelectedVideo] = useState(testVideos[0]);
  const [readPlate, setReadPlate] = useState('TST1A23');
  const [estimatedConfidence, setEstimatedConfidence] = useState('82% (estimativa)');
  const [colorObserved, setColorObserved] = useState('prata');
  const [hasSticker, setHasSticker] = useState('sim (traseira)');
  const [damageObserved, setDamageObserved] = useState('amassado');

  // Query Result State
  const [queryExecuted, setQueryExecuted] = useState(true);
  const [matchCategory, setMatchCategory] = useState<'CORRESPONDENCIA_APROXIMADA' | 'REGISTRO_TESTE_CANDIDATO' | 'ERRO_LEITURA' | 'SEM_CORRESPONDENCIA'>('CORRESPONDENCIA_APROXIMADA');
  const [matchedRecord, setMatchedRecord] = useState<VehicleRecord | null>(
    vehicleDatabase.find((v) => v.plate === 'TST1A23') || vehicleDatabase[0]
  );
  const [divergenceText, setDivergenceText] = useState('1 caractere divergente (possível erro de leitura)');

  const handleSelectVideo = (video: typeof testVideos[0]) => {
    setSelectedVideo(video);
    setReadPlate(video.plate);
    setEstimatedConfidence(`${video.confidence}% (estimativa)`);
    setColorObserved(video.color);
    setHasSticker(video.sticker);
    setDamageObserved(video.damage);
    executeMatch(video.plate, video.color);
  };

  const executeMatch = (plateToTest: string, colorToTest: string) => {
    setQueryExecuted(true);

    const match = matchVehicleAgainstDatabase(
      { plate: plateToTest, color: colorToTest },
      vehicleDatabase
    );

    if (match) {
      setMatchedRecord(match.record);

      if (match.score >= 95) {
        setMatchCategory('REGISTRO_TESTE_CANDIDATO');
        setDivergenceText('Correspondência exata de placa e cor');
      } else {
        setMatchCategory('CORRESPONDENCIA_APROXIMADA');
        setDivergenceText('1 caractere divergente (possível erro de leitura)');
      }

      onLogAudit(
        'consulta de placa',
        `Placa ${plateToTest}`,
        `Consulta à lista fictícia de teste: match categoria ${matchCategory}`
      );
    } else {
      setMatchedRecord(null);
      setMatchCategory('SEM_CORRESPONDENCIA');
      setDivergenceText('Nenhuma placa coincidente na lista fictícia');
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeMatch(readPlate, colorObserved);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Top Banner de Conformidade */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-wide font-mono">
              HORULINCE // CONSULTA DE VEÍCULOS
            </h2>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded font-mono font-bold">
              DADOS FICTÍCIOS &bull; SIMULAÇÃO ACADÊMICA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fluxo de leitura automatizada de placa (YOLO + Tesseract) e inspeção de características complementares (cor, adesivos e avarias)
          </p>
        </div>
      </div>

      {/* Grid com as 3 Colunas Exatas da Figura 3 do Artigo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Coluna 1: 1. Vídeo de teste */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
              <Video className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">1. Vídeo de teste</span>
            </div>

            {/* Lista de vídeos de teste */}
            <div className="space-y-1.5 mb-4">
              {testVideos.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => handleSelectVideo(vid)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    selectedVideo.id === vid.id
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{vid.label}</span>
                  <span className="text-[10px] opacity-75">{vid.plate}</span>
                </button>
              ))}
            </div>

            {/* Recorte do quadro / Miniatura de inspeção */}
            <div className="relative aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-3 select-none">
              <div className="text-[10px] text-slate-500 mb-2">Recorte do quadro simulado:</div>
              <div className="bg-white text-slate-950 px-4 py-1.5 rounded border-2 border-blue-600 font-black text-base tracking-widest shadow-lg">
                {readPlate}
              </div>
              <div className="mt-3 flex items-center space-x-2 text-[10px] text-slate-400">
                <span>Veículo: {selectedVideo.color}</span>
                <span>&bull;</span>
                <span className="text-cyan-400">{selectedVideo.damage}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 text-[10px] text-slate-500 italic">
            Quadro extraído da camada de borda do Horulince.
          </div>
        </div>

        {/* Coluna 2: 2. Leitura e detalhes registrados */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <form onSubmit={handleManualSearch} className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
              <FileSearch className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">2. Leitura e detalhes registrados</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Placa lida:</label>
              <input
                type="text"
                value={readPlate}
                onChange={(e) => setReadPlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-bold text-sm tracking-wider focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Confiança estimada:</label>
              <input
                type="text"
                value={estimatedConfidence}
                onChange={(e) => setEstimatedConfidence(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-cyan-300 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Cor observada:</label>
              <select
                value={colorObserved}
                onChange={(e) => setColorObserved(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 cursor-pointer"
              >
                <option value="prata">prata</option>
                <option value="cinza">cinza</option>
                <option value="preto">preto</option>
                <option value="branco">branco</option>
                <option value="azul">azul</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Adesivos:</label>
              <select
                value={hasSticker}
                onChange={(e) => setHasSticker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 cursor-pointer"
              >
                <option value="sim (traseira)">sim (traseira)</option>
                <option value="não">não</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[11px]">Avarias:</label>
              <select
                value={damageObserved}
                onChange={(e) => setDamageObserved(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 cursor-pointer"
              >
                <option value="amassado">amassado</option>
                <option value="sem avaria visível">sem avaria visível</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Consultar Lista Fictícia</span>
            </button>
          </form>

          <div className="pt-2 text-[10px] text-slate-500">
            Parâmetros de conferência para mitigar placas clonadas ou adulteradas.
          </div>
        </div>

        {/* Coluna 3: 3. Consulta à lista fictícia */}
        <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-3">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">3. Consulta à lista fictícia</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1 text-[11px]">Resultado:</span>
              <div
                className={`p-3 rounded-lg border font-bold text-xs ${
                  matchCategory === 'CORRESPONDENCIA_APROXIMADA'
                    ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                    : matchCategory === 'REGISTRO_TESTE_CANDIDATO'
                    ? 'bg-red-950/80 border-red-600 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {matchCategory === 'CORRESPONDENCIA_APROXIMADA' && 'Correspondência aproximada'}
                {matchCategory === 'REGISTRO_TESTE_CANDIDATO' && 'Registro de teste candidato (Confirmado)'}
                {matchCategory === 'ERRO_LEITURA' && 'Erro de leitura'}
                {matchCategory === 'SEM_CORRESPONDENCIA' && 'Sem correspondência na lista'}
              </div>
            </div>

            {divergenceText && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-[11px]">
                {divergenceText}
              </div>
            )}

            {matchedRecord && (
              <div className="p-3.5 bg-slate-900/90 rounded-lg border border-cyan-800/60 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-cyan-400 font-bold">Registro de teste candidato:</span>
                  <span className="text-red-400 font-bold bg-red-950/60 px-1.5 py-0.5 rounded text-[10px]">
                    {matchedRecord.alertType}
                  </span>
                </div>
                <div className="text-white font-bold">{matchedRecord.brand} {matchedRecord.model} ({matchedRecord.year})</div>
                <div className="text-slate-400 text-[11px]">Placa oficial: {matchedRecord.plate} &bull; Cor: {matchedRecord.color}</div>
                <div className="text-slate-400 text-[11px]">BO: {matchedRecord.policeReportNumber}</div>
                <div className="text-[11px] text-slate-300 italic pt-1">{matchedRecord.notes}</div>

                {/* Botão de apresentação do veículo encontrado */}
                <button
                  onClick={() => onOpenFoundVehiclePresentation(matchedRecord, { readPlate, estimatedConfidence, damageObserved })}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded text-xs cursor-pointer transition-all shadow"
                >
                  Abrir Apresentação do Carro Encontrado &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Aviso Obrigatório do Artigo */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 flex items-center space-x-2">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Sem consulta real a sistemas policiais. Demonstração restrita a dados fictícios.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
