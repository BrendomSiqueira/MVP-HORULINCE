/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePlate,
  isValidPlate,
  calculatePlateMatchScore,
  matchVehicleAgainstDatabase,
  matchPersonAgainstDatabase,
  predictEscapeRoute,
  calculatePriorityLevel,
} from './securityLogic.ts';
import type { VehicleRecord, MissingPersonRecord } from '../types/surveillance.ts';

test('normalizePlate removes dashes, spaces and uppercases', () => {
  assert.equal(normalizePlate('bra-2e19'), 'BRA2E19');
  assert.equal(normalizePlate('  abc 1234  '), 'ABC1234');
  assert.equal(normalizePlate('kzz.9081'), 'KZZ9081');
});

test('isValidPlate accepts valid Mercosul and Old Standard plates', () => {
  assert.equal(isValidPlate('BRA2E19'), true);
  assert.equal(isValidPlate('bra-2e19'), true);
  assert.equal(isValidPlate('ABC1234'), true);
  assert.equal(isValidPlate('XYZ9876'), true);
  assert.equal(isValidPlate('INVALID12'), false);
  assert.equal(isValidPlate('AB12345'), false);
  assert.equal(isValidPlate(''), false);
});

test('calculatePlateMatchScore gives 100 on exact match and tolerates OCR confusions', () => {
  assert.equal(calculatePlateMatchScore('BRA2E19', 'BRA2E19'), 100);
  
  // '0' vs 'O' OCR confusion
  const scoreWithO = calculatePlateMatchScore('ABC123O', 'ABC1230');
  assert.ok(scoreWithO >= 85, `Score with O/0 confusion was ${scoreWithO}, expected >= 85`);

  // Totally different plate
  const scoreDiff = calculatePlateMatchScore('BRA2E19', 'ZZZ9999');
  assert.ok(scoreDiff < 30, `Score for different plates was ${scoreDiff}, expected < 30`);
});

test('matchVehicleAgainstDatabase finds correct wanted vehicle with high confidence', () => {
  const db: VehicleRecord[] = [
    {
      id: 'v1',
      plate: 'ABC4E29',
      brand: 'Fiat',
      model: 'Argo',
      color: 'Cinza',
      year: 2022,
      alertType: 'ROUBO',
      incidentDate: '2026-10-17',
      incidentLocation: 'Av. Paulista',
      policeReportNumber: 'BO-2026-98124',
      victimOrOwner: 'Carlos Eduardo',
      priority: 'CRITICA',
      notes: 'Veículo com queixa de roubo armada recente',
      status: 'ATIVO',
    },
    {
      id: 'v2',
      plate: 'KZZ8810',
      brand: 'Toyota',
      model: 'Corolla',
      color: 'Preto',
      year: 2023,
      alertType: 'FURTO',
      incidentDate: '2026-10-16',
      incidentLocation: 'Rua Augusta',
      policeReportNumber: 'BO-2026-91203',
      victimOrOwner: 'Mariana Lima',
      priority: 'ALTA',
      notes: 'Furtado em estacionamento',
      status: 'ATIVO',
    },
  ];

  const match = matchVehicleAgainstDatabase(
    { plate: 'ABC4E29', color: 'Cinza', model: 'Fiat Argo' },
    db
  );

  assert.ok(match !== null);
  assert.equal(match.record.id, 'v1');
  assert.equal(match.matchType, 'MATCH_CONFIRMADO');
  assert.ok(match.score >= 90);
});

test('matchPersonAgainstDatabase finds missing person based on clothing and traits', () => {
  const db: MissingPersonRecord[] = [
    {
      id: 'p1',
      fullName: 'Lucas Gabriel Mendes',
      age: 14,
      gender: 'MASCULINO',
      lastSeenDate: '2026-10-17',
      lastSeenLocation: 'Parque Ibirapuera',
      photoUrl: '',
      physicalFeatures: {
        height: '1.65m',
        hairColor: 'Castanho escuro',
        eyeColor: 'Castanho',
        skinTone: 'Branca',
        distinguishingMarks: 'Usa óculos de armação preta',
      },
      clothingDescription: 'Jaqueta azul marinho com capuz cinza e bermuda jeans escura',
      alertLevel: 'ALERTA_AMBAR',
      emergencyContact: '(11) 98888-7777',
      policeReportNumber: 'BO-DES-2026-441',
      notes: 'Menor desaparecido desde ontem à tarde',
      status: 'DESAPARECIDO',
    },
  ];

  const match = matchPersonAgainstDatabase(
    {
      gender: 'MASCULINO',
      estimatedAge: 15,
      clothingText: 'jovem vestindo jaqueta azul marinho com bermuda jeans',
    },
    db
  );

  assert.ok(match !== null);
  assert.equal(match.record.id, 'p1');
  assert.ok(match.score >= 60);
});

test('predictEscapeRoute prioritizes cameras along the direction vector', () => {
  const cameras = [
    { id: 'c1', name: 'Av Paulista 1000', direction: 'NORTE', coords: { x: 50, y: 50 } },
    { id: 'c2', name: 'Av Paulista 2000 (Norte)', direction: 'NORTE', coords: { x: 50, y: 30 } },
    { id: 'c3', name: 'Av Brasil (Sul)', direction: 'SUL', coords: { x: 50, y: 80 } },
  ];

  const downstream = predictEscapeRoute('c1', 'NORTE', cameras);
  assert.equal(downstream.length, 1);
  assert.equal(downstream[0].id, 'c2');
});

test('calculatePriorityLevel escalates Amber alerts and armed robbery to CRITICA', () => {
  assert.equal(calculatePriorityLevel('ALERTA_AMBAR', 70), 'CRITICA');
  assert.equal(calculatePriorityLevel('ROUBO', 85), 'CRITICA');
  assert.equal(calculatePriorityLevel('FURTO', 80), 'ALTA');
  assert.equal(calculatePriorityLevel('SUSPEITO', 50), 'BAIXA');
});
