/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DetectionAlert } from '../types/surveillance.ts';
import {
  FileText,
  Printer,
  ShieldAlert,
  Car,
  User,
  Clock,
  MapPin,
  CheckCircle,
  Filter,
  Download,
  Search,
  Eye,
  Radio,
} from 'lucide-react';

interface Props {
  alerts: DetectionAlert[];
  onOpenAlertDetails: (alert: DetectionAlert) => void;
}

export const IncidentHistory: React.FC<Props> = ({ alerts, onOpenAlertDetails }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportModalAlert, setReportModalAlert] = useState<DetectionAlert | null>(null);

  const filteredAlerts = alerts.filter((alt) => {
    const matchesType =
      filterType === 'ALL' ||
      (filterType === 'VEHICLE' && alt.targetType === 'VEICULO') ||
      (filterType === 'PERSON' && alt.targetType === 'PESSOA') ||
      (filterType === 'CRITICA' && alt.priority === 'CRITICA');

    const matchesSearch =
      alt.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.tacticalSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alt.vehicleData?.plateDetected &&
        alt.vehicleData.plateDetected.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (alt.personData?.matchedRecord?.fullName &&
        alt.personData.matchedRecord.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono">
            HISTÓRICO DE OCORRÊNCIAS & LAUDOS TÁTICOS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro auditável de todas as detecções, confirmações de inteligência artificial e despachos operacionais
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-mono"
            >
              <option value="ALL">Todas as Ocorrências ({alerts.length})</option>
              <option value="VEHICLE">Veículos com Queixa</option>
              <option value="PERSON">Pessoas Desaparecidas</option>
              <option value="CRITICA">Prioridade Crítica</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por placa, câmera, pessoa ou resumo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Incidents Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Horário / Data</th>
              <th className="p-3">Tipo / Alvo</th>
              <th className="p-3">Câmera / Localização</th>
              <th className="p-3">Identificação OCR / Visual</th>
              <th className="p-3">Confidência IA</th>
              <th className="p-3">Despacho</th>
              <th className="p-3 text-right">Relatório / Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Nenhuma ocorrência registrada no período selecionado.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alt) => {
                const isVeh = alt.targetType === 'VEICULO';
                return (
                  <tr key={alt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{alt.timestamp}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isVeh
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {isVeh ? <Car className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{isVeh ? 'VEÍCULO' : 'PESSOA'}</span>
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white truncate max-w-[200px]">{alt.cameraName}</div>
                      <div className="text-slate-400 text-[10px] truncate max-w-[200px]">{alt.cameraLocation}</div>
                    </td>

                    <td className="p-3">
                      {isVeh ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                            {alt.vehicleData?.plateDetected || 'N/A'}
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            {alt.vehicleData?.vehicleMakeModel} ({alt.vehicleData?.vehicleColor})
                          </span>
                        </div>
                      ) : (
                        <div className="text-slate-200 font-medium">
                          {alt.personData?.matchedRecord?.fullName || alt.tacticalSummary}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              alt.confidence >= 90 ? 'bg-red-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${alt.confidence}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-bold">{alt.confidence}%</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alt.dispatchStatus === 'EM_DESLOCAMENTO'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : alt.dispatchStatus === 'NAO_DESPACHADO'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {alt.dispatchStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onOpenAlertDetails(alt)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] cursor-pointer"
                          title="Abrir Central Tática"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => setReportModalAlert(alt)}
                          className="p-1 hover:text-white text-slate-400 rounded cursor-pointer"
                          title="Gerar Boletim Digital de Ocorrência"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Printable Digital Incident Report Modal */}
      {reportModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>BOLETIM DE OCORRÊNCIA DIGITAL // CERCO ELETRÔNICO</span>
              </span>
              <button
                onClick={() => setReportModalAlert(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer font-mono"
              >
                [Fechar]
              </button>
            </div>

            {/* Printable Document Area */}
            <div
              id="printable-report"
              className="bg-white text-slate-900 p-6 rounded-xl font-mono text-xs space-y-4 overflow-y-auto flex-1 shadow-inner"
            >
              <div className="text-center border-b-2 border-slate-900 pb-3 flex flex-col items-center">
                <div className="w-12 h-12 mb-2 p-1 border border-slate-400 rounded-lg bg-white flex items-center justify-center">
                  <img src="/assets/aistudio/Gemini_Generated_Image_c7beozc7beozc7be_89a95088.jpg" alt="Horulince" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-sm tracking-widest uppercase">
                  ESTADO DE SÃO PAULO &bull; SECRETARIA DE SEGURANÇA PÚBLICA
                </h3>
                <h4 className="text-xs font-semibold text-slate-700">
                  CENTRO INTEGRADO DE COMANDO E CONTROLE (CICC) &bull; SISTEMA HORULINCE
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  LAUDO PERICIAL DE DETECÇÃO AUTOMATIZADA POR VISÃO COMPUTACIONAL
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] border-b border-slate-300 pb-3">
                <div>
                  <span className="font-bold block">PROTOCOLO HORULINCE:</span>
                  <span>{reportModalAlert.id.toUpperCase()}</span>
                </div>
                <div>
                  <span className="font-bold block">DATA E HORA DO REGISTRO:</span>
                  <span>{reportModalAlert.timestamp}</span>
                </div>
                <div>
                  <span className="font-bold block">CÂMERA DE CAPTURA:</span>
                  <span>{reportModalAlert.cameraName} ({reportModalAlert.cameraId})</span>
                </div>
                <div>
                  <span className="font-bold block">LOCALIZAÇÃO GEORREFERENCIADA:</span>
                  <span>{reportModalAlert.cameraLocation}</span>
                </div>
              </div>

              <div className="border-b border-slate-300 pb-3 space-y-2">
                <div className="font-bold text-slate-900 uppercase">
                  1. DADOS DO ALVO IDENTIFICADO
                </div>
                {reportModalAlert.targetType === 'VEICULO' ? (
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <strong>Placa Reconhecida (ALPR):</strong>{' '}
                      <span className="bg-slate-200 px-2 py-0.5 rounded font-bold">
                        {reportModalAlert.vehicleData?.plateDetected}
                      </span>
                    </div>
                    <div>
                      <strong>Veículo:</strong> {reportModalAlert.vehicleData?.vehicleMakeModel}
                    </div>
                    <div>
                      <strong>Cor do Veículo:</strong> {reportModalAlert.vehicleData?.vehicleColor}
                    </div>
                    <div>
                      <strong>Boletim de Origem:</strong>{' '}
                      {reportModalAlert.vehicleData?.matchedRecord?.policeReportNumber || 'BO-N/A'}
                    </div>
                    <div>
                      <strong>Natureza do Alerta:</strong>{' '}
                      {reportModalAlert.vehicleData?.matchedRecord?.alertType}
                    </div>
                    <div>
                      <strong>Vítima / Comunicante:</strong>{' '}
                      {reportModalAlert.vehicleData?.matchedRecord?.victimOrOwner}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <strong>Nome da Pessoa Desaparecida:</strong>{' '}
                      {reportModalAlert.personData?.matchedRecord?.fullName}
                    </div>
                    <div>
                      <strong>Idade / Gênero:</strong>{' '}
                      {reportModalAlert.personData?.matchedRecord?.age} anos &bull;{' '}
                      {reportModalAlert.personData?.matchedRecord?.gender}
                    </div>
                    <div>
                      <strong>Vestimentas e Sinais:</strong>{' '}
                      {reportModalAlert.personData?.clothingObserved ||
                        reportModalAlert.personData?.matchedRecord?.clothingDescription}
                    </div>
                    <div>
                      <strong>Contato de Emergência:</strong>{' '}
                      {reportModalAlert.personData?.matchedRecord?.emergencyContact}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-b border-slate-300 pb-3 space-y-1">
                <div className="font-bold text-slate-900 uppercase">
                  2. PARECER DA CENTRAL DE INTELIGÊNCIA ARTIFICIAL
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {reportModalAlert.tacticalSummary}
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Índice de Similaridade Algorítmica: <strong>{reportModalAlert.confidence}%</strong> &bull;
                  Classificação de Risco Operacional: <strong>{reportModalAlert.priority}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase">
                  3. AÇÕES OPERACIONAIS E DESPACHO
                </div>
                <div className="text-[11px]">
                  <strong>Status do Despacho:</strong> {reportModalAlert.dispatchStatus.replace('_', ' ')}
                  {reportModalAlert.dispatchedUnit && ` • Viatura: ${reportModalAlert.dispatchedUnit}`}
                </div>
                <div className="text-[11px]">
                  <strong>Cerco Eletrônico e Retenção:</strong>{' '}
                  {reportModalAlert.cercoAtivado ? 'ATIVADO NOS SEMÁFOROS ADJACENTES' : 'NÃO SOLICITADO'}
                </div>
              </div>

              <div className="pt-8 flex justify-between items-end text-[10px] text-slate-500 border-t border-slate-300">
                <div className="text-center w-48">
                  <div className="border-b border-slate-400 mb-1" />
                  <span>Operador de Telemetria CICC</span>
                </div>
                <div className="text-center w-48">
                  <div className="border-b border-slate-400 mb-1" />
                  <span>Comandante de Operações</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800 mt-3">
              <button
                onClick={() => setReportModalAlert(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs cursor-pointer font-mono"
              >
                Fechar
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold cursor-pointer font-mono shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
