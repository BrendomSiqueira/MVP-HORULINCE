/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VehicleRecord, MissingPersonRecord, PriorityLevel } from '../types/surveillance.ts';

// Common OCR substitution characters in ALPR
const OCR_SUBSTITUTIONS: Record<string, string[]> = {
  '0': ['O', 'Q', 'D'],
  'O': ['0', 'Q', 'D'],
  '1': ['I', 'L', 'J', 'T'],
  'I': ['1', 'L', 'J', 'T'],
  '2': ['Z'],
  'Z': ['2'],
  '5': ['S'],
  'S': ['5'],
  '8': ['B'],
  'B': ['8'],
  'G': ['6', 'C'],
  '6': ['G', 'C'],
};

/**
 * Normalizes a license plate by trimming and removing punctuation
 */
export function normalizePlate(plate: string): string {
  if (!plate) return '';
  return plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Validates Brazilian standard plates (Mercosul AAA1A23 or Old AAA1234)
 */
export function isValidPlate(plate: string): boolean {
  const clean = normalizePlate(plate);
  if (clean.length !== 7) return false;
  
  // Mercosul: 3 letters, 1 number, 1 letter, 2 numbers (e.g. BRA2E19)
  const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean);
  // Old standard: 3 letters, 4 numbers (e.g. ABC1234)
  const isOldStandard = /^[A-Z]{3}[0-9]{4}$/.test(clean);

  return isMercosul || isOldStandard;
}

/**
 * Calculates match score (0-100) between detected OCR plate and target plate,
 * accounting for common camera sensor OCR misreadings.
 */
export function calculatePlateMatchScore(detected: string, target: string): number {
  const normDet = normalizePlate(detected);
  const normTgt = normalizePlate(target);

  if (!normDet || !normTgt) return 0;
  if (normDet === normTgt) return 100;

  const maxLen = Math.max(normDet.length, normTgt.length);
  if (Math.abs(normDet.length - normTgt.length) > 2) return 0;

  let points = 0;
  const lengthToCompare = Math.min(normDet.length, normTgt.length);

  for (let i = 0; i < lengthToCompare; i++) {
    const charD = normDet[i];
    const charT = normTgt[i];

    if (charD === charT) {
      points += 1.0;
    } else {
      // Check for common OCR optical confusion
      const possibleConfusions = OCR_SUBSTITUTIONS[charT] || [];
      if (possibleConfusions.includes(charD)) {
        points += 0.8; // Partial credit for common OCR confusion
      }
    }
  }

  const score = Math.round((points / maxLen) * 100);
  return Math.min(100, Math.max(0, score));
}

/**
 * Matches a detected plate and vehicle attributes against a database of wanted vehicles
 */
export function matchVehicleAgainstDatabase(
  detected: { plate?: string; color?: string; model?: string },
  database: VehicleRecord[]
): { record: VehicleRecord; score: number; matchType: 'MATCH_CONFIRMADO' | 'ALTA_PROBABILIDADE' | 'POSSIVEL_MATCH' } | null {
  if (!detected.plate && !detected.model) return null;

  let bestMatch: { record: VehicleRecord; score: number } | null = null;

  for (const record of database) {
    if (record.status !== 'ATIVO') continue;

    let totalScore = 0;

    // 1. Plate match (weight 85%)
    if (detected.plate) {
      const plateScore = calculatePlateMatchScore(detected.plate, record.plate);
      totalScore += (plateScore * 0.85);
    }

    // 2. Color bonus (weight 10%)
    if (detected.color && record.color) {
      const detColor = detected.color.toLowerCase();
      const recColor = record.color.toLowerCase();
      if (detColor.includes(recColor) || recColor.includes(detColor)) {
        totalScore += 10;
      }
    }

    // 3. Model/brand bonus (weight 5%)
    if (detected.model && (record.model || record.brand)) {
      const detModel = detected.model.toLowerCase();
      if (detModel.includes(record.model.toLowerCase()) || detModel.includes(record.brand.toLowerCase())) {
        totalScore += 5;
      }
    }

    totalScore = Math.round(totalScore);

    if (totalScore >= 60) {
      if (!bestMatch || totalScore > bestMatch.score) {
        bestMatch = { record, score: totalScore };
      }
    }
  }

  if (!bestMatch) return null;

  let matchType: 'MATCH_CONFIRMADO' | 'ALTA_PROBABILIDADE' | 'POSSIVEL_MATCH' = 'POSSIVEL_MATCH';
  if (bestMatch.score >= 90) {
    matchType = 'MATCH_CONFIRMADO';
  } else if (bestMatch.score >= 75) {
    matchType = 'ALTA_PROBABILIDADE';
  }

  return {
    record: bestMatch.record,
    score: bestMatch.score,
    matchType,
  };
}

