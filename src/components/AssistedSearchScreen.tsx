/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { INITIAL_PERSON_CASE, INITIAL_CANDIDATE_EVENTS } from '../data/mockSurveillanceData.ts';
import { MissingPersonCase, CandidatePersonEvent } from '../types/surveillance.ts';
import {
  UserSearch,
  Clock,
  MapPin,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface Props {
  onSendCandidateToAlerts: (event: CandidatePersonEvent, caseData: MissingPersonCase) => void;
}

export const AssistedSearchScreen: React.FC<Props> = ({ onSendCandidateToAlerts }) => {
  const [caseData, setCaseData] = useState<MissingPersonCase>(INITIAL_PERSON_CASE);
  const [candidateEvents, setCandidateEvents] = useState<CandidatePersonEvent[]>(INITIAL_CANDIDATE_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_CANDIDATE_EVENTS[0].id);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedEvent = candidateEvents.find((e) => e.id === selectedEventId) || candidateEvents[0];

  const handleUpdateEventState = (
    eventId: string,
    newState: 'Pendente' | 'Em revisão' | 'Descartado' | 'Confirmado p/ análise'
  ) => {
    setCandidateEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, state: newState } : e))
    );
    setStatusMessage(`Evento ${eventId} atualizado para status: ${newState}`);
    setTimeout(() => setStatusMessage(null), 3500);

    if (newState === 'Confirmado p/ análise') {
      const evt = candidateEvents.find((e) => e.id === eventId);
      if (evt) {
        onSendCandidateToAlerts(evt, caseData);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {statusMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main 2-Panel Layout Matching Figura 4 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Panel: Caso fictício FICT-001 (Figura 4) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 font-bold uppercase">
                {caseData.caseCode}
              </span>
              <h3 className="text-base font-bold text-white font-mono mt-1 flex items-center space-x-2">
                <UserSearch className="w-4 h-4 text-purple-400" />
                <span>Dados do Caso em Busca Assistida</span>
              </h3>
            </div>

            {/* Case Fields matching Figura 4 */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Idade aproximada:</span>
                <span className="text-white font-bold text-sm">{caseData.approxAge} anos</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Visto por último:</span>
                <span className="text-white font-medium">{caseData.lastSeenTime}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Referência de Localização:</span>
                <span className="text-cyan-300 font-medium">{caseData.referenceLocation}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">Descrição das Vestimentas & Itens:</span>
                <span className="text-purple-300 font-bold">{caseData.clothingAndItemsDescription}</span>
              </div>
            </div>
          </div>

          {/* Subtitle Caption exact from Figura 4 */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <p className="text-[11px] font-mono text-slate-500 italic text-center">
              Dados mínimos necessários para a simulação
            </p>
          </div>
        </div>

        {/* Right Panel: Eventos candidatos (correspondências pré-configuradas) (Figura 4) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Eventos candidatos (correspondências pré-configuradas)
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Imagens ou registros com atributos correspondentes para revisão do operador
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {candidateEvents.length} candidatos
              </span>
            </div>

            {/* Candidates Table matching Figura 4 */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Origem</th>
                    <th className="p-3">Horário</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {candidateEvents.map((evt) => {
                    const isSelected = selectedEventId === evt.id;
                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-950/40 border-l-2 border-purple-500' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3 font-bold text-white">{evt.id}</td>
                        <td className="p-3 text-slate-300">{evt.originVideo}</td>
                        <td className="p-3 text-slate-400">{evt.timestamp}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              evt.state === 'Confirmado p/ análise'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : evt.state === 'Em revisão'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : evt.state === 'Descartado'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {evt.state}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[11px] text-cyan-400 hover:underline">
                            {isSelected ? 'Selecionado' : 'Examinar'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Candidate Inspection Box */}
            {selectedEvent && (
              <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">
                    Detecção: {selectedEvent.id} &bull; {selectedEvent.originVideo}
                  </span>
                  <span className="text-slate-400">Confiança preliminar: {selectedEvent.confidenceEstimate}</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500 text-[10px] block">Observações do Enquadramento:</span>
                  {selectedEvent.clothingObserved}
                </div>
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleUpdateEventState(selectedEvent.id, 'Confirmado p/ análise')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer transition-colors"
                  >
                    Confirmar para análise
                  </button>
                  <button
                    onClick={() => handleUpdateEventState(selectedEvent.id, 'Em revisão')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold cursor-pointer transition-colors"
                  >
                    Manter em revisão
                  </button>
                  <button
                    onClick={() => handleUpdateEventState(selectedEvent.id, 'Descartado')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-3">
            Eventos candidatos tratados como indício, nunca como identificação definitiva (Seção 2.3).
          </div>
        </div>
      </div>

      {/* Ethical & LGPD Notice Banner - Exact requirement from Figura 4 and Seção 2.3 */}
      <div className="bg-amber-950/40 border-2 border-amber-600/70 rounded-2xl p-4 shadow-xl text-center font-mono">
        <div className="flex items-center justify-center space-x-2 text-amber-300 font-bold text-sm mb-1">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Reconhecimento facial desativado nesta demonstração</span>
        </div>
        <p className="text-xs text-amber-200/90 max-w-3xl mx-auto leading-relaxed">
          A futura avaliação de qualquer biometria exige revisão jurídica, de privacidade, de segurança e de desempenho (Artigo Seção 2.5). O Horulince opera sob o princípio de <strong>busca assistida ética</strong>, comparando apenas atributos não invasivos com supervisão humana estrita.
        </p>
      </div>
    </div>
  );
};
