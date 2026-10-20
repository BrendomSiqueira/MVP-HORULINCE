/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HorulinceAlert, AlertReviewState } from '../types/surveillance.ts';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Car,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react';

interface Props {
  alerts: HorulinceAlert[];
  onUpdateAlertState: (
    alertId: string,
    newState: AlertReviewState,
    justification: string
  ) => void;
}

export const AlertsCenterScreen: React.FC<Props> = ({ alerts, onUpdateAlertState }) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [justificationModal, setJustificationModal] = useState<{
    isOpen: boolean;
    targetState: AlertReviewState | null;
    alertId: string | null;
  }>({ isOpen: false, targetState: null, alertId: null });
  const [justificationText, setJustificationText] = useState('');
  const [operatorName, setOperatorName] = useState('teste_op1');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const handleOpenJustification = (newState: AlertReviewState) => {
    if (!selectedAlert) return;
    setJustificationText('');
    setJustificationModal({
      isOpen: true,
      targetState: newState,
      alertId: selectedAlert.id,
    });
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificationModal.alertId || !justificationModal.targetState) return;

    const just = justificationText.trim() || 'Validação padrão realizada pelo operador de bancada.';
    onUpdateAlertState(justificationModal.alertId, justificationModal.targetState, `${operatorName}: ${just}`);

    setFeedbackNotice(
      `Alerta ${justificationModal.alertId} atualizado para "${justificationModal.targetState}" e registrado na trilha de auditoria!`
    );
    setJustificationModal({ isOpen: false, targetState: null, alertId: null });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {feedbackNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Main Container matching Figura 5 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Central de alertas e validação humana</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Validação humana obrigatória antes de qualquer encaminhamento (RF05)
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-400">Operador:</span>
              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-cyan-300 font-bold">
                {operatorName}
              </span>
            </div>
          </div>

          {/* Table matching Figura 5 */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 mt-4">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Tipo do evento</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3">Data e hora</th>
                  <th className="p-3">Evidência</th>
                  <th className="p-3">Confiança</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {alerts.map((alt) => {
                  const isSelected = selectedAlertId === alt.id;
                  return (
                    <tr
                      key={alt.id}
                      onClick={() => setSelectedAlertId(alt.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 border-l-4 border-cyan-400' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-bold text-white">{alt.id}</td>
                      <td className="p-3 text-slate-300">{alt.eventType}</td>
                      <td className="p-3 text-slate-400">{alt.origin}</td>
                      <td className="p-3 text-slate-300">{alt.dateTime}</td>
                      <td className="p-3 text-cyan-400 underline">{alt.evidenceSnippet}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            alt.confidenceLevel === 'alta*'
                              ? 'text-red-400'
                              : alt.confidenceLevel === 'média*'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {alt.confidenceLevel}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alt.state === 'Confirmado p/ análise'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : alt.state === 'Em revisão'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : alt.state === 'Descartado'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {alt.state}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footnote exact from Figura 5 */}
          <div className="pt-3">
            <p className="text-[11px] font-mono text-slate-500 italic">
              *Nível de confiança é uma estimativa do algoritmo sobre a semelhança, não uma conclusão de que haja crime.
            </p>
          </div>

          {/* Selected Evidence Preview Box */}
          {selectedAlert && (
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300">
                  Inspeção da Evidência: {selectedAlert.id} &bull; {selectedAlert.origin}
                </span>
                <span className="text-slate-400">Data/Hora: {selectedAlert.dateTime}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 text-[11px]">
                {selectedAlert.plateCandidate && (
                  <div>
                    <span className="text-slate-500 block">Placa Lido no Sensor:</span>
                    <span className="text-base font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {selectedAlert.plateCandidate}
                    </span>
                  </div>
                )}
                {selectedAlert.vehicleDetails && (
                  <div>
                    <span className="text-slate-500 block">Veículo / Cor:</span>
                    <span>
                      {selectedAlert.vehicleDetails.makeModel} &bull; {selectedAlert.vehicleDetails.color}
                    </span>
                  </div>
                )}
              </div>
              {selectedAlert.justification && (
                <div className="text-[11px] text-amber-300 bg-slate-900 p-2 rounded border border-slate-800">
                  <strong>Auditoria Registrada:</strong> {selectedAlert.justification}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons & Bottom Disclaimer matching Figura 5 */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-start gap-3">
            <button
              onClick={() => handleOpenJustification('Confirmado p/ análise')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar para análise</span>
            </button>

            <button
              onClick={() => handleOpenJustification('Descartado')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Descartar</span>
            </button>

            <button
              onClick={() => handleOpenJustification('Em revisão')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Solicitar revisão</span>
            </button>
          </div>

          {/* Bottom Disclaimer Caption exact from Figura 5 */}
          <p className="text-[11px] font-mono text-slate-400 italic">
            A confirmação é apenas uma decisão simulada do fluxo acadêmico.
          </p>
        </div>
      </div>

      {/* Justification & Operator Signoff Modal (RF05) */}
      {justificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl font-mono text-xs">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Supervisão Humana Obrigatória (RF05)</span>
            </h4>
            <p className="text-slate-400 mb-4">
              Informe a justificativa operacional para a ação "
              <strong className="text-white">{justificationModal.targetState}</strong>" no alerta{' '}
              <strong className="text-cyan-300">{justificationModal.alertId}</strong>:
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Identificação do Operador:</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Justificativa Operacional *:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Placa dentro do padrão e conferência positiva de cor e modelo..."
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setJustificationModal({ isOpen: false, targetState: null, alertId: null })}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded cursor-pointer"
                >
                  Registrar em Auditoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
