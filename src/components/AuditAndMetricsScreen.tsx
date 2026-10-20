/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLogEntry, ValidationMetrics } from '../types/surveillance.ts';
import { INITIAL_VALIDATION_METRICS } from '../data/mockSurveillanceData.ts';
import {
  FileText,
  Activity,
  ShieldCheck,
  Download,
  Clock,
  UserCheck,
  CheckCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface Props {
  auditLogs: AuditLogEntry[];
}

export const AuditAndMetricsScreen: React.FC<Props> = ({ auditLogs }) => {
  const [showSimulatedMeasurements, setShowSimulatedMeasurements] = useState(false);
  const metrics = INITIAL_VALIDATION_METRICS;

  const handleExportAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `horulince_auditoria_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 2-Panel Layout Matching Figura 6 of paper */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Panel: Indicadores (a medir após os testes) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Indicadores (a medir após os testes)</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Plano de validação técnica e impacto operacional (Seção 4.2)
                </p>
              </div>
            </div>

            {/* Metrics List matching Figura 6 */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Precisão:</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.precision}%` : 'a medir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Revocação:</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.recall}%` : 'a medir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Falsos positivos:</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.falsePositives}%` : 'a medir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Falsos negativos:</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.falseNegatives}%` : 'a medir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Acerto de leitura de placas:</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.plateAccuracy}%` : 'a medir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Latência (borda):</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'a medir'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.edgeLatencyMs} ms` : 'a medir'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Tempo de revisão:</span>
                <span
                  className={`px-3 py-1 rounded text-[11px] font-bold ${
                    showSimulatedMeasurements
                      ? 'bg-blue-950 text-blue-300 border border-blue-700'
                      : 'a medir'
                  }`}
                >
                  {showSimulatedMeasurements ? `${metrics.avgReviewTimeSec} s` : 'a medir'}
                </span>
              </div>
            </div>
          </div>

          {/* Toggle to illustrate paper experimental expectations (Seção 4.1 e 4.2) */}
          <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
            <button
              onClick={() => setShowSimulatedMeasurements(!showSimulatedMeasurements)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
            >
              {showSimulatedMeasurements ? <ToggleRight className="w-4 h-4 text-cyan-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
              <span>
                {showSimulatedMeasurements ? 'Exibindo Ensaio Prévio' : 'Exibir Métricas do Plano de Testes'}
              </span>
            </button>
            <p className="text-[10px] font-mono text-slate-500 text-center italic">
              Conforme o artigo (Seção 3.4.5), no estágio de projeto os campos constam como "a medir", sem valores fabricados.
            </p>
          </div>
        </div>

        {/* Right Panel: Registro de auditoria (usuário de teste) (Figura 6) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span>Registro de auditoria (usuário de teste)</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Trilha auditável de todas as decisões tomadas por operadores
                </p>
              </div>
              <button
                onClick={handleExportAudit}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-mono cursor-pointer transition-colors shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Trilha</span>
              </button>
            </div>

            {/* Audit Table matching Figura 6 */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Usuário</th>
                    <th className="p-3">Ação</th>
                    <th className="p-3">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {auditLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-cyan-300">{log.user}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action === 'confirmou p/ análise'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : log.action === 'descartou'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{log.time}</td>
                      </tr>
                      {log.justification && (
                        <tr className="bg-slate-950/40">
                          <td colSpan={3} className="px-3 pb-2 text-[10px] text-slate-500 italic">
                            justificativa: {log.justification}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conformidade com a LGPD & Governança (Artigo Seção 3.6):</span>
            </div>
            <p className="text-slate-500 text-[10px]">
              Garante rastreabilidade, prestação de contas (accountability) e previne abordagens indevidas por decisões automatizadas não supervisionadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
