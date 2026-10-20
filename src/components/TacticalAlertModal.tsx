/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DetectionAlert, PatrolUnit, CameraFeed } from '../types/surveillance.ts';
import {
  ShieldAlert,
  Car,
  User,
  MapPin,
  Clock,
  Radio,
  Send,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Lock,
} from 'lucide-react';
import { predictEscapeRoute } from '../utils/securityLogic.ts';

interface Props {
  alert: DetectionAlert;
  patrols: PatrolUnit[];
  allCameras: CameraFeed[];
  onClose: () => void;
  onDispatchUnit: (alertId: string, unitId: string) => void;
  onActivateCerco: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onPrintReport: (alert: DetectionAlert) => void;
}

export const TacticalAlertModal: React.FC<Props> = ({
  alert,
  patrols,
  allCameras,
  onClose,
  onDispatchUnit,
  onActivateCerco,
  onDismissAlert,
  onPrintReport,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    patrols.find((p) => p.status === 'PATRULHANDO')?.id || patrols[0]?.id || ''
  );
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const isVehicle = alert.targetType === 'VEICULO';
  const vehicle = alert.vehicleData?.matchedRecord;
  const person = alert.personData?.matchedRecord;

  // Predict downstream cameras
  const currentCamera = allCameras.find((c) => c.id === alert.cameraId);
  const escapeRoutes = currentCamera
    ? predictEscapeRoute(currentCamera.id, currentCamera.direction, allCameras)
    : [];

  const handleDispatch = () => {
    if (!selectedUnitId) return;
    onDispatchUnit(alert.id, selectedUnitId);
    const unit = patrols.find((p) => p.id === selectedUnitId);
    setActionSuccessMessage(`Viatura ${unit?.code} despachada com sucesso! Código QAP acionado.`);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  const handleCerco = () => {
    onActivateCerco(alert.id);
    setActionSuccessMessage('Cerco eletrônico ativado! Semáforos e radares periféricos em alerta de contenção.');
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-red-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Tactical Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-600/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500 rounded-xl text-red-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-600 text-white tracking-widest uppercase">
                  {alert.priority} &bull; {alert.matchType.replace('_', ' ')}
                </span>
                <span className="text-xs text-red-300 font-mono">
                  CONFIDÊNCIA: {alert.confidence}% ({alert.confidenceCategory || 'alta*'})
                </span>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/50 px-1.5 py-0.2 rounded font-mono font-bold">
                  DADOS FICTÍCIOS
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5 font-mono">
                HORULINCE // {isVehicle ? 'IDENTIFICAÇÃO DE VEÍCULO LOCALIZADO' : 'LOCALIZAÇÃO DE PESSOA DESAPARECIDA'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action success notification */}
        {actionSuccessMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500 text-emerald-200 px-6 py-2.5 text-xs font-medium flex items-center space-x-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Top Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">CÂMERA DE DETECÇÃO</span>
                <span className="text-slate-200 font-semibold">{alert.cameraName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">REGISTRO TEMPORAL</span>
                <span className="text-slate-200 font-semibold">{alert.timestamp}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">STATUS DO DESPACHO</span>
                <span
                  className={`font-semibold ${
                    alert.dispatchStatus === 'EM_DESLOCAMENTO'
                      ? 'text-emerald-400'
                      : alert.dispatchStatus === 'NAO_DESPACHADO'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {alert.dispatchStatus.replace('_', ' ')} {alert.dispatchedUnit ? `(${alert.dispatchedUnit})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison: Database Record vs Live AI Detection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Box: Database Record */}
            <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    {isVehicle ? <Car className="w-4 h-4 text-cyan-400" /> : <User className="w-4 h-4 text-purple-400" />}
                    <span>REGISTRO OFICIAL NO BANCO DE DADOS</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {isVehicle ? vehicle?.policeReportNumber : person?.policeReportNumber}
                  </span>
                </div>

                {isVehicle && vehicle && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Placa Cadastrada:</span>
                      <span className="text-base font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                        {vehicle.plate}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Marca / Modelo:</span>
                      <span className="text-slate-200 font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Cor Oficial:</span>
                      <span className="text-slate-200 font-medium">{vehicle.color}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Motivo da Queixa:</span>
                      <span className="text-red-400 font-bold">{vehicle.alertType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Proprietário / Vítima:</span>
                      <span className="text-slate-300">{vehicle.victimOrOwner}</span>
                    </div>
                    <div className="pt-2 text-[11px] text-slate-400 italic">
                      Notas do BO: {vehicle.notes}
                    </div>
                  </div>
                )}

                {!isVehicle && person && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={person.photoUrl}
                        alt={person.fullName}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-600 shadow"
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{person.fullName}</div>
                        <div className="text-slate-400 text-[11px]">
                          {person.age} anos &bull; {person.gender} &bull; {person.alertLevel.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-cyan-400 mt-0.5">
                          Contato: {person.emergencyContact}
                        </div>
                      </div>
                    </div>
                    <div className="py-1 border-b border-slate-800/60">
                      <span className="text-slate-400 block text-[10px]">Vestimentas registradas:</span>
                      <span className="text-slate-200">{person.clothingDescription}</span>
                    </div>
                    <div className="py-1 border-b border-slate-800/60">
                      <span className="text-slate-400 block text-[10px]">Sinais Particulares:</span>
                      <span className="text-slate-200">{person.physicalFeatures.distinguishingMarks}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-slate-400 italic">
                      Último local visto: {person.lastSeenLocation} ({person.lastSeenDate})
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Live AI Detection Data */}
            <div className="bg-slate-950/80 border border-cyan-700/50 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-cyan-400" />
                    <span>EXTRAÇÃO FORENSE POR IA GEMINI VISION</span>
                  </span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    MATCH {alert.confidence}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {isVehicle ? (
                    <>
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Placa Reconhecida:</span>
                        <span className="text-base font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-700">
                          {alert.vehicleData?.plateDetected || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Modelo Identificado:</span>
                        <span className="text-slate-200 font-medium">{alert.vehicleData?.vehicleMakeModel}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Cor Detectada no Sensor:</span>
                        <span className="text-slate-200 font-medium">{alert.vehicleData?.vehicleColor}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="py-1 border-b border-slate-800/60">
                        <span className="text-slate-400 block text-[10px]">Roupas / Atributos Observados:</span>
                        <span className="text-purple-300 font-medium">
                          {alert.personData?.clothingObserved || alert.tacticalSummary}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Idade Estimada no Frame:</span>
                        <span className="text-slate-200 font-medium">{alert.personData?.estimatedAge || '14-16 anos'}</span>
                      </div>
                    </>
                  )}

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-xs mt-3">
                    <span className="text-cyan-400 font-semibold block mb-0.5">Parecer da Central de IA:</span>
                    {alert.tacticalSummary}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Escape Route & Intercept Zone */}
          {escapeRoutes.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2 text-xs font-bold text-slate-300 font-mono uppercase">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>ROTA PROVÁVEL DE DESLOCAMENTO & PONTOS DE CERCO A JUSANTE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {escapeRoutes.map((cam, idx) => (
                  <div
                    key={cam.id}
                    className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[10px] text-cyan-400 font-mono">PONTO DE CERCO {idx + 1}</div>
                      <div className="font-semibold text-slate-200 truncate">{cam.name}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">~{cam.distance * 15}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dispatch Patrol Section */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>DESPACHO OPERACIONAL DE FORÇAS DE SEGURANÇA</span>
              </span>
              <span className="text-xs text-slate-400">
                {patrols.filter((p) => p.status === 'PATRULHANDO').length} viaturas livres no raio de ação
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {patrols.map((patrol) => {
                const isSelected = selectedUnitId === patrol.id;
                return (
                  <button
                    key={patrol.id}
                    onClick={() => setSelectedUnitId(patrol.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs font-mono">{patrol.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                        {patrol.agency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">{patrol.officerInCharge}</div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{patrol.distanceKm} km</span>
                      <span className="text-emerald-400 font-semibold">ETA ~{patrol.etaMinutes} min</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDismissAlert(alert.id)}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
            >
              Descartar (Falso Positivo)
            </button>
            <button
              onClick={() => onPrintReport(alert)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700 rounded-lg cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gerar Relatório de Ocorrência</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCerco}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                alert.cercoAtivado
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                  : 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{alert.cercoAtivado ? 'Cerco Ativo' : 'Ativar Cerco Eletrônico'}</span>
            </button>

            <button
              onClick={handleDispatch}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Despachar Viatura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
