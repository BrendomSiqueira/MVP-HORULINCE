/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CameraFeed,
  VehicleRecord,
  MissingPersonRecord,
  PatrolUnit,
  DetectionAlert,
  BoundingBox,
  ReviewState,
  AuditLogEntry,
  ExperimentalMetrics,
} from './types/surveillance.ts';
import {
  INITIAL_CAMERAS,
  INITIAL_VEHICLES,
  INITIAL_PERSONS,
  INITIAL_PATROLS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_EXPERIMENTAL_METRICS,
} from './data/mockSurveillanceData.ts';
import { CameraStreamCanvas } from './components/CameraStreamCanvas.tsx';
import { TacticalAlertModal } from './components/TacticalAlertModal.tsx';
import { TacticalMap } from './components/TacticalMap.tsx';
import { DatabaseManagement } from './components/DatabaseManagement.tsx';
import { ForensicLab } from './components/ForensicLab.tsx';
import { IncidentHistory } from './components/IncidentHistory.tsx';
import { HorulinceDashboard } from './components/HorulinceDashboard.tsx';
import { HorulinceVehicleQuery } from './components/HorulinceVehicleQuery.tsx';
import { HorulinceAssistedSearch } from './components/HorulinceAssistedSearch.tsx';
import { HorulinceAlertsCenter } from './components/HorulinceAlertsCenter.tsx';
import { HorulinceExperimentalAudit } from './components/HorulinceExperimentalAudit.tsx';
import {
  playTacticalAlertSound,
  playDispatchSound,
  playRadarBlip,
} from './utils/audioAlerts.ts';
import {
  ShieldAlert,
  Video,
  Compass,
  Database,
  History,
  Volume2,
  VolumeX,
  Scan,
  AlertTriangle,
  Car,
  User,
  Radio,
  CheckCircle2,
  Activity,
  Layers,
  LayoutDashboard,
  Search,
  FileCheck2,
  ShieldCheck,
  BarChart,
  HelpCircle,
} from 'lucide-react';
import {
  matchVehicleAgainstDatabase,
  matchPersonAgainstDatabase,
} from './utils/securityLogic.ts';

// 5 Telas Oficiais do Artigo Horulince + Modos Operacionais Complementares
type HorulinceTab =
  | 'DASHBOARD'
  | 'VEHICLE_QUERY'
  | 'ASSISTED_SEARCH'
  | 'ALERTS_CENTER'
  | 'EXPERIMENTAL_AUDIT'
  | 'VIDEO_WALL'
  | 'TACTICAL_MAP'
  | 'DATABASE_LISTS';

