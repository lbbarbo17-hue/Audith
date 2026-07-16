'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  FileText, 
  Database, 
  ChevronRight,
  ShieldCheck,
  Activity,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

// Interfaces de Dados
interface ErroAuditoria {
  linha: number;
  coluna: string;
  mensagem: string;
  categoria: 'matricula_divergente' | 'verba_nao_cadastrada' | 'duplicidade_depara' | 'ficha_registro_suspeita';
}

interface AuditoriaResponse {
  success: boolean;
  totalAnalises: number;
  errosCount: number;
  erros: ErroAuditoria[];
  mayaPayload: {
    mensagem_prompt: string;
    dados_brutos: {
      matriculasDivergentes: number;
      fichasRegistroSuspeitas: number;
      verbasNaoEncontradas: number;
      duplicidadesDePara: number;
      totalErros: number;
    };
  };
}

export default function ApexCorporateAudit() {
  const [files, setFiles] = useState<{holerite: File | null, depara: File | null, relatorio: File | null}>({
    holerite: null, depara: null, relatorio: null
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AuditoriaResponse | null>(null);

  const handleAuditoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.holerite || !files.depara || !files.relatorio) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('holerite', files.holerite);
    formData.append('depara', files.depara);
    formData.append('relatorio', files.relatorio);

    try {
      const response = await fetch('/api/audit', { method: 'POST', body: formData });
      const data = await response.json();
      setResultado(data);
    } catch (err) {
      console.error("Erro na comunicação com Gemini API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030703] text-slate-200 font-sans selection:bg-[#00E676] selection:text-black">
      
      {/* Camada de Fundo Premium - Gradientes Sutis */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00E676]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] bg-[#00E676]/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header Corporativo */}
      <header className="relative z-20 border-b border-white/5 bg-[#030703]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white font-black tracking-tighter text-2xl uppercase">Employer</span>
            <div className="w-[1px] h-6 bg-white/20"></div>
            <span className="text-[#00E676] font-light tracking-[0.2em] text-xl">APEX</span>
          </div>
          <nav className="hidden md:flex gap-6 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            <span className="text-[#00E676] border-b border-[#00E676] pb-1 cursor-default">Auditoria ETL</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Histórico</span>
            <span className="hover:text-slate-300 transition cursor-pointer">Configurações</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400">STATUS DO SISTEMA</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00E676] rounded-full animate-pulse"></span>
              <span className="text-[11px] text-[#00E676] font-mono">GEMINI_1.5_PRO_ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-8 space-y-12">
        
        {/* Seção de Upload - Estilo "Vault" */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-end">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {[
              { id: 'holerite', label: 'Base Holerites', icon: <FileSpreadsheet className="w-5 h-5"/> },
              { id: 'depara', label: 'Tabela De-Para', icon: <Database className="w-5 h-5"/> },
              { id: 'relatorio', label: 'Base Cadastral', icon: <FileText className="w-5 h-5"/> }
            ].map((input) => (
              <div key={input.id} className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-xl transition group-hover:bg-white/10"></div>
                <div className="relative p-6 border border-white/5 rounded-xl flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-slate-400 group-hover:text-[#00E676] transition">
                    {input.icon}
                    <span className="text-xs font-bold uppercase tracking-wider">{input.label}</span>
                  </div>
                  <div className="relative h-12 flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-black/20 overflow-hidden">
                    <input 
                      type="file" 
                      onChange={(e) => setFiles({...files, [input.id]: e.target.files?.[0] || null})}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <span className="text-[10px] text-slate-500 font-medium px-4 truncate">
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
            className="h-20 lg:col-span-1 bg-[#00E676] hover:bg-[#00C853] text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_40px_-15px_rgba(0,230,118,0.4)]"
          >
            {loading ? <Activity className="animate-spin w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            {loading ? 'Processando' : 'Iniciar Auditoria'}
          </button>
        </section>

        {resultado && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Dashboard de Insights Gemini */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card Inteligência Gemini */}
              <div className="lg:col-span-2 bg-[#0A0F0A] border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-6">
                  <Sparkles className="text-[#00E676]/20 w-12 h-12" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00E676]/10 rounded-lg">
                      <Sparkles className="text-[#00E676] w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#00E676]">Gemini Intelligence Report</h3>
                  </div>
                  <p className="text-lg leading-relaxed text-slate-100 font-light italic">
                    &quot;{resultado.mayaPayload.mensagem_prompt}&quot;
                  </p>
                  <div className="flex gap-4 pt-4">
                    {Object.entries(resultado.mayaPayload.dados_brutos).filter(([k]) => k !== 'totalErros').map(([key, val]) => (
                      <div key={key} className="px-4 py-2 bg-white/5 rounded-full border border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-xs text-[#00E676] font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPIs Rápidos */}
              <div className="grid grid-rows-2 gap-6">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Linhas Analisadas</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-light text-white">{resultado.totalAnalises}</span>
                    <ArrowUpRight className="text-slate-600 w-4 h-4" />
                  </div>
                </div>
                <div className="bg-[#0A0F0A] border border-[#00E676]/20 rounded-2xl p-6 flex flex-col justify-center">
                  <span className="text-[#00E676] text-[10px] font-bold uppercase tracking-widest mb-2">Alertas de Integridade</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-light text-[#00E676]">{resultado.errosCount}</span>
                    <AlertCircle className="text-[#00E676]/40 w-4 h-4" />
                  </div>
                </div>
              </div>
            </section>

            {/* Tabela de Detalhes Estilo High-Tech */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="text-slate-400 w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Registros de Divergência</h3>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
                  <Clock className="w-3 h-3" />
                  <span>Gerado agora</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.03] text-slate-500 text-[10px] font-black uppercase tracking-tighter border-b border-white/5">
                      <th className="px-8 py-4">Ref. Linha</th>
                      <th className="px-8 py-4">Métrica/Campo</th>
                      <th className="px-8 py-4">Análise Detalhada</th>
                      <th className="px-8 py-4 text-right">Gravidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {resultado.erros.map((erro, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition">
                        <td className="px-8 py-5 font-mono text-xs text-slate-400"># {erro.linha.toString().padStart(4, '0')}</td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-200 uppercase tracking-tight">{erro.coluna}</td>
                        <td className="px-8 py-5 text-xs text-slate-400 leading-relaxed max-w-md">{erro.mensagem}</td>
                        <td className="px-8 py-5 text-right">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            erro.categoria === 'matricula_divergente' 
                            ? 'bg-amber-400/5 border-amber-400/20 text-amber-400' 
                            : 'bg-[#00E676]/5 border-[#00E676]/20 text-[#00E676]'
                          }`}>
                            {erro.categoria.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
      
      {/* Footer Minimalista */}
      <footer className="mt-20 border-t border-white/5 p-8 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          Employer RH &copy; 2024 | Apex Intelligence Infrastructure
        </p>
      </footer>
    </div>
  );
}