// app/api/audit/auditoria.ts

export interface HoleriteLinha {
  linhaPlanilha: number;
  cpf: string;
  cnpj: string;
  matricula: string;
  codigoVerba: string;
  dataAdmissao: string;
}

export interface FuncionarioRelatorio {
  cpf: string;
  cnpjRegistro: string;
  matricula: string;
  dataAdmissao: string;
}

export interface DeParaVerba {
  codigoCliente: string;
  codigoWfp: string;
}

export interface ErroAuditoria {
  linha: number;
  coluna: string;
  mensagem: string;
  categoria: 'matricula_divergente' | 'verba_nao_cadastrada' | 'duplicidade_depara' | 'ficha_registro_suspeita';
}

/**
 * Cruza os dados higienizados do Dev 1 e gera a lista de falhas/alertas
 */
export function executarAuditoria(
  holerites: HoleriteLinha[],
  funcionarios: FuncionarioRelatorio[],
  dePara: DeParaVerba[]
): ErroAuditoria[] {
  const erros: ErroAuditoria[] = [];

  // Indexação para busca rápida (O(1))
  const funcionarioMap = new Map<string, FuncionarioRelatorio>();
  funcionarios.forEach(f => funcionarioMap.set(f.cpf, f));

  const deParaMap = new Map<string, string[]>();
  dePara.forEach(dp => {
    const existentes = deParaMap.get(dp.codigoCliente) || [];
    deParaMap.set(dp.codigoCliente, [...existentes, dp.codigoWfp]);
  });

  for (const holerite of holerites) {
    const funcionario = funcionarioMap.get(holerite.cpf);

    // --- VALIDAÇÃO 2: Cruzamento Holerite × Funcionário ---
    if (!funcionario) {
      erros.push({
        linha: holerite.linhaPlanilha,
        coluna: "A", // Coluna do CPF
        mensagem: `CPF ${holerite.cpf} não encontrado no Relatório de Funcionários.`,
        categoria: 'matricula_divergente'
      });
      continue;
    }

    const cnpjBate = holerite.cnpj === funcionario.cnpjRegistro;
    const admissaoBate = holerite.dataAdmissao === funcionario.dataAdmissao;
    const matriculaDiverge = holerite.matricula !== funcionario.matricula;

    // Heurística de Ficha de Registro
    if (cnpjBate && admissaoBate && matriculaDiverge) {
      erros.push({
        linha: holerite.linhaPlanilha,
        coluna: "C", // Coluna da Matrícula
        mensagem: `Aviso: Matrícula diverge, mas CNPJ e Admissão batem. Suspeita de preenchimento com Ficha de Registro.`,
        categoria: 'ficha_registro_suspeita'
      });
    } else if (matriculaDiverge || !cnpjBate || !admissaoBate) {
      erros.push({
        linha: holerite.linhaPlanilha,
        coluna: "C",
        mensagem: `Divergência de dados: Matrícula, CNPJ ou Admissão não coincidem com o cadastro.`,
        categoria: 'matricula_divergente'
      });
    }

    // --- VALIDAÇÃO 3: Cruzamento Holerite × De-Para de Verbas ---
    const codigosWfp = deParaMap.get(holerite.codigoVerba);

    if (!codigosWfp) {
      erros.push({
        linha: holerite.linhaPlanilha,
        coluna: "D", // Coluna da Verba
        mensagem: `Código de Verba ${holerite.codigoVerba} não cadastrado na tabela De-Para.`,
        categoria: 'verba_nao_cadastrada'
      });
    } else if (codigosWfp.length > 1) {
      erros.push({
        linha: holerite.linhaPlanilha,
        coluna: "D",
        mensagem: `Duplicidade detectada! O código de verba ${holerite.codigoVerba} aponta para múltiplos códigos WFP (${codigosWfp.join(', ')}).`,
        categoria: 'duplicidade_depara'
      });
    }
  }

  return erros;
}

/**
 * Agrupa os erros para enviar um prompt limpo e resumido para a IA Maya
 */
export function gerarResumoParaMaya(erros: ErroAuditoria[]) {
  const resumo = {
    matriculasDivergentes: 0,
    fichasRegistroSuspeitas: 0,
    verbasNaoEncontradas: 0,
    duplicidadesDePara: 0,
    totalErros: erros.length
  };

  erros.forEach(erro => {
    if (erro.categoria === 'matricula_divergente') resumo.matriculasDivergentes++;
    if (erro.categoria === 'ficha_registro_suspeita') resumo.fichasRegistroSuspeitas++;
    if (erro.categoria === 'verba_nao_cadastrada') resumo.verbasNaoEncontradas++;
    if (erro.categoria === 'duplicidade_depara') resumo.duplicidadesDePara++;
  });

  return {
    mensagem_prompt: `Escreva um resumo executivo amigável em português para a equipe de implantação com base nestes números:
    - ${resumo.matriculasDivergentes} divergências de dados cadastrais/matrícula.
    - ${resumo.fichasRegistroSuspeitas} potenciais confusões com Ficha de Registro.
    - ${resumo.verbasNaoEncontradas} verbas sem mapeamento no De-Para.
    - ${resumo.duplicidadesDePara} códigos duplicados no De-Para.`,
    dados_brutos: resumo
  };
}