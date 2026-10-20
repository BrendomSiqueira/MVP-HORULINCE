/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraFeed, DetectionAlert } from '../types/surveillance.ts';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  MapPin,
  Video,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  cameras: CameraFeed[];
  alerts: DetectionAlert[];
  onNavigateToTab: (tab: any) => void;
  onOpenAlertDetails: (alert: DetectionAlert) => void;
}

export const HorulinceDashboard: React.FC<Props> = ({
  cameras,
  alerts,
  onNavigateToTab,
  onOpenAlertDetails,
}) => {
  // Contadores simulados da Figura 2 do Artigo Horulince
  const simulatedEventsCount = 128;
  const pendingAlertsCount = alerts.filter((a) => a.reviewState === 'Pendente').length || 7;
  const inReviewCount = alerts.filter((a) => a.reviewState === 'Em revisão').length || 4;
  const discardedCount = alerts.filter((a) => a.reviewState === 'Descartado').length || 31;
  const confirmedCount = alerts.filter((a) => a.reviewState === 'Confirmado para análise').length || 9;

  // Gráfico da distribuição temporal dos registros (simulado)
  const hourlyDistribution = [
    { hour: '04h', count: 18, heightPercent: 25 },
    { hour: '08h', count: 52, heightPercent: 65 },
    { hour: '12h', count: 74, heightPercent: 88 },
    { hour: '16h', count: 96, heightPercent: 100 },
    { hour: '20h', count: 64, heightPercent: 75 },
    { hour: '24h', count: 28, heightPercent: 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Acadêmico Obrigatório do Artigo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-xl px-4 py-2.5 text-xs font-mono">
        <div className="flex items-center space-x-2 text-amber-300">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold tracking-wider uppercase">
            DADOS FICTÍCIOS &bull; SIMULAÇÃO ACADÊMICA (HORULINCE)
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Fatec Franca &bull; Perspectiva de Diálogo com a GCM e Secretaria de Segurança de Franca
        </div>
      </div>

      {/* Indicadores Principais (Figura 2 do Artigo) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
          <span className="text-[11px] text-slate-400 block">Eventos simulados</span>
          <div className="text-2xl font-bold text-white mt-1">{simulatedEventsCount}</div>
          <span className="text-[10px] text-cyan-400 mt-1">Fontes de vídeo ativas</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-600/40 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
          <span className="text-[11px] text-amber-300 block">Alertas pendentes</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{pendingAlertsCount}</div>
          <span className="text-[10px] text-amber-300/80 mt-1">Aguardando operador</span>
        </div>

        <div className="bg-slate-900/90 border border-blue-600/40 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
          <span className="text-[11px] text-blue-300 block">Em revisão</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{inReviewCount}</div>
          <span className="text-[10px] text-blue-300/80 mt-1">Sob análise humana</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
          <span className="text-[11px] text-slate-400 block">Descartados</span>
          <div className="text-2xl font-bold text-slate-400 mt-1">{discardedCount}</div>
          <span className="text-[10px] text-slate-500 mt-1">Sem correspondência</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-600/40 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
          <span className="text-[11px] text-emerald-300 block">Confirmados p/ análise</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{confirmedCount}</div>
          <span className="text-[10px] text-emerald-300/80 mt-1">Validação humana</span>
        </div>
      </div>

      {/* Gráfico de Distribuição Temporal e Mapa Ilustrativo (Figura 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico de Faixas de Horário */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Registros por faixa de horário (simulado)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Últimas 24h</span>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {hourlyDistribution.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.count}
                  </span>
                  <div
                    className="w-full bg-cyan-600/80 hover:bg-cyan-500 rounded-t transition-all cursor-pointer relative"
                    style={{ height: `${h.heightPercent}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{h.hour}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-3">
            Fluxo volumétrico de passagem de veículos e detecção de caracteres em horários de pico.
          </p>
        </div>

        {/* Mapa Ilustrativo (Figura 2) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Mapa ilustrativo (pontos fictícios)</span>
              </span>
              <button
                onClick={() => onNavigateToTab('TACTICAL_MAP')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
              >
                Ver Mapa Tático Completo &rarr;
              </button>
            </div>

            {/* Stage do Mapa Ilustrativo com Pontos de Franca/SP */}
            <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-3">
              {/* Malha vetorial suave */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="dash-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#dash-grid)" />
                </svg>
              </div>

              {/* Linhas de eixos viários fictícios */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 40 180 Q 200 120 380 140" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
                <path d="M 160 30 L 220 220" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" opacity="0.3" />
              </svg>

              {/* Pontos de câmeras e alertas */}
              {cameras.slice(0, 5).map((cam, idx) => (
                <div
                  key={cam.id}
                  style={{ left: `${cam.coords.x}%`, top: `${cam.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  onClick={() => onNavigateToTab('VIDEO_WALL')}
                >
                  <div className="w-4 h-4 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-[8px] font-bold text-white group-hover:scale-125 transition-transform">
                    {idx + 1}
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                    {cam.name}
                  </div>
                </div>
              ))}

              <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded text-[9px] font-mono text-slate-400">
                Pontos fictícios &bull; Não representam localização real nem estatísticas criminais
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 text-xs font-mono">
            <span className="text-slate-400">{cameras.length} pontos de monitoramento integrados</span>
            <button
              onClick={() => onNavigateToTab('ALERTS_CENTER')}
              className="text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Ver Central de Alertas ({pendingAlertsCount} pendentes)
            </button>
          </div>
        </div>
      </div>

      {/* Tabela Rápida de Alertas Recentes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Últimos Alertas Emitidos (Aguardando Validação Humana)</span>
          </span>
          <button
            onClick={() => onNavigateToTab('ALERTS_CENTER')}
            className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
          >
            Abrir Central de Validação Humana &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Tipo do Evento</th>
                <th className="p-2.5">Origem</th>
                <th className="p-2.5">Data e Hora</th>
                <th className="p-2.5">Confiança</th>
                <th className="p-2.5">Estado</th>
                <th className="p-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alerts.slice(0, 3).map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-white">{alt.code}</td>
                  <td className="p-2.5">
                    {alt.targetType === 'VEICULO' ? 'Correspondência de placa' : 'Evento candidato (busca)'}
                  </td>
                  <td className="p-2.5 text-slate-300">{alt.originVideo}</td>
                  <td className="p-2.5 text-slate-400">{alt.timestamp}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        alt.confidenceCategory === 'alta*'
                          ? 'text-red-400 bg-red-950/80 border border-red-800'
                          : alt.confidenceCategory === 'média*'
                          ? 'text-amber-400 bg-amber-950/80 border border-amber-800'
                          : 'text-purple-400 bg-purple-950/80 border border-purple-800'
                      }`}
                    >
                      {alt.confidenceCategory}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alt.reviewState === 'Confirmado para análise'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : alt.reviewState === 'Em revisão'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : alt.reviewState === 'Descartado'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {alt.reviewState}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => onOpenAlertDetails(alt)}
                      className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/50 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Ver Laudo / Evidência
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