/**
 * Matches detected person attributes (clothing, approximate age, gender) against missing persons database
 */
export function matchPersonAgainstDatabase(
  detected: { clothingText?: string; estimatedAge?: number; gender?: string },
  database: MissingPersonRecord[]
): { record: MissingPersonRecord; score: number; matchType: 'MATCH_CONFIRMADO' | 'ALTA_PROBABILIDADE' | 'POSSIVEL_MATCH' } | null {
  let bestMatch: { record: MissingPersonRecord; score: number } | null = null;

  for (const person of database) {
    if (person.status !== 'DESAPARECIDO') continue;

    let score = 0;

    // Gender check
    if (detected.gender && person.gender) {
      if (detected.gender.toUpperCase() === person.gender.toUpperCase()) {
        score += 20;
      }
    }

    // Age proximity
    if (detected.estimatedAge && person.age) {
      const diff = Math.abs(detected.estimatedAge - person.age);
      if (diff <= 5) {
        score += 25;
      } else if (diff <= 10) {
        score += 15;
      }
    }

    // Clothing keywords overlap
    if (detected.clothingText && person.clothingDescription) {
      const detectedTokens = detected.clothingText.toLowerCase().split(/\s+/);
      const targetTokens = person.clothingDescription.toLowerCase().split(/\s+/);
      
      let matchedTokens = 0;
      for (const token of targetTokens) {
        if (token.length > 3 && detectedTokens.some(d => d.includes(token) || token.includes(d))) {
          matchedTokens++;
        }
      }

      if (matchedTokens >= 3) {
        score += 45;
      } else if (matchedTokens >= 1) {
        score += 25;
      }
    }

    if (score >= 45) {
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { record: person, score };
      }
    }
  }

  if (!bestMatch) return null;

  let matchType: 'MATCH_CONFIRMADO' | 'ALTA_PROBABILIDADE' | 'POSSIVEL_MATCH' = 'POSSIVEL_MATCH';
  if (bestMatch.score >= 80) {
    matchType = 'MATCH_CONFIRMADO';
  } else if (bestMatch.score >= 60) {
    matchType = 'ALTA_PROBABILIDADE';
  }

  return {
    record: bestMatch.record,
    score: Math.min(98, bestMatch.score),
    matchType,
  };
}

/**
 * Predicts next downstream interception cameras based on last camera location & direction of travel
 */
export function predictEscapeRoute(
  currentCameraId: string,
  direction: 'NORTE' | 'SUL' | 'LESTE' | 'OESTE',
  allCameras: { id: string; name: string; direction: string; coords: { x: number; y: number } }[]
): { id: string; name: string; distance: number }[] {
  const current = allCameras.find(c => c.id === currentCameraId);
  if (!current) return [];

  const downstream = allCameras
    .filter(c => c.id !== currentCameraId)
    .map(c => {
      const dx = c.coords.x - current.coords.x;
      const dy = c.coords.y - current.coords.y;
      const distance = Math.hypot(dx, dy);

      // Check alignment with direction
      let aligns = false;
      if (direction === 'NORTE' && dy < 0) aligns = true;
      if (direction === 'SUL' && dy > 0) aligns = true;
      if (direction === 'LESTE' && dx > 0) aligns = true;
      if (direction === 'OESTE' && dx < 0) aligns = true;

      return {
        id: c.id,
        name: c.name,
        distance: Math.round(distance),
        aligns,
      };
    })
    .filter(c => c.aligns)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return downstream.map(({ id, name, distance }) => ({ id, name, distance }));
}

/**
 * Determines alert priority based on case risk and match confidence
 */
export function calculatePriorityLevel(
  alertType: string,
  matchConfidence: number
): PriorityLevel {
  if (alertType === 'ALERTA_AMBAR' || alertType === 'MANDADO') {
    return 'CRITICA';
  }
  if (alertType === 'ROUBO' && matchConfidence >= 80) {
    return 'CRITICA';
  }
  if (alertType === 'VULNERAVEL' || alertType === 'ROUBO' || alertType === 'FURTO') {
    return 'ALTA';
  }
  if (matchConfidence >= 75) {
    return 'MEDIA';
  }
  return 'BAIXA';
}
