/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AlertType = 'ROUBO' | 'FURTO' | 'MANDADO' | 'SUSPEITO' | 'DESAPARECIDO' | 'ALERTA_AMBAR';

export type PriorityLevel = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface VehicleRecord {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  year: number;
  alertType: 'ROUBO' | 'FURTO' | 'MANDADO' | 'SUSPEITO';
  incidentDate: string;
  incidentLocation: string;
  policeReportNumber: string; // BO fictício
  victimOrOwner: string;
  priority: PriorityLevel;
  notes: string;
  status: 'ATIVO' | 'RECUPERADO' | 'CANCELADO';
  hasSticker?: boolean;
  stickerDetails?: string;
  hasDamage?: boolean;
  damageDetails?: string;
  photoUrl?: string;
}

export interface MissingPersonRecord {
  id: string;
  fullName: string;
  nickname?: string;
  age: number;
  gender: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  lastSeenDate: string;
  lastSeenLocation: string;
  photoUrl: string;
  physicalFeatures: {
    height: string;
    hairColor: string;
    eyeColor: string;
    skinTone: string;
    distinguishingMarks: string; // tatuagens, cicatrizes, óculos
  };
  clothingDescription: string;
  alertLevel: 'ALERTA_AMBAR' | 'VULNERAVEL' | 'DESAPARECIDO';
  emergencyContact: string;
  policeReportNumber: string;
  notes: string;
  status: 'DESAPARECIDO' | 'LOCALIZADO' | 'EM_ANALISE';
}

export interface CameraFeed {
  id: string;
  code: string;
  name: string;
  locationName: string;
  neighborhood: string;
  coords: { x: number; y: number; lat: number; lng: number };
  status: 'ONLINE' | 'OFFLINE' | 'ANALISANDO' | 'ALERTA';
  resolution: string;
  fps: number;
  direction: 'NORTE' | 'SUL' | 'LESTE' | 'OESTE';
  zone: string;
  streamType: 'simulated' | 'webcam' | 'upload';
  scenarioType: 'avenida_veiculos' | 'rodovia_alpr' | 'calcadao_pedestres' | 'terminal_urbano';
  videoFileLabel?: string; // ex: teste_01.mp4
}

export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color: string;
}

export type ReviewState = 'Pendente' | 'Em revisão' | 'Confirmado para análise' | 'Descartado';

export interface DetectionAlert {
  id: string;
  code: string; // ex: AL-014
  timestamp: string;
  cameraId: string;
  cameraName: string;
  cameraLocation: string;
  originVideo: string; // ex: video teste 01
  evidenceSnippet?: string; // ex: recorte do quadro
  targetType: 'VEICULO' | 'PESSOA';
  matchType: 'MATCH_CONFIRMADO' | 'ALTA_PROBABILIDADE' | 'POSSIVEL_MATCH';
  confidence: number; // 0 to 100
  confidenceCategory: 'baixa*' | 'média*' | 'alta*';
  priority: PriorityLevel;
  tacticalSummary: string;
  
  // Specific vehicle data
  vehicleData?: {
    plateDetected: string;
    matchedRecord?: VehicleRecord;
    vehicleMakeModel: string;
    vehicleColor: string;
    hasSticker?: boolean;
    hasDamage?: boolean;
    divergenceNote?: string;
  };

  // Specific person data
  personData?: {
    matchedRecord?: MissingPersonRecord;
    personDescription: string;
    clothingObserved: string;
    estimatedAge: string;
  };

  snapshotUrl?: string;
  boundingBoxes: BoundingBox[];
  acknowledged: boolean;
  reviewState: ReviewState;
  dispatchStatus: 'NAO_DESPACHADO' | 'EM_DESLOCAMENTO' | 'NO_LOCAL' | 'CONCLUIDO' | 'FALSO_POSITIVO';
  dispatchedUnit?: string;
  dispatchTime?: string;
  cercoAtivado?: boolean;
  operatorNotes?: string;
  lastReviewedBy?: string;
}

export interface PatrolUnit {
  id: string;
  code: string;
  agency: 'GCM' | 'PMESP' | 'POLICIA_CIVIL' | 'PRF';
  officerInCharge: string;
  status: 'PATRULHANDO' | 'EM_DESLOCAMENTO' | 'NO_LOCAL' | 'EM_CERCO' | 'INDISPONIVEL';
  locationName: string;
  distanceKm: number;
  etaMinutes: number;
  coords: { x: number; y: number };
}

// Modelagem para a Busca Assistida do Horulince (Seção 3.4.3 do Artigo)
export interface CandidateSearchEvent {
  id: string; // ex: EV-101
  originVideo: string; // ex: video de teste 02
  timestamp: string; // ex: 15h20 (simulado)
  state: 'Em revisão' | 'Pendente' | 'Descartado' | 'Confirmado';
  observedFeatures: string;
  confidenceScore: number;
  divergenceDetails?: string;
}

export interface AssistedSearchCase {
  caseId: string; // FICT-001
  title: string;
  approximateAge: number;
  lastSeenTime: string; // 01/01/2026, 15h (fictício)
  locationReference: string; // região central (ilustrativa)
  clothingDescription: string; // mochila azul, camiseta branca
  photoUrl?: string;
  status: 'ATIVO' | 'CONCLUIDO';
  candidateEvents: CandidateSearchEvent[];
}

// Modelagem de Auditoria e Conformidade LGPD (Seção 3.4.5 e 3.6 do Artigo)
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  time?: string;
  user: string; // ex: teste_op1, teste_op2
  action: 'confirmou p/ análise' | 'descartou' | 'solicitou revisão' | 'consulta de placa' | 'busca assistida';
  targetIdentifier: string; // ex: AL-014, Placa TST1A23, FICT-001
  justification: string; // justificativa dada pelo operador humano
}

// Indicadores Experimentais da Tabela de Avaliação (Seção 3.4.5, Figura 6)
export interface ExperimentalMetrics {
  precision: string; // ex: "a medir" ou "88.4%"
  recall: string; // ex: "a medir" ou "91.2%"
  falsePositives: string; // ex: "a medir" ou "3.2%"
  falseNegatives: string; // ex: "a medir" ou "8.8%"
  plateOcrAccuracy: string; // ex: "a medir" ou "94.6%"
  latencyMs: string; // ex: "a medir" ou "420 ms"
  reviewTimeSec: string; // ex: "a medir" ou "14 s"
  testedDatasets: number;
  isSimulatedBenchmarkDone: boolean;
}

// Aliases para compatibilidade entre telas do Horulince
export type HorulinceAlert = DetectionAlert;
export type AlertReviewState = ReviewState;
export type MissingPersonCase = AssistedSearchCase;
export type CandidatePersonEvent = CandidateSearchEvent;
export type ValidationMetrics = ExperimentalMetrics;

export interface TestVideoSource {
  id: string;
  name: string;
  filename: string;
  resolution: string;
  duration: string;
  fps: number;
  description: string;
  sceneType: string;
  carPlateInVideo?: string;
  carColorInVideo?: string;
  carModelInVideo?: string;
  hasSticker?: boolean;
  hasDamage?: boolean;
}

