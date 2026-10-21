/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, GraduationCap, Shield, Users, Layers, Award } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AboutProjectModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col space-y-5 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/95 p-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center border border-cyan-400/50 shrink-0">
              <img src="/assets/aistudio/Gemini_Generated_Image_c7beozc7beozc7be_89a95088.jpg" alt="Horulince Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded uppercase">
                PROJETO ACADÊMICO &bull; FATEC FRANCA
              </span>
              <h2 className="text-lg font-bold text-white font-mono tracking-wide mt-1">
                HORULINCE: SISTEMA INTELIGENTE
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Para Localização de Veículos Roubados ou Furtados e Pessoas Desaparecidas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autores */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300 uppercase">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Autores do Projeto (Fatec Franca - "Dr. Thomaz Novelino")</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div>&bull; <strong>Brendom Vinicius Ortiz Siqueira</strong> (brendom.siqueira@aluno.cps.gov.br)</div>
            <div>&bull; <strong>Rafael Martins de Souza</strong> (rafael.souza9@aluno.cps.sp.gov.br)</div>
            <div>&bull; <strong>Gianlucca Soncini de Lima e Silva</strong> (gianlucca.silva@aluno.cps.sp.gov.br)</div>
            <div>&bull; <strong>Pedro Henrique Da Cunha Corsi</strong> (pedro.corsi@fatec.sp.gov.br)</div>
            <div className="sm:col-span-2">&bull; <strong>Samuel Paris Fernandes Bueno</strong> (samuel.bueno@aluno.cps.sp.gov.br)</div>
          </div>
        </div>

        {/* Resumo & Objetivo */}
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <h4 className="font-bold font-mono text-white text-sm uppercase flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Resumo Executivo do Artigo</span>
          </h4>
          <p>
            O objetivo geral deste trabalho é apresentar o <strong>Horulince</strong>, sistema inteligente para auxiliar na identificação e na localização de veículos roubados ou furtados e de pessoas desaparecidas, com <strong>supervisão humana</strong> e <strong>proteção de dados pessoais</strong>.
          </p>
          <p>
            A justificativa está na necessidade de ampliar a capacidade de análise sem aumentar proporcionalmente o número de operadores e de reduzir o intervalo entre a ocorrência e a ação das autoridades.
          </p>
        </div>

        {/* 4 Camadas de Arquitetura */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="font-bold text-white uppercase text-xs flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Arquitetura Proposta em 4 Camadas (Figura 1)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-[11px]">
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <strong className="text-cyan-300">1. Entrada:</strong> Vídeos de teste (e câmeras autorizadas em etapa futura).
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <strong className="text-cyan-300">2. Borda (Edge):</strong> Detecção de veículos (YOLO), leitura de placas e geração de eventos candidatos.
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <strong className="text-cyan-300">3. Servidor Central:</strong> Comparação com listas de alerta, banco de dados e trilha de auditoria.
            </div>
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <strong className="text-cyan-300">4. Central de Alertas:</strong> Painel e dashboard com validação humana obrigatória.
            </div>
          </div>
        </div>

        {/* Diálogo Institucional com a GCM de Franca */}
        <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-800/60 space-y-1.5 text-xs font-mono text-amber-200">
          <div className="font-bold text-amber-400 text-xs uppercase flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Perspectiva de Cooperação Institucional (Seção 3.7)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-300/90">
            Proposta de diálogo com a <strong>Guarda Civil Municipal (GCM)</strong> e a <strong>Secretaria Municipal de Segurança de Franca/SP</strong> para validação técnica em contexto real, observando os requisitos éticos, operacionais e a Lei nº 13.709/2018 (LGPD).
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded-xl cursor-pointer transition-colors shadow"
          >
            Entendido / Voltar ao Horulince
          </button>
        </div>
      </div>
    </div>
  );
};
