/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AssistedSearchCase,
  CandidateSearchEvent,
  MissingPersonRecord,
} from '../types/surveillance.ts';
import {
  OFFICIAL_ASSISTED_CASE,
  INITIAL_PERSONS,
} from '../data/mockSurveillanceData.ts';
import {
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Video,
  FileCheck2,
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  onLogAudit: (action: any, target: string, justification: string) => void;
}

export const HorulinceAssistedSearch: React.FC<Props> = ({ onLogAudit }) => {
  const [activeCase, setActiveCase] = useState<AssistedSearchCase>(OFFICIAL_ASSISTED_CASE);
  const [candidateEvents, setCandidateEvents] = useState<CandidateSearchEvent[]>(
    OFFICIAL_ASSISTED_CASE.candidateEvents
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Alterar estado do evento candidato e registrar auditoria
  const handleUpdateEventState = (
    eventId: string,
    newState: 'Em revisão' | 'Pendente' | 'Descartado' | 'Confirmado'
  ) => {
    setCandidateEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, state: newState } : ev))
    );

    const justificationMap: Record<string, string> = {
      'Confirmado': 'Vestimentas coincidem com mochila azul e camisa branca do caso FICT-001',
      'Descartado': 'Divergência notória de horário ou vestimenta incompatível com o caso',
      'Em revisão': 'Necessária ampliação de quadro e conferência de características',
      'Pendente': 'Aguardando disponibilidade de operador',
    };

    onLogAudit(
      newState === 'Confirmado' ? 'confirmou p/ análise' : newState === 'Descartado' ? 'descartou' : 'solicitou revisão',
      `Evento ${eventId} (Caso ${activeCase.caseId})`,
      justificationMap[newState] || 'Alteração de status do evento candidato'
    );

    setActionMessage(`Evento ${eventId} atualizado para "${newState}" e registrado na auditoria.`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Header com Banner Acadêmico */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-wide font-mono">
              HORULINCE // BUSCA ASSISTIDA DE PESSOA DESAPARECIDA
            </h2>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded font-mono font-bold">
              DADOS FICTÍCIOS &bull; SIMULAÇÃO ACADÊMICA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organização dos dados mínimos de um caso, relacionamento com eventos candidatos de vídeos de teste e apoio à decisão do operador
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg text-xs font-mono flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Grid Central: Caso Fictício vs Eventos Candidatos (Figura 4 do Artigo) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
        {/* Lado Esquerdo: Caso Fictício FICT-001 */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <span className="font-bold text-white uppercase text-xs flex items-center space-x-2">
                <User className="w-4 h-4 text-purple-400" />
                <span>Caso fictício {activeCase.caseId}</span>
              </span>
              <span className="text-[10px] text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                Alerta Assistido
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Idade aproximada:</span>
                <span className="text-white font-semibold">{activeCase.approximateAge} anos</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Visto por último:</span>
                <span className="text-slate-200">{activeCase.lastSeenTime}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Referência geográfica:</span>
                <span className="text-slate-200">{activeCase.locationReference}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Descrição mínima para simulação:</span>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-purple-300 font-bold mt-1">
                  {activeCase.clothingDescription}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 italic">
            Dados mínimos necessários para a simulação sem invasão desnecessária de privacidade.
          </div>
        </div>

        {/* Lado Direito: Eventos Candidatos (correspondências pré-configuradas) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
              <span className="font-bold text-white uppercase text-xs">
                Eventos candidatos (correspondências pré-configuradas)
              </span>
              <span className="text-[10px] text-slate-400">
                {candidateEvents.length} eventos registrados
              </span>
            </div>

            {/* Tabela de Eventos Candidatos (Figura 4) */}
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Origem</th>
                    <th className="p-2.5">Horário</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-right">Ação Humana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                  {candidateEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-bold text-white">{ev.id}</td>
                      <td className="p-2.5 text-slate-300">{ev.originVideo}</td>
                      <td className="p-2.5 text-slate-400">{ev.timestamp}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.state === 'Em revisão'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : ev.state === 'Pendente'
                              ? 'bg-blue-950 text-blue-300 border border-blue-700'
                              : ev.state === 'Confirmado'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ev.state}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {ev.state !== 'Confirmado' && (
                            <button
                              onClick={() => handleUpdateEventState(ev.id, 'Confirmado')}
                              className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-[10px] cursor-pointer"
                              title="Confirmar para análise"
                            >
                              Confirmar
                            </button>
                          )}
                          {ev.state !== 'Descartado' && (
                            <button
                              onClick={() => handleUpdateEventState(ev.id, 'Descartado')}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                              title="Descartar evento"
                            >
                              Descartar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detalhes do Evento Candidato Selecionado */}
            <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">Indício Observado pelo Algoritmo:</span>
              Jovem trajando camiseta clara e mochila azul caminhando na área de cobertura. O algoritmo produz indícios a serem confirmados por pessoas, nunca identificação definitiva.
            </div>
          </div>

          {/* Banner de Conformidade e Reconhecimento Facial Desativado (Figura 4 do Artigo) */}
          <div className="mt-4 p-3 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-300 space-y-1">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Reconhecimento facial desativado nesta demonstração</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Em estrita conformidade com os princípios da LGPD (dados biométricos como dados sensíveis) e considerando os estudos sobre riscos de vieses demográficos (Buolamwini & Gebru, 2018; Grother et al., 2019), a busca assistida não realiza reconhecimento biométrico automatizado, limitando-se ao cruzamento de características gerais, vestimentas e horários para revisão humana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