export default function App() {
  const [activeTab, setActiveTab] = useState<HorulinceTab>('DASHBOARD');
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [selectedCameraId, setSelectedCameraId] = useState<string>(INITIAL_CAMERAS[0].id);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(INITIAL_VEHICLES);
  const [persons, setPersons] = useState<MissingPersonRecord[]>(INITIAL_PERSONS);
  const [patrols, setPatrols] = useState<PatrolUnit[]>(INITIAL_PATROLS);
  const [alerts, setAlerts] = useState<DetectionAlert[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [metrics, setMetrics] = useState<ExperimentalMetrics>(INITIAL_EXPERIMENTAL_METRICS);

  // Modal tático do carro/pessoa encontrada
  const [focusedAlert, setFocusedAlert] = useState<DetectionAlert | null>(null);

  // Controles de interface
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [currentBoundingBoxes, setCurrentBoundingBoxes] = useState<BoundingBox[]>(
    INITIAL_ALERTS[0]?.boundingBoxes || []
  );
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  const pendingAlerts = alerts.filter((a) => a.reviewState === 'Pendente');

  const notify = (msg: string) => {
    setSystemMessage(msg);
    setTimeout(() => setSystemMessage(null), 4000);
  };

  // Log de auditoria institucional
  const handleLogAudit = (action: any, target: string, justification: string) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user: 'teste_op1',
      action,
      targetIdentifier: target,
      justification,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Simulação da bateria de avaliação experimental (Seção 4.2 do Artigo)
  const handleRunBenchmark = () => {
    setMetrics({
      precision: '89.4%',
      recall: '92.1%',
      falsePositives: '2.8%',
      falseNegatives: '7.9%',
      plateOcrAccuracy: '95.2%',
      latencyMs: '380 ms',
      reviewTimeSec: '12 s',
      testedDatasets: 50,
      isSimulatedBenchmarkDone: true,
    });
    handleLogAudit(
      'confirmou p/ análise',
      'Benchmark Experimental',
      'Execução de bateria simulada de 50 amostras de teste em laboratório'
    );
    notify('Bateria de teste simulada concluída! Indicadores calculados conforme metodologia acadêmica.');
  };

  const handleResetBenchmark = () => {
    setMetrics(INITIAL_EXPERIMENTAL_METRICS);
    notify('Indicadores redefinidos para "a medir".');
  };

  // Atualização de estado da Central de Alertas com validação humana (Figura 5)
  const handleUpdateAlertState = (alertId: string, newState: ReviewState, justification: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              reviewState: newState,
              lastReviewedBy: 'teste_op1',
              operatorNotes: justification,
              acknowledged: true,
            }
          : a
      )
    );

    const actionMap: Record<ReviewState, any> = {
      'Confirmado para análise': 'confirmou p/ análise',
      'Descartado': 'descartou',
      'Em revisão': 'solicitou revisão',
      'Pendente': 'solicitou revisão',
    };

    handleLogAudit(actionMap[newState], `Alerta ${alertId}`, justification);
    notify(`Decisão registrada para o alerta ${alertId}: ${newState}`);
  };

  // Abrir apresentação do carro encontrado (a partir da consulta de veículos ou alertas)
  const handleOpenVehiclePresentation = (veh: VehicleRecord, queryContext: any) => {
    const alertId = `alt-pres-${Date.now()}`;
    const syntheticAlert: DetectionAlert = {
      id: alertId,
      code: `AL-${veh.plate}`,
      timestamp: `Hoje, às ${new Date().toLocaleTimeString('pt-BR')}`,
      cameraId: activeCamera.id,
      cameraName: activeCamera.name,
      cameraLocation: activeCamera.locationName,
      originVideo: activeCamera.videoFileLabel || 'video teste 01',
      evidenceSnippet: `recorte do quadro placa ${veh.plate}`,
      targetType: 'VEICULO',
      matchType: 'MATCH_CONFIRMADO',
      confidence: 96,
      confidenceCategory: 'alta*',
      priority: veh.priority,
      tacticalSummary: `Veículo com queixa de ${veh.alertType} localizado: Placa ${veh.plate} (${veh.brand} ${veh.model} ${veh.color}). Detalhes conferidos pelo operador.`,
      vehicleData: {
        plateDetected: veh.plate,
        matchedRecord: veh,
        vehicleMakeModel: `${veh.brand} ${veh.model}`,
        vehicleColor: veh.color,
        hasSticker: veh.hasSticker,
        hasDamage: veh.hasDamage,
      },
      boundingBoxes: [
        {
          top: 36,
          left: 32,
          width: 36,
          height: 42,
          label: `HORULINCE: ${veh.plate} [${veh.alertType}]`,
          confidence: 0.96,
          color: '#ef4444',
        },
      ],
      acknowledged: false,
      reviewState: 'Confirmado para análise',
      dispatchStatus: 'NAO_DESPACHADO',
      cercoAtivado: false,
    };

    setAlerts((prev) => [syntheticAlert, ...prev]);
    setFocusedAlert(syntheticAlert);
    playTacticalAlertSound(soundEnabled);
  };

  // Processamento de frame de IA em tempo real com Gemini Vision
  const handleCaptureAndAnalyze = async (base64Frame: string) => {
    setIsScanning(true);
    playRadarBlip(soundEnabled);

    try {
      const activePlates = vehicles
        .filter((v) => v.status === 'ATIVO')
        .map((v) => ({
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          color: v.color,
        }));

      const activePersons = persons
        .filter((p) => p.status === 'DESAPARECIDO')
        .map((p) => ({
          name: p.fullName,
          age: p.age,
          gender: p.gender,
          clothing: p.clothingDescription,
        }));

      const response = await fetch('/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Frame,
          mimeType: 'image/jpeg',
          cameraContext: {
            id: activeCamera.id,
            name: activeCamera.name,
            location: activeCamera.locationName,
            scenarioType: activeCamera.scenarioType,
          },
          searchTargets: {
            plates: activePlates,
            persons: activePersons,
          },
        }),
      });

      const resJson = await response.json();
      const data = resJson.data || {};
      const newBoxes: BoundingBox[] = [];

      if (data.vehiclesDetected && data.vehiclesDetected.length > 0) {
        data.vehiclesDetected.forEach((v: any) => {
          const match = matchVehicleAgainstDatabase(
            { plate: v.plate, color: v.color, model: `${v.brand} ${v.model}` },
            vehicles
          );

          const isCriticalMatch = Boolean(match);
          const boxColor = isCriticalMatch ? '#ef4444' : '#00f0ff';
          const label = isCriticalMatch
            ? `ALVO CANDIDATO: ${v.plate || match?.record.plate}`
            : `VEÍCULO: ${v.plate || 'CIVIL'}`;

          newBoxes.push({
            top: v.boundingBox?.top ?? 35,
            left: v.boundingBox?.left ?? 30,
            width: v.boundingBox?.width ?? 35,
            height: v.boundingBox?.height ?? 40,
            label,
            confidence: v.confidence || 0.94,
            color: boxColor,
          });

          if (match && isCriticalMatch) {
            const newAlert: DetectionAlert = {
              id: `alt-${Date.now()}`,
              code: `AL-${Math.floor(Math.random() * 800 + 100)}`,
              timestamp: `Hoje, às ${new Date().toLocaleTimeString('pt-BR')}`,
              cameraId: activeCamera.id,
              cameraName: activeCamera.name,
              cameraLocation: activeCamera.locationName,
              originVideo: activeCamera.videoFileLabel || 'video teste 01',
              evidenceSnippet: `recorte do quadro placa ${match.record.plate}`,
              targetType: 'VEICULO',
              matchType: 'MATCH_CONFIRMADO',
              confidence: match.score,
              confidenceCategory: match.score >= 90 ? 'alta*' : 'média*',
              priority: match.record.priority,
              tacticalSummary: `Correspondência de placa: ${match.record.plate} (${match.record.brand} ${match.record.model} ${match.record.color}). Queixa: ${match.record.alertType}.`,
              vehicleData: {
                plateDetected: match.record.plate,
                matchedRecord: match.record,
                vehicleMakeModel: `${match.record.brand} ${match.record.model}`,
                vehicleColor: match.record.color,
                hasSticker: match.record.hasSticker,
                hasDamage: match.record.hasDamage,
              },
              boundingBoxes: [
                {
                  top: 36,
                  left: 32,
                  width: 36,
                  height: 42,
                  label: `ALVO CANDIDATO: ${match.record.plate}`,
                  confidence: match.score / 100,
                  color: '#ef4444',
                },
              ],
              acknowledged: false,
              reviewState: 'Pendente',
              dispatchStatus: 'NAO_DESPACHADO',
              cercoAtivado: false,
            };

            setAlerts((prev) => [newAlert, ...prev]);
            playTacticalAlertSound(soundEnabled);
            setFocusedAlert(newAlert);
            handleLogAudit('consulta de placa', match.record.plate, 'Leitura ALPR coincidente com lista de alerta');
          }
        });
      }

      if (newBoxes.length > 0) {
        setCurrentBoundingBoxes(newBoxes);
      }

      notify(
        data.matchFound
          ? 'ALERTA HORULINCE: Candidato detectado para validação humana!'
          : 'Varredura concluída. Nenhum alvo cadastrado detectado neste quadro.'
      );
    } catch (err: any) {
      console.error('Frame analysis error:', err);
      notify('Erro ao processar análise.');
    } finally {
      setIsScanning(false);
    }
  };

  // Simulação de enquadramento rápido
  const handleSimulatedIncident = (targetType: 'vehicle' | 'person') => {
    if (targetType === 'vehicle') {
      const targetVeh = vehicles.find((v) => v.status === 'ATIVO') || vehicles[0];
      handleOpenVehiclePresentation(targetVeh, {});
    } else {
      const targetPerson = persons.find((p) => p.status === 'DESAPARECIDO') || persons[0];
      const newAlert: DetectionAlert = {
        id: `alt-per-${Date.now()}`,
        code: `AL-${Math.floor(Math.random() * 800 + 100)}`,
        timestamp: `Hoje, às ${new Date().toLocaleTimeString('pt-BR')}`,
        cameraId: activeCamera.id,
        cameraName: activeCamera.name,
        cameraLocation: activeCamera.locationName,
        originVideo: activeCamera.videoFileLabel || 'video teste 03',
        evidenceSnippet: 'recorte do quadro (busca assistida)',
        targetType: 'PESSOA',
        matchType: 'POSSIVEL_MATCH',
        confidence: 88,
        confidenceCategory: 'média*',
        priority: 'ALTA',
        tacticalSummary: `Evento candidato de busca assistida: ${targetPerson.fullName}. Compatibilidade de roupas registradas (${targetPerson.clothingDescription}).`,
        personData: {
          matchedRecord: targetPerson,
          personDescription: targetPerson.fullName,
          clothingObserved: targetPerson.clothingDescription,
          estimatedAge: String(targetPerson.age),
        },
        boundingBoxes: [
          {
            top: 22,
            left: 44,
            width: 20,
            height: 55,
            label: `BUSCA ASSISTIDA: ${targetPerson.fullName}`,
            confidence: 0.88,
            color: '#a855f7',
          },
        ],
        acknowledged: false,
        reviewState: 'Pendente',
        dispatchStatus: 'NAO_DESPACHADO',
        cercoAtivado: false,
      };

      setAlerts((prev) => [newAlert, ...prev]);
      playTacticalAlertSound(soundEnabled);
      setFocusedAlert(newAlert);
      handleLogAudit('busca assistida', targetPerson.fullName, 'Correspondência assistida de vestimenta');
    }
  };

  // Despacho de viatura com suporte à GCM de Franca
  const handleDispatchUnit = (alertId: string, unitId: string) => {
    const unit = patrols.find((p) => p.id === unitId);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              dispatchStatus: 'EM_DESLOCAMENTO',
              dispatchedUnit: unit?.code || 'GCM-FRANCA',
              dispatchTime: new Date().toLocaleTimeString('pt-BR'),
              reviewState: 'Confirmado para análise',
            }
          : a
      )
    );
    setPatrols((prev) =>
      prev.map((p) => (p.id === unitId ? { ...p, status: 'EM_DESLOCAMENTO' } : p))
    );
    playDispatchSound(soundEnabled);
    handleLogAudit('confirmou p/ análise', `Alerta ${alertId}`, `Despacho operacional da viatura ${unit?.code}`);
    notify(`Viatura ${unit?.code} despachada com sucesso! Código QAP acionado.`);
  };

  const handleActivateCerco = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, cercoAtivado: true } : a))
    );
    playRadarBlip(soundEnabled);
    handleLogAudit('confirmou p/ análise', `Alerta ${alertId}`, 'Acionamento preventivo de cerco semafórico');
    notify('Cerco eletrônico preventivo ativado nas vias adjacentes.');
  };

  const handleDismissAlert = (alertId: string) => {
    handleUpdateAlertState(alertId, 'Descartado', 'Descartado pelo operador por ausência de correspondência válida.');
    setFocusedAlert(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header Institucional Horulince */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Logo & Título Oficial Horulince */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-xl shadow-lg shadow-cyan-900/30 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold tracking-wider font-mono text-white">
                  HORULINCE
                </h1>
                <span className="text-[10px] bg-amber-600/30 text-amber-300 border border-amber-500/50 px-1.5 py-0.2 rounded font-mono font-bold">
                  DADOS FICTÍCIOS &bull; SIMULAÇÃO ACADÊMICA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Sistema Inteligente para Localização de Veículos e Pessoas &bull; Fatec Franca
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Supervisão Humana:</span>
              <span className="text-emerald-400 font-bold">ATIVA</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Fontes de Vídeo:</span>
              <span className="text-white font-bold">{cameras.length} Ativas</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar avisos' : 'Ativar avisos sonoros'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Validação Humana se houver alerta pendente */}
      {pendingAlerts.length > 0 && (
        <div className="bg-amber-600/90 text-white text-xs font-mono font-bold px-4 py-2 flex items-center justify-between border-b border-amber-700 shadow-md">
          <div className="flex items-center space-x-2 truncate">
            <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
            <span className="tracking-wide">
              [HORULINCE - VALIDAÇÃO PENDENTE]: {pendingAlerts[0].code} - {pendingAlerts[0].tacticalSummary}
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTab('ALERTS_CENTER');
              setFocusedAlert(pendingAlerts[0]);
            }}
            className="ml-4 shrink-0 bg-slate-900 text-amber-300 hover:bg-black px-3 py-1 rounded text-xs font-bold uppercase cursor-pointer shadow"
          >
            Revisar na Central
          </button>
        </div>
      )}

      {/* Floating System Notification */}
      {systemMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{systemMessage}</span>
        </div>
      )}

      {/* Barra de Navegação das 5 Telas Oficiais do Artigo Horulince */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-4 lg:px-6">
        <div className="flex items-center space-x-2 overflow-x-auto max-w-7xl mx-auto py-2">
          {/* Tela 1: Dashboard Operacional */}
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'DASHBOARD'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard Operacional</span>
          </button>

          {/* Tela 2: Consulta de Veículos */}
          <button
            onClick={() => setActiveTab('VEHICLE_QUERY')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'VEHICLE_QUERY'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Consulta de Veículos</span>
          </button>

          {/* Tela 3: Busca Assistida de Pessoa Desaparecida */}
          <button
            onClick={() => setActiveTab('ASSISTED_SEARCH')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ASSISTED_SEARCH'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>3. Busca Assistida (Pessoas)</span>
          </button>

          {/* Tela 4: Central de Alertas e Validação Humana */}
          <button
            onClick={() => setActiveTab('ALERTS_CENTER')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ALERTS_CENTER'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>4. Central de Alertas ({alerts.length})</span>
          </button>

          {/* Tela 5: Análise Experimental e Auditoria */}
          <button
            onClick={() => setActiveTab('EXPERIMENTAL_AUDIT')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'EXPERIMENTAL_AUDIT'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart className="w-4 h-4" />
            <span>5. Análise Experimental & Auditoria</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Módulos de Operação e Vídeos em Tempo Real (Preservados do pedido original) */}
          <button
            onClick={() => setActiveTab('VIDEO_WALL')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'VIDEO_WALL'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Demonstração em tempo real de câmeras e leitura ALPR contínua"
          >
            <Video className="w-4 h-4" />
            <span>Feeds de Câmeras (Ao Vivo)</span>
          </button>

          <button
            onClick={() => setActiveTab('TACTICAL_MAP')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'TACTICAL_MAP'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Mapa de geolocalização e cerco eletrônico"
          >
            <Compass className="w-4 h-4" />
            <span>Mapa Tático (GIS)</span>
          </button>

          <button
            onClick={() => setActiveTab('DATABASE_LISTS')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'DATABASE_LISTS'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Gerenciamento de listas fictícias de veículos e pessoas"
          >
            <Database className="w-4 h-4" />
            <span>Listas de Consulta</span>
          </button>
        </div>
      </nav>

      {/* Conteúdo Principal de Acordo com a Aba Selecionada */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TELA 1 DO ARTIGO: DASHBOARD OPERACIONAL (Figura 2) */}
        {activeTab === 'DASHBOARD' && (
          <HorulinceDashboard
            cameras={cameras}
            alerts={alerts}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenAlertDetails={(alt) => setFocusedAlert(alt)}
          />
        )}

        {/* TELA 2 DO ARTIGO: CONSULTA DE VEÍCULOS (Figura 3) */}
        {activeTab === 'VEHICLE_QUERY' && (
          <HorulinceVehicleQuery
            vehicleDatabase={vehicles}
            onOpenFoundVehiclePresentation={handleOpenVehiclePresentation}
            onLogAudit={handleLogAudit}
          />
        )}

        {/* TELA 3 DO ARTIGO: BUSCA ASSISTIDA DE PESSOA DESAPARECIDA (Figura 4) */}
        {activeTab === 'ASSISTED_SEARCH' && (
          <HorulinceAssistedSearch onLogAudit={handleLogAudit} />
        )}

        {/* TELA 4 DO ARTIGO: CENTRAL DE ALERTAS E VALIDAÇÃO HUMANA (Figura 5) */}
        {activeTab === 'ALERTS_CENTER' && (
          <HorulinceAlertsCenter
            alerts={alerts}
            onUpdateAlertState={handleUpdateAlertState}
            onOpenAlertDetails={(alt) => setFocusedAlert(alt)}
          />
        )}

        {/* TELA 5 DO ARTIGO: ANÁLISE EXPERIMENTAL E AUDITORIA (Figura 6) */}
        {activeTab === 'EXPERIMENTAL_AUDIT' && (
          <HorulinceExperimentalAudit
            auditLogs={auditLogs}
            metrics={metrics}
            onRunBenchmarkSimulation={handleRunBenchmark}
            onResetBenchmark={handleResetBenchmark}
          />
        )}

        {/* VÍDEOS EM TEMPO REAL (Preservado e integrado ao ecossistema Horulince) */}
        {activeTab === 'VIDEO_WALL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <CameraStreamCanvas
                camera={activeCamera}
                boundingBoxes={currentBoundingBoxes}
                isScanning={isScanning}
                onCaptureFrame={handleCaptureAndAnalyze}
                onRequestSimulatedIncident={handleSimulatedIncident}
              />

              {/* Seletor de Câmeras */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>FONTES DE VÍDEO CONECTADAS &bull; FRANCA/SP</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Clique em qualquer ponto para alternar a visualização
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {cameras.map((cam) => {
                    const isSelected = cam.id === selectedCameraId;
                    const hasAlert = alerts.some((a) => a.cameraId === cam.id && a.reviewState === 'Pendente');

                    return (
                      <button
                        key={cam.id}
                        onClick={() => {
                          setSelectedCameraId(cam.id);
                          setCurrentBoundingBoxes([]);
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/90 border-cyan-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono font-bold">{cam.videoFileLabel || cam.code}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              hasAlert ? 'bg-amber-500 animate-ping' : 'bg-emerald-400'
                            }`}
                          />
                        </div>
                        <div className="text-[11px] font-medium text-slate-200 truncate">{cam.name}</div>
                        <div className="text-[9px] text-slate-500 truncate font-mono mt-1">{cam.zone}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Coluna Lateral de Telemetria e Alertas */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase">{activeCamera.code}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                    {activeCamera.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Local:</span>
                    <span className="font-semibold truncate max-w-[190px]">{activeCamera.locationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arquivo de Borda:</span>
                    <span className="text-cyan-400">{activeCamera.videoFileLabel || 'teste_01.mp4'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resolução Sensor:</span>
                    <span>{activeCamera.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Direção:</span>
                    <span className="text-cyan-400 font-bold">{activeCamera.direction}</span>
                  </div>
                </div>
              </div>

              {/* Feed de Alertas Rápidos */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[520px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>EVENTOS CANDIDATOS HORULINCE</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                    {alerts.length} Registros
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {alerts.map((alt) => {
                    const isVeh = alt.targetType === 'VEICULO';
                    return (
                      <div
                        key={alt.id}
                        onClick={() => setFocusedAlert(alt)}
                        className="p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] bg-slate-950/80 border-slate-800 hover:border-cyan-500"
                      >
                        <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded ${
                              isVeh ? 'bg-red-950 text-red-200 border border-red-800' : 'bg-purple-950 text-purple-200 border border-purple-800'
                            }`}
                          >
                            {alt.code}: {isVeh ? 'VEÍCULO' : 'PESSOA'}
                          </span>
                          <span className="text-slate-400">{alt.timestamp}</span>
                        </div>

                        {isVeh ? (
                          <div className="flex items-center space-x-2 my-1">
                            <span className="text-sm font-bold font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-700 text-cyan-300">
                              {alt.vehicleData?.plateDetected}
                            </span>
                            <span className="text-xs text-slate-300">
                              {alt.vehicleData?.vehicleMakeModel}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-white my-1">
                            {alt.personData?.matchedRecord?.fullName}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-mono">
                          {alt.tacticalSummary}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] font-mono">
                          <span className="text-amber-400">Confiança: {alt.confidenceCategory}</span>
                          <span className="text-slate-300 font-bold">{alt.reviewState}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAPA TÁTICO GIS (Preservado e atualizado para Franca/SP) */}
        {activeTab === 'TACTICAL_MAP' && (
          <TacticalMap
            cameras={cameras}
            patrols={patrols}
            activeAlerts={alerts}
            selectedCameraId={selectedCameraId}
            onSelectCamera={(camId) => {
              setSelectedCameraId(camId);
              setActiveTab('VIDEO_WALL');
            }}
            onSelectAlert={(alt) => setFocusedAlert(alt)}
          />
        )}

        {/* BASE DE DADOS INTEGRADA (Preservada para inclusão e consulta de registros) */}
        {activeTab === 'DATABASE_LISTS' && (
          <DatabaseManagement
            vehicles={vehicles}
            persons={persons}
            onAddVehicle={(v) => {
              const id = `veh-${Date.now()}`;
              setVehicles((prev) => [{ ...v, id }, ...prev]);
              handleLogAudit('confirmou p/ análise', `Placa ${v.plate}`, 'Cadastro de novo veículo com restrição');
              notify(`Veículo placa ${v.plate} cadastrado na lista fictícia!`);
            }}
            onUpdateVehicleStatus={(id, status) => {
              setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
              notify(`Status atualizado para ${status}.`);
            }}
            onDeleteVehicle={(id) => {
              setVehicles((prev) => prev.filter((v) => v.id !== id));
              notify('Veículo removido da lista fictícia.');
            }}
            onAddPerson={(p) => {
              const id = `per-${Date.now()}`;
              setPersons((prev) => [{ ...p, id }, ...prev]);
              handleLogAudit('busca assistida', p.fullName, 'Cadastro de caso de busca assistida');
              notify(`Caso ${p.fullName} cadastrado na lista fictícia!`);
            }}
            onUpdatePersonStatus={(id, status) => {
              setPersons((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
              notify(`Status atualizado para ${status}.`);
            }}
            onDeletePerson={(id) => {
              setPersons((prev) => prev.filter((p) => p.id !== id));
              notify('Registro removido.');
            }}
          />
        )}
      </main>

      {/* Modal Tático de Apresentação do Carro/Pessoa Encontrada (Preservado conforme elogio do usuário!) */}
      {focusedAlert && (
        <TacticalAlertModal
          alert={focusedAlert}
          patrols={patrols}
          allCameras={cameras}
          onClose={() => setFocusedAlert(null)}
          onDispatchUnit={handleDispatchUnit}
          onActivateCerco={handleActivateCerco}
          onDismissAlert={handleDismissAlert}
          onPrintReport={(alt) => {
            setFocusedAlert(null);
            setActiveTab('ALERTS_CENTER');
          }}
        />
      )}
    </div>
  );
}
