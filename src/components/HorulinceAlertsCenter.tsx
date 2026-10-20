/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DetectionAlert, ReviewState } from '../types/surveillance.ts';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Info,
  Car,
  User,
  AlertTriangle,
  Send,
  FileText,
} from 'lucide-react';

interface Props {
  alerts: DetectionAlert[];
  onUpdateAlertState: (alertId: string, newState: ReviewState, justification: string) => void;
  onOpenAlertDetails: (alert: DetectionAlert) => void;
}

export const HorulinceAlertsCenter: React.FC<Props> = ({
  alerts,
  onUpdateAlertState,
  onOpenAlertDetails,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [justificationModal, setJustificationModal] = useState<{
    alertId: string;
    newState: ReviewState;
    defaultJustification: string;
  } | null>(null);
  const [customJustification, setCustomJustification] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const handleTriggerAction = (newState: ReviewState) => {
    if (!selectedAlert) return;

    let defaultJust = '';
    if (newState === 'Confirmado para análise') {
      defaultJust = 'Placa e cor conferem com o registro da lista fictícia. Requer análise institucional.';
    } else if (newState === 'Descartado') {
      defaultJust = 'Caracteres da placa divergentes ou evidência insuficiente.';
    } else {
      defaultJust = 'Necessária revisão manual em velocidade reduzida ou imagem de melhor resolução.';
    }

    setCustomJustification(defaultJust);
    setJustificationModal({
      alertId: selectedAlert.id,
      newState,
      defaultJustification: defaultJust,
    });
  };

  const confirmAction = () => {
    if (!justificationModal) return;
    const finalJust = customJustification.trim() || justificationModal.defaultJustification;
    onUpdateAlertState(justificationModal.alertId, justificationModal.newState, finalJust);
    setActionNotice(`Decisão registrada: Alerta ${justificationModal.alertId} marcado como "${justificationModal.newState}".`);
    setJustificationModal(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Header com Banner Acadêmico */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-wide font-mono">
              HORULINCE // CENTRAL DE ALERTAS E VALIDAÇÃO HUMANA
            </h2>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded font-mono font-bold">
              DADOS FICTÍCIOS &bull; SIMULAÇÃO ACADÊMICA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisão humana obrigatória antes de qualquer encaminhamento institucional (Seção 3.4.4 do Artigo)
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabela de Alertas Principal (Figura 5 do Artigo) */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[11px]">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Tipo do evento</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Data e hora</th>
              <th className="p-3">Evidência</th>
              <th className="p-3">Confiança</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
            {alerts.map((alt) => {
              const isSelected = selectedAlertId === alt.id;
              return (
                <tr
                  key={alt.id}
                  onClick={() => setSelectedAlertId(alt.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/60 border-l-4 border-cyan-400'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="p-3 font-bold text-white">{alt.code}</td>
                  <td className="p-3">
                    <span className="flex items-center space-x-1.5">
                      {alt.targetType === 'VEICULO' ? (
                        <Car className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      <span>
                        {alt.targetType === 'VEICULO'
                          ? 'Correspondência de placa'
                          : 'Evento candidato (busca)'}
                      </span>
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{alt.originVideo}</td>
                  <td className="p-3 text-slate-400">{alt.timestamp}</td>
                  <td className="p-3 text-cyan-300 underline text-[11px]">
                    {alt.evidenceSnippet || 'recorte do quadro'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alt.confidenceCategory === 'alta*'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : alt.confidenceCategory === 'média*'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {alt.confidenceCategory}
                    </span>
                  </td>
                  <td className="p-3">
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
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAlertDetails(alt);
                      }}
                      className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/60 text-cyan-200 border border-cyan-500/50 rounded text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Ver Laudo / Evidência
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nota Obrigatória de Rodapé do Artigo */}
      <div className="text-[11px] text-slate-400 font-mono italic">
        * Nível de confiança é uma estimativa do algoritmo sobre a semelhança, não uma conclusão do que haja ilícito.
      </div>

      {/* Painel de Decisão do Alerta Selecionado com Botões Oficiais da Figura 5 */}
      {selectedAlert && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white uppercase">
                ALERTA SELECIONADO: {selectedAlert.code} &bull; {selectedAlert.originVideo}
              </span>
              <span className="text-[10px] font-mono text-slate-400">({selectedAlert.timestamp})</span>
            </div>
            <button
              onClick={() => onOpenAlertDetails(selectedAlert)}
              className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
            >
              Apresentação detalhada do veículo/alvo &rarr;
            </button>
          </div>

          <div className="text-xs font-mono text-slate-300">
            <span className="text-slate-500 block text-[10px]">EVIDÊNCIA OBSERVADA NO QUADRO:</span>
            <p className="mt-0.5">{selectedAlert.tacticalSummary}</p>
          </div>

          {/* Os 3 Botões de Ação Padronizados da Figura 5 */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleTriggerAction('Confirmado para análise')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs font-mono cursor-pointer transition-all shadow-md active:scale-95 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar para análise</span>
            </button>

            <button
              onClick={() => handleTriggerAction('Descartado')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs font-mono cursor-pointer transition-all active:scale-95 flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Descartar</span>
            </button>

            <button
              onClick={() => handleTriggerAction('Em revisão')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs font-mono cursor-pointer transition-all shadow-md active:scale-95 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Solicitar revisão</span>
            </button>
          </div>

          {/* Nota de Esclarecimento Jurídico / Ético da Figura 5 */}
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Rótulos escolhidos para não induzir a uma conclusão criminal automática. A confirmação é apenas uma decisão simulada do fluxo acadêmico.
          </div>
        </div>
      )}

      {/* Modal de Justificativa para Auditoria */}
      {justificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl font-mono text-xs">
            <h3 className="text-sm font-bold text-white mb-2 uppercase flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>SUPERVISÃO HUMANA: JUSTIFICATIVA DE AUDITORIA</span>
            </h3>
            <p className="text-slate-400 text-[11px] mb-4">
              Ação a ser executada: <strong>{justificationModal.newState}</strong> para o alerta {justificationModal.alertId}. O registro será gravado na trilha de auditoria para fins de governança.
            </p>

            <label className="text-slate-300 block mb-1 text-[11px]">Justificativa do operador (obrigatória):</label>
            <textarea
              rows={3}
              value={customJustification}
              onChange={(e) => setCustomJustification(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:border-cyan-500"
              placeholder="Descreva o motivo técnico ou operacional da decisão..."
            />

            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setJustificationModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded cursor-pointer shadow"
              >
                Gravar na Auditoria e Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
