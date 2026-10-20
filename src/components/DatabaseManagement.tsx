/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VehicleRecord, MissingPersonRecord } from '../types/surveillance.ts';
import {
  Car,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  Phone,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { isValidPlate, normalizePlate } from '../utils/securityLogic.ts';

interface Props {
  vehicles: VehicleRecord[];
  persons: MissingPersonRecord[];
  onAddVehicle: (newVehicle: Omit<VehicleRecord, 'id'>) => void;
  onUpdateVehicleStatus: (id: string, status: 'ATIVO' | 'RECUPERADO' | 'CANCELADO') => void;
  onDeleteVehicle: (id: string) => void;
  onAddPerson: (newPerson: Omit<MissingPersonRecord, 'id'>) => void;
  onUpdatePersonStatus: (id: string, status: 'DESAPARECIDO' | 'LOCALIZADO' | 'EM_ANALISE') => void;
  onDeletePerson: (id: string) => void;
}

export const DatabaseManagement: React.FC<Props> = ({
  vehicles,
  persons,
  onAddVehicle,
  onUpdateVehicleStatus,
  onDeleteVehicle,
  onAddPerson,
  onUpdatePersonStatus,
  onDeletePerson,
}) => {
  const [activeTab, setActiveTab] = useState<'VEHICLES' | 'PERSONS'>('VEHICLES');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    brand: '',
    model: '',
    color: '',
    year: new Date().getFullYear(),
    alertType: 'ROUBO' as const,
    incidentDate: new Date().toISOString().slice(0, 10),
    incidentLocation: '',
    policeReportNumber: '',
    victimOrOwner: '',
    priority: 'ALTA' as const,
    notes: '',
  });
  const [plateError, setPlateError] = useState<string | null>(null);

  // New person form state
  const [newPerson, setNewPerson] = useState({
    fullName: '',
    nickname: '',
    age: 18,
    gender: 'MASCULINO' as const,
    lastSeenDate: new Date().toISOString().slice(0, 10),
    lastSeenLocation: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    height: '1.70m',
    hairColor: 'Castanho escuro',
    eyeColor: 'Castanhos',
    skinTone: 'Parda',
    distinguishingMarks: '',
    clothingDescription: '',
    alertLevel: 'DESAPARECIDO' as const,
    emergencyContact: '',
    policeReportNumber: '',
    notes: '',
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPlate(newVehicle.plate)) {
      setPlateError('Placa inválida. Utilize o formato Mercosul (ex: ABC1D23) ou antigo (ex: ABC1234).');
      return;
    }
    setPlateError(null);

    onAddVehicle({
      plate: normalizePlate(newVehicle.plate),
      brand: newVehicle.brand,
      model: newVehicle.model,
      color: newVehicle.color,
      year: Number(newVehicle.year),
      alertType: newVehicle.alertType,
      incidentDate: newVehicle.incidentDate,
      incidentLocation: newVehicle.incidentLocation,
      policeReportNumber: newVehicle.policeReportNumber || `BO-SP-${Date.now().toString().slice(-5)}`,
      victimOrOwner: newVehicle.victimOrOwner || 'Proprietário não informado',
      priority: newVehicle.priority,
      notes: newVehicle.notes,
      status: 'ATIVO',
    });

    setIsAddVehicleOpen(false);
    setNewVehicle({
      plate: '',
      brand: '',
      model: '',
      color: '',
      year: new Date().getFullYear(),
      alertType: 'ROUBO',
      incidentDate: new Date().toISOString().slice(0, 10),
      incidentLocation: '',
      policeReportNumber: '',
      victimOrOwner: '',
      priority: 'ALTA',
      notes: '',
    });
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.fullName) return;

    onAddPerson({
      fullName: newPerson.fullName,
      nickname: newPerson.nickname,
      age: Number(newPerson.age),
      gender: newPerson.gender,
      lastSeenDate: newPerson.lastSeenDate,
      lastSeenLocation: newPerson.lastSeenLocation,
      photoUrl: newPerson.photoUrl,
      physicalFeatures: {
        height: newPerson.height,
        hairColor: newPerson.hairColor,
        eyeColor: newPerson.eyeColor,
        skinTone: newPerson.skinTone,
        distinguishingMarks: newPerson.distinguishingMarks,
      },
      clothingDescription: newPerson.clothingDescription,
      alertLevel: newPerson.alertLevel,
      emergencyContact: newPerson.emergencyContact,
      policeReportNumber: newPerson.policeReportNumber || `BO-DES-${Date.now().toString().slice(-4)}`,
      notes: newPerson.notes,
      status: 'DESAPARECIDO',
    });

    setIsAddPersonOpen(false);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.policeReportNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPersons = persons.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nickname && p.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.clothingDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policeReportNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide font-mono">
            BANCO DE DADOS INTEGRADO DE SEGURANÇA PÚBLICA
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastros ativos cruzados em tempo real com o motor de visão computacional ALPR e reconhecimento biométrico
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('VEHICLES');
              setSearchQuery('');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'VEHICLES'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Veículos com Queixa ({vehicles.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('PERSONS');
              setSearchQuery('');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PERSONS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Pessoas Desaparecidas ({persons.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[280px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={
                activeTab === 'VEHICLES'
                  ? 'Buscar por placa, modelo, marca ou BO...'
                  : 'Buscar por nome, roupas, características...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos os Status</option>
              {activeTab === 'VEHICLES' ? (
                <>
                  <option value="ATIVO">Ativo</option>
                  <option value="RECUPERADO">Recuperado</option>
                  <option value="CANCELADO">Cancelado</option>
                </>
              ) : (
                <>
                  <option value="DESAPARECIDO">Desaparecido</option>
                  <option value="LOCALIZADO">Localizado</option>
                  <option value="EM_ANALISE">Em Análise</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Create Button */}
        {activeTab === 'VEHICLES' ? (
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veículo com Queixa</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddPersonOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Pessoa Desaparecida</span>
          </button>
        )}
      </div>

      {/* Main Table / Grid Content */}
      {activeTab === 'VEHICLES' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Placa Oficial</th>
                <th className="p-3">Veículo / Cor</th>
                <th className="p-3">Motivo da Queixa</th>
                <th className="p-3">Boletim (BO)</th>
                <th className="p-3">Local do Fato</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    Nenhum veículo encontrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((veh) => (
                  <tr key={veh.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-sm bg-slate-950 px-2.5 py-1 rounded border border-slate-700 text-cyan-300">
                        {veh.plate}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white">
                      {veh.brand} {veh.model} ({veh.year}) &bull; <span className="text-slate-300">{veh.color}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          veh.alertType === 'ROUBO'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : veh.alertType === 'FURTO'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {veh.alertType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{veh.policeReportNumber}</td>
                    <td className="p-3 text-slate-300 truncate max-w-[180px]" title={veh.incidentLocation}>
                      {veh.incidentLocation}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          veh.priority === 'CRITICA'
                            ? 'text-red-400 bg-red-950/80'
                            : veh.priority === 'ALTA'
                            ? 'text-amber-400 bg-amber-950/80'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {veh.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          veh.status === 'ATIVO'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : veh.status === 'RECUPERADO'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {veh.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {veh.status === 'ATIVO' && (
                          <button
                            onClick={() => onUpdateVehicleStatus(veh.id, 'RECUPERADO')}
                            className="p-1 hover:text-emerald-400 text-slate-400 rounded cursor-pointer"
                            title="Marcar como Veículo Recuperado"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteVehicle(veh.id)}
                          className="p-1 hover:text-red-400 text-slate-500 rounded cursor-pointer"
                          title="Remover do banco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Missing Persons Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersons.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
              Nenhuma pessoa desaparecida encontrada com os filtros informados.
            </div>
          ) : (
            filteredPersons.map((person) => (
              <div
                key={person.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start space-x-3 mb-3">
                    <img
                      src={person.photoUrl}
                      alt={person.fullName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 shadow"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                            person.alertLevel === 'ALERTA_AMBAR'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-purple-950 text-purple-300 border border-purple-700'
                          }`}
                        >
                          {person.alertLevel.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {person.policeReportNumber}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate mt-1">
                        {person.fullName} {person.nickname ? `(${person.nickname})` : ''}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {person.age} anos &bull; {person.gender}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">ROUPAS VISTAS POR ÚLTIMO:</span>
                      <span className="text-purple-300">{person.clothingDescription}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">SINAIS PARTICULARES:</span>
                      <span>{person.physicalFeatures.distinguishingMarks || 'Nenhum informado'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px] pt-1">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{person.lastSeenLocation}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{person.emergencyContact}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      person.status === 'DESAPARECIDO'
                        ? 'bg-red-950/80 text-red-300 border border-red-800'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {person.status}
                  </span>

                  <div className="flex items-center space-x-1">
                    {person.status === 'DESAPARECIDO' && (
                      <button
                        onClick={() => onUpdatePersonStatus(person.id, 'LOCALIZADO')}
                        className="px-2 py-1 text-[11px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded cursor-pointer font-mono"
                      >
                        Marcar Localizado
                      </button>
                    )}
                    <button
                      onClick={() => onDeletePerson(person.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: New Vehicle */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2 mb-4">
              <Car className="w-5 h-5 text-cyan-400" />
              <span>CADASTRAR VEÍCULO COM QUEIXA (ROUBO / FURTO / MANDADO)</span>
            </h3>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Placa (Mercosul ou Antiga) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ABC4E29 ou ABC1234"
                    value={newVehicle.plate}
                    onChange={(e) => {
                      setNewVehicle({ ...newVehicle, plate: e.target.value });
                      setPlateError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-bold uppercase focus:border-cyan-500"
                  />
                  {plateError && <span className="text-red-400 text-[10px] mt-1 block">{plateError}</span>}
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Queixa *</label>
                  <select
                    value={newVehicle.alertType}
                    onChange={(e) => setNewVehicle({ ...newVehicle, alertType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500"
                  >
                    <option value="ROUBO">Roubo a Mão Armada</option>
                    <option value="FURTO">Furto de Veículo</option>
                    <option value="MANDADO">Mandado Judicial / Carga</option>
                    <option value="SUSPEITO">Veículo Suspeito / Alerta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fiat"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Argo"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cor Predominante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cinza"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Boletim de Ocorrência (BO)</label>
                  <input
                    type="text"
                    placeholder="Ex: BO-SP-2026/12345"
                    value={newVehicle.policeReportNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, policeReportNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Local do Incidente</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista x Augusta"
                    value={newVehicle.incidentLocation}
                    onChange={(e) => setNewVehicle({ ...newVehicle, incidentLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observações Operacionais</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes adicionais, modus operandi, indivíduos armados..."
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Person */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-purple-400" />
              <span>CADASTRAR PESSOA DESAPARECIDA (ALERTA ÂMBAR / VULNERÁVEL)</span>
            </h3>

            <form onSubmit={handleCreatePerson} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo da pessoa"
                  value={newPerson.fullName}
                  onChange={(e) => setNewPerson({ ...newPerson, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Idade *</label>
                  <input
                    type="number"
                    required
                    value={newPerson.age}
                    onChange={(e) => setNewPerson({ ...newPerson, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gênero *</label>
                  <select
                    value={newPerson.gender}
                    onChange={(e) => setNewPerson({ ...newPerson, gender: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMININO">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Alerta</label>
                  <select
                    value={newPerson.alertLevel}
                    onChange={(e) => setNewPerson({ ...newPerson, alertLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  >
                    <option value="ALERTA_AMBAR">Alerta Âmbar (Menor)</option>
                    <option value="VULNERAVEL">Vulnerável (Idoso/Doente)</option>
                    <option value="DESAPARECIDO">Desaparecido Geral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Vestimentas Observadas por Último *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Jaqueta azul marinho com capuz cinza, calça jeans e tênis preto..."
                  value={newPerson.clothingDescription}
                  onChange={(e) => setNewPerson({ ...newPerson, clothingDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Sinais Particulares / Tatuagens</label>
                  <input
                    type="text"
                    placeholder="Ex: Óculos de grau, cicatriz no queixo"
                    value={newPerson.distinguishingMarks}
                    onChange={(e) => setNewPerson({ ...newPerson, distinguishingMarks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Contato de Emergência *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321 (Mãe)"
                    value={newPerson.emergencyContact}
                    onChange={(e) => setNewPerson({ ...newPerson, emergencyContact: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">URL da Foto de Referência</label>
                <input
                  type="url"
                  value={newPerson.photoUrl}
                  onChange={(e) => setNewPerson({ ...newPerson, photoUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPersonOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
