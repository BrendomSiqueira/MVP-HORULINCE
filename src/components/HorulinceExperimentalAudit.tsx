/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLogEntry, ExperimentalMetrics } from '../types/surveillance.ts';
import {
  BarChart,
  ShieldCheck,
  FileText,
  Clock,
  User,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';

interface Props {
  auditLogs: AuditLogEntry[];
  metrics: ExperimentalMetrics;
  onRunBenchmarkSimulation: () => void;
  onResetBenchmark: () => void;
}

export const HorulinceExperimentalAudit: React.FC<Props> = ({
  auditLogs,
  metrics,
  onRunBenchmarkSimulation,
  onResetBenchmark,
}) => {
  const [filterUser, setFilterUser] = useState<string>('ALL');

  const filteredLogs = filterUser === 'ALL'
    ? auditLogs
    : auditLogs.filter((log) => log.user === filterUser);

  const uniqueUsers = Array.from(new Set(auditLogs.map((l) => l.user)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6 font-mono text-xs">
      {/* Header com Banner Acadêmico */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-wide">
              HORULINCE // ANÁLISE EXPERIMENTAL E AUDITORIA
            </h2>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded font-bold">
              DADOS FICTÍCIOS &bull; SIMULAÇÃO ACADÊMICA
            </span>
          </div>
          <p className="text-slate-400 mt-1">
            Plano de validação com métricas de desempenho e trilha de auditoria para governança e proteção de dados (Seções 3.4.5 e 3.6)
          </p>
        </div>
      </div>

      {/* Grid com as Duas Colunas da Figura 6 do Artigo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Indicadores (a medir após os testes) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <span className="font-bold text-white uppercase flex items-center space-x-2 text-xs">
                <BarChart className="w-4 h-4 text-cyan-400" />
                <span>Indicadores (a medir após os testes)</span>
              </span>
              <span className="text-[10px] text-slate-500">
                {metrics.isSimulatedBenchmarkDone ? 'Bateria Concluída' : 'Fase de Planejamento'}
              </span>
            </div>

            {/* Tabela de Indicadores (Figura 6) */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Precisão:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.precision}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Revocação:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.recall}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Falsos positivos:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.falsePositives}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Falsos negativos:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.falseNegatives}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Acerto de leitura de placas:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.plateOcrAccuracy}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Latência de processamento:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.latencyMs}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Tempo de revisão pelo operador:</span>
                <span className={`px-2 py-0.5 rounded font-bold ${metrics.isSimulatedBenchmarkDone ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-900 text-slate-400 border border-slate-700'}`}>
                  {metrics.reviewTimeSec}
                </span>
              </div>
            </div>
          </div>

          {/* Controle para simular a rodada de validação acadêmica */}
          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
            {!metrics.isSimulatedBenchmarkDone ? (
              <button
                onClick={onRunBenchmarkSimulation}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-2 shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simular Bateria Experimental (50 Amostras)</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={onResetBenchmark}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Redefinir para "a medir"</span>
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-500 italic">
              Conforme a Seção 3.4.5, até a conclusão dos experimentos reais, os campos aparecem formalmente como "a medir", sem valores fabricados.
            </p>
          </div>
        </div>

        {/* Coluna 2: Registro de auditoria (usuário de teste) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 mb-4 gap-2">
              <span className="font-bold text-white uppercase flex items-center space-x-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Registro de auditoria (usuário de teste)</span>
              </span>

              {/* Filtro por usuário */}
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos os Usuários ({auditLogs.length})</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabela de Auditoria (Figura 6) */}
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Usuário</th>
                    <th className="p-2.5">Ação</th>
                    <th className="p-2.5">Alvo / Identificador</th>
                    <th className="p-2.5">Horário</th>
                    <th className="p-2.5">Justificativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-cyan-300">{log.user}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'confirmou p/ análise'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : log.action === 'descartou'
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300 font-semibold">{log.targetIdentifier}</td>
                      <td className="p-2.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-2.5 text-slate-400 italic text-[11px] max-w-[220px] truncate" title={log.justification}>
                        {log.justification}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diretrizes de Governança LGPD do Artigo (Seção 3.6) */}
          <div className="mt-4 p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1 text-[10px] text-slate-400">
            <div className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diretrizes de Governança e LGPD Implementadas:</span>
            </div>
            <p>
              &bull; <strong>Finalidade Restrita:</strong> Processamento limitado a listas autorizadas de veículos e casos de desaparecimento.
            </p>
            <p>
              &bull; <strong>Minimização & Borda:</strong> Descarte imediato de dados sem correspondência; tráfego central apenas de metadados e recortes.
            </p>
            <p>
              &bull; <strong>Rastreabilidade Total:</strong> Todas as decisões humanas e consultas registradas com justificativa auditável.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
