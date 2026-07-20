'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  FileText,
  Database,
  ShieldCheck,
  Activity,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';

// ===============================
// TIPOS DA AUDITORIA
// ===============================
interface ErroAuditoria {
  linha: number;
  coluna: string;
  mensagem: string;
  categoria: string;
}

interface AuditoriaResponse {
  success: boolean;
  totalAnalises: number;
  errosCount: number;
  erros: ErroAuditoria[];
  geminiPayload: string;
  arquivo: string;
}

export default function ApexCorporateAudit() {
  const [files, setFiles] = useState<{
    holerite: File | null;
    depara: File | null;
    relatorio: File | null;
  }>({
    holerite: null,
    depara: null,
    relatorio: null
  });

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AuditoriaResponse | null>(null);
  
  // Estado para controlar o tema: 'light' (Branco/Azul) ou 'dark' (Preto/Verde Neon)
  const [tema, setTema] = useState<'light' | 'dark'>('light');

  const handleAuditoria = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.holerite || !files.depara || !files.relatorio) {
      alert("Envie os três arquivos.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("holerite", files.holerite);
    formData.append("depara", files.depara);
    formData.append("relatorio", files.relatorio);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        body: formData
      });

      const textResponse = await response.text(); 

      if (!textResponse || textResponse.trim() === "") {
        console.warn("A API processou, mas devolveu uma resposta vazia.");
        setLoading(false);
        return;
      }

      const data = JSON.parse(textResponse);

      if (!response.ok) {
        throw new Error(data.erro || "Erro ao executar auditoria.");
      }

      setResultado(data);

      if (data && data.arquivo) { 
        const byteCharacters = atob(data.arquivo);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "holerite_auditado.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erro na comunicação com API:", error);
      alert("Erro ao processar auditoria interna.");
    } finally {
      setLoading(false);
    }
  };

  // Classes dinâmicas baseadas no tema selecionado
  const isDark = tema === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-hidden font-sans ${
      isDark ? 'bg-[#030703] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Fundo premium com glow (só aparece no modo preto/neon) */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00E676]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] bg-[#00E676]/5 rounded-full blur-[100px]" />
        </div>
      )}

      {/* HEADER */}
      <header className={`relative z-20 border-b backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-sm ${
        isDark ? 'border-white/5 bg-[#030703]/80' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tighter text-2xl uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Employer
            </span>
            <div className={`w-[1px] h-6 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
            <span className={`font-semibold tracking-[0.15em] text-xl ${isDark ? 'text-[#00E676]' : 'text-blue-600'}`}>
              AUDITH
            </span>
          </div>

          <nav className="hidden md:flex gap-6 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            <span className={`${isDark ? 'text-[#00E676] border-[#00E676]' : 'text-blue-600 border-blue-600'} border-b-2 pb-1`}>
              Auditoria Express
            </span>
            <span>Motor Groq AI Ativo</span>
          </nav>
        </div>

        {/* BOTÃO INTERRUPTOR DE TEMA (APENAS ÍCONE) */}
        <div className="flex items-center">
          <button
            onClick={() => setTema(isDark ? 'light' : 'dark')}
            title={isDark ? "Mudar para Modo Corporativo" : "Mudar para Modo Cyber Neon"}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all border active:scale-95 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-[#00E676] hover:bg-white/10 hover:border-[#00E676]/30 shadow-lg shadow-[#00E676]/5' 
                : 'bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200 shadow-sm'
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-8 space-y-10">
        
        {/* SEÇÃO DE CONTROLES E INPUTS */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: "holerite",
                label: "Base Holerites",
                icon: <FileSpreadsheet className="w-5 h-5" />
              },
              {
                id: "depara",
                label: "Tabela De-Para",
                icon: <Database className="w-5 h-5" />
              },
              {
                id: "relatorio",
                label: "Base Cadastral",
                icon: <FileText className="w-5 h-5" />
              }
            ].map((input) => (
              <div key={input.id} className="relative group">
                <div className={`absolute inset-0 rounded-xl transition duration-200 border ${
                  isDark 
                    ? 'bg-white/5 group-hover:bg-white/10 border-white/5' 
                    : 'bg-white group-hover:shadow-md border-slate-200'
                }`} />
                <div className="relative p-5 flex flex-col gap-3">
                  <div className={`flex items-center gap-2 transition ${
                    isDark ? 'text-slate-400 group-hover:text-[#00E676]' : 'text-slate-500 group-hover:text-blue-600'
                  }`}>
                    {input.icon}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {input.label}
                    </span>
                  </div>

                  <div className={`relative h-12 flex items-center justify-center border-dashed border-2 rounded-lg overflow-hidden transition ${
                    isDark ? 'border-white/10 bg-black/20 hover:bg-black/40' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                  }`}>
                    <input
                      type="file"
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          [input.id]: e.target.files?.[0] || null
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <span className={`text-[11px] font-medium px-4 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {files[input.id as keyof typeof files]?.name || "Arraste ou clique"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAuditoria}
            disabled={loading}
            className={`h-[104px] font-bold uppercase text-xs tracking-[0.15em] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 w-full shadow-lg ${
              isDark 
                ? 'bg-[#00E676] hover:bg-[#00C853] text-black shadow-[#00E676]/10' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10'
            }`}
          >
            {loading ? (
              <Activity className="animate-spin w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            {loading ? "Processando..." : "Executar Auditoria"}
          </button>
        </section>

        {/* FEEDBACK DE AGUARDO */}
        {loading && (
          <div className={`text-center p-12 rounded-2xl border shadow-sm space-y-3 ${
            isDark ? 'bg-[#0A0F0A] border-white/5' : 'bg-white border-slate-200'
          }`}>
            <div className={`animate-spin rounded-full h-8 w-8 border-4 border-t-transparent mx-auto ${
              isDark ? 'border-[#00E676]' : 'border-blue-600'
            }`}></div>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A inteligência artificial da Groq está consolidando seus relatórios...
            </p>
          </div>
        )}

        {/* ÁREA DE RESULTADOS */}
        {resultado && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
            
            {/* PAINEL EXECUTIVO DA IA */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`border rounded-2xl p-8 shadow-sm relative overflow-hidden lg:col-span-2 ${
                isDark ? 'bg-[#0A0F0A] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <div className="absolute top-0 right-0 p-6 pointer-events-none">
                  <Sparkles className={`w-24 h-24 ${isDark ? 'text-[#00E676]/5' : 'text-blue-600/5'}`} />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isDark ? 'bg-[#00E676]/10' : 'bg-blue-50'}`}>
                      <Sparkles className={`w-4 h-4 ${isDark ? 'text-[#00E676]' : 'text-blue-600'}`} />
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#00E676]' : 'text-blue-600'}`}>
                      Resumo Executivo (Análise Groq LPU)
                    </h3>
                  </div>

                  <p className={`text-base leading-relaxed font-medium ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                    {resultado.geminiPayload}
                  </p>
                </div>
              </div>

              {/* KPIS TELA ÚNICA */}
              <div className="grid grid-cols-1 gap-4">
                <div className={`border rounded-xl p-5 flex flex-col justify-center shadow-sm ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
                }`}>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Linhas Processadas
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {resultado.totalAnalises}
                    </span>
                    <ArrowUpRight className="text-slate-400 w-4 h-4" />
                  </div>
                </div>

                <div className={`border rounded-xl p-5 flex flex-col justify-center shadow-sm ${
                  isDark ? 'bg-[#0A0F0A] border-[#00E676]/20' : 'bg-rose-50/50 border-rose-100'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-[#00E676]' : 'text-rose-600'}`}>
                    Divergências Mapeadas
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-3xl font-bold ${isDark ? 'text-[#00E676]' : 'text-rose-600'}`}>
                      {resultado.errosCount}
                    </span>
                    <AlertCircle className={`w-4 h-4 ${isDark ? 'text-[#00E676]/40' : 'text-rose-400'}`} />
                  </div>
                </div>
              </div>
            </section>

            {/* TABELA DE DIVERGÊNCIAS */}
            <section className={`border rounded-2xl overflow-hidden shadow-sm ${
              isDark ? 'bg-white/[0.02] border-white/5 shadow-2xl' : 'bg-white border-slate-200'
            }`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-white/5 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="flex items-center gap-2">
                  <Activity className="text-slate-400 w-4 h-4" />
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Registros de Divergência Mapeados
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <Clock className="w-3 h-3" />
                  <span>Resultado Pronto p/ Download</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`text-[10px] font-bold uppercase border-b ${
                      isDark ? 'bg-white/[0.03] text-slate-500 border-white/5' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      <th className="px-6 py-3">Linha</th>
                      <th className="px-6 py-3">Campo afetado</th>
                      <th className="px-6 py-3">Descrição da Inconsistência</th>
                      <th className="px-6 py-3 text-right">Mapeamento</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-slate-150'}`}>
                    {resultado.erros.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                          Nenhuma inconsistência encontrada nesta amostragem! Tudo em conformidade.
                        </td>
                      </tr>
                    ) : (
                      resultado.erros.map((erro, index) => (
                        <tr key={index} className={`transition ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/50'}`}>
                          <td className="px-6 py-4 font-mono font-bold text-slate-400">
                            #{erro.linha.toString().padStart(4, '0')}
                          </td>
                          <td className={`px-6 py-4 font-bold uppercase ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {erro.coluna || "Geral"}
                          </td>
                          <td className={`px-6 py-4 max-w-md leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {erro.mensagem}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              isDark 
                                ? 'bg-[#00E676]/5 border-[#00E676]/20 text-[#00E676]' 
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              {erro.categoria ? erro.categoria.replace(/_/g, ' ') : 'Divergência'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className={`mt-20 border-t p-6 text-center ${isDark ? 'border-white/5' : 'border-slate-200 bg-white'}`}>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Employer RH © 2026 | Apex Intelligence Infrastructure
        </p>
      </footer>
    </div>
  );
}