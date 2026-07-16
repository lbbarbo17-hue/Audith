'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  FileText, 
  Upload, 
  RefreshCw 
} from 'lucide-react';

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

export default function PainelAuditoria() {
  // Estados para armazenar os arquivos selecionados
  const [holerite, setHolerite] = useState<File | null>(null);
  const [depara, setDepara] = useState<File | null>(null);
  const [relatorio, setRelatorio] = useState<File | null>(null);

  // Estados de controle da requisição
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AuditoriaResponse | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);

  const handleAuditoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holerite || !depara || !relatorio) {
      alert("Por favor, selecione as três planilhas obrigatórias.");
      return;
    }

    setLoading(true);
    setErroApi(null);
    setResultado(null);

    const formData = new FormData();
    formData.append('holerite', holerite);
    formData.append('depara', depara);
    formData.append('relatorio', relatorio);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detalhes || 'Erro desconhecido ao processar auditoria.');
      }

      setResultado(data);
    } catch (err: any) {
      console.error(err);
      setErroApi(err.message || 'Erro ao conectar-se com o servidor de auditoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header com efeito neon sutil */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <FileSpreadsheet className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                AUDITH ETL
              </h1>
              <p className="text-xs text-slate-400">Sistema Inteligente de Auditoria Cadastral</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-cyan-950/50 border border-cyan-800/60 text-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            v1.2.0 - Maya IA Integrada
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Formulário de Importação */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-cyan-400">
            <Upload className="w-5 h-5" /> Importar Planilhas para Cruzamento
          </h2>

          <form onSubmit={handleAuditoria} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Holerites */}
              <div className="flex flex-col p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition duration-300 relative group">
                <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                  1. Planilha de Holerites
                </label>
                <div className="border border-dashed border-slate-800 group-hover:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-900/20">
                  <input 
                    type="file" 
                    accept=".xlsx"
                    onChange={(e) => setHolerite(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-slate-500 mb-2 group-hover:text-cyan-400 transition" />
                  <span className="text-xs text-slate-400 font-medium">
                    {holerite ? holerite.name : 'Selecione arquivo .xlsx'}
                  </span>
                </div>
              </div>

              {/* Card 2: De-Para */}
              <div className="flex flex-col p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/40 transition duration-300 relative group">
                <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  2. De-Para de Verbas
                </label>
                <div className="border border-dashed border-slate-800 group-hover:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-900/20">
                  <input 
                    type="file" 
                    accept=".xlsx"
                    onChange={(e) => setDepara(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-slate-500 mb-2 group-hover:text-blue-400 transition" />
                  <span className="text-xs text-slate-400 font-medium">
                    {depara ? depara.name : 'Selecione arquivo .xlsx'}
                  </span>
                </div>
              </div>

              {/* Card 3: Funcionários */}
              <div className="flex flex-col p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition duration-300 relative group">
                <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  3. Relatório Cadastral
                </label>
                <div className="border border-dashed border-slate-800 group-hover:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-900/20">
                  <input 
                    type="file" 
                    accept=".xlsx"
                    onChange={(e) => setRelatorio(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileText className="w-8 h-8 text-slate-500 mb-2 group-hover:text-indigo-400 transition" />
                  <span className="text-xs text-slate-400 font-medium">
                    {relatorio ? relatorio.name : 'Selecione arquivo .xlsx'}
                  </span>
                </div>
              </div>

            </div>

            {/* Ação */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Processando Planilhas...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" /> Iniciar Auditoria Cruzada
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Notificação de Erro da API */}
        {erroApi && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-sm flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <div>
              <strong className="font-bold">Ocorreu um erro ao processar:</strong>
              <p className="mt-1 text-red-300">{erroApi}</p>
            </div>
          </div>
        )}

        {/* Resultados da Auditoria */}
        {resultado && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Grid de Resumo e IA Maya */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Box de Estatísticas Cadastrais */}
              <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Métricas Obtidas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-sm text-slate-400">Total Analisado:</span>
                      <span className="font-bold text-slate-100">{resultado.totalAnalises} linhas</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-sm text-slate-400">Alertas Gerados:</span>
                      <span className={`font-bold ${resultado.errosCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {resultado.errosCount} inconsistências
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-400">Status Geral:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        resultado.errosCount === 0 
                          ? 'bg-emerald-950 text-emerald-400' 
                          : 'bg-amber-950 text-amber-400'
                      }`}>
                        {resultado.errosCount === 0 ? 'Conforme' : 'Ajustes Necessários'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel da IA Maya */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-400 animate-pulse" /> Relatório Executivo (IA Maya)
                    </h3>
                    <span className="text-[10px] uppercase font-semibold text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-950/50">
                      Payload Pronto
                    </span>
                  </div>
                  <blockquote className="bg-slate-950/60 border-l-2 border-indigo-500 p-4 rounded-r-lg text-slate-300 text-sm leading-relaxed italic whitespace-pre-line">
                    "{resultado.mayaPayload.mensagem_prompt}"
                  </blockquote>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400">
                  <span>Inconsistências divididas:</span>
                  <span className="font-mono">
                    M: {resultado.mayaPayload.dados_brutos.matriculasDivergentes} | 
                    F: {resultado.mayaPayload.dados_brutos.fichasRegistroSuspeitas} | 
                    V: {resultado.mayaPayload.dados_brutos.verbasNaoEncontradas} | 
                    D: {resultado.mayaPayload.dados_brutos.duplicidadesDePara}
                  </span>
                </div>
              </div>

            </div>

            {/* Listagem Detalhada de Inconsistências */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Detalhes das Inconsistências
                </h3>
                <span className="text-xs text-slate-400">Exibindo todos os alertas</span>
              </div>

              {resultado.erros.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Nenhuma divergência ou erro cadastral foi encontrado nas planilhas analisadas!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                        <th className="py-4 px-6">Linha</th>
                        <th className="py-4 px-6">Coluna</th>
                        <th className="py-4 px-6">Inconsistência Identificada</th>
                        <th className="py-4 px-6">Categoria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                      {resultado.erros.map((erro, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition duration-150">
                          <td className="py-4 px-6 font-mono font-bold text-cyan-400">{erro.linha}</td>
                          <td className="py-4 px-6 font-mono text-slate-400">{erro.coluna}</td>
                          <td className="py-4 px-6 text-slate-300 font-medium">{erro.mensagem}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                              erro.categoria === 'matricula_divergente' 
                                ? 'bg-red-950/60 border border-red-800/40 text-red-400' 
                                : erro.categoria === 'ficha_registro_suspeita'
                                ? 'bg-amber-950/60 border border-amber-800/40 text-amber-400'
                                : erro.categoria === 'verba_nao_cadastrada'
                                ? 'bg-indigo-950/60 border border-indigo-800/40 text-indigo-400'
                                : 'bg-pink-950/60 border border-pink-800/40 text-pink-400'
                            }`}>
                              {erro.categoria === 'matricula_divergente' && 'Erro de Cadastro'}
                              {erro.categoria === 'ficha_registro_suspeita' && 'Ficha Registro'}
                              {erro.categoria === 'verba_nao_cadastrada' && 'Verba s/ De-Para'}
                              {erro.categoria === 'duplicidade_depara' && 'Duplicidade De-Para'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}