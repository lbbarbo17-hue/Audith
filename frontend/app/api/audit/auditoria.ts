import {
  HoleriteLinha,
  FuncionarioRelatorio,
  DeParaVerba,
  ErroAuditoria
} from "./tipos";

import {
  validarCPF,
  validarCNPJ
} from "./validadores";

function adicionarErro(
  erros: ErroAuditoria[],
  linha: number,
  coluna: string,
  campo: string,
  valorEncontrado: string,
  mensagem: string,
  categoria: ErroAuditoria["categoria"],
  valorEsperado?: string
) {
  erros.push({
    linha,
    coluna,
    campo,
    valorEncontrado,
    valorEsperado,
    mensagem,
    categoria
  });
}

export function executarAuditoria(
  holerites: HoleriteLinha[],
  funcionarios: FuncionarioRelatorio[],
  dePara: DeParaVerba[]
): ErroAuditoria[] {

  const erros: ErroAuditoria[] = [];

  const limparCPF = (value: string) => value ? String(value).replace(/\D/g, "") : "";
  const limparCNPJ = (value: string) => value ? String(value).replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

  // 1. Mapeamento indexado de funcionários cadastrais
  const funcionariosMap = new Map<string, FuncionarioRelatorio>();

  funcionarios.forEach(f => {
    const cpf = limparCPF(f.cpf);
    const cnpj = limparCNPJ(f.cnpjRegistro);
    const chave = `${cpf}-${cnpj}`;

    if (cpf) {
      funcionariosMap.set(chave, {
        ...f,
        cpf,
        cnpjRegistro: cnpj
      });
    }
  });

  // 2. Tabela de Conversão De-Para estruturada como Set de busca veloz
  const verbas = new Set<string>();
  dePara.forEach(v => {
    if (v.codigoCliente) {
      verbas.add(String(v.codigoCliente).trim().toUpperCase());
    }
  });

  const funcionariosProcessados = new Set<string>();

  for (const holerite of holerites) {
    const cpfLimpo = limparCPF(holerite.cpf);
    const cnpjLimpo = limparCNPJ(holerite.cnpj);
    const chaveFuncionario = `${cpfLimpo}-${cnpjLimpo}`;

    // Ignora processamento caso a linha esteja totalmente vazia ou corrompida
    if (!cpfLimpo && !cnpjLimpo) continue;

    if (!funcionariosProcessados.has(chaveFuncionario)) {
      funcionariosProcessados.add(chaveFuncionario);

      if (holerite.cpf && !validarCPF(holerite.cpf)) {
        adicionarErro(
          erros,
          holerite.linhaPlanilha,
          "CPF",
          "CPF",
          holerite.cpf,
          "CPF inválido",
          "cpf_invalido"
        );
      }

      if (holerite.cnpj && !validarCNPJ(holerite.cnpj)) {
        adicionarErro(
          erros,
          holerite.linhaPlanilha,
          "CNPJ",
          "CNPJ",
          holerite.cnpj,
          "CNPJ inválido",
          "cnpj_invalido"
        );
      }

      const funcionario = funcionariosMap.get(chaveFuncionario);

      if (!funcionario) {
        adicionarErro(
          erros,
          holerite.linhaPlanilha,
          "CPF/CNPJ",
          "Funcionário",
          `CPF: ${holerite.cpf}`,
          "Funcionário não encontrado cadastrado para este CNPJ",
          "cpf_nao_encontrado"
        );
      } else {
        const matHolerite = String(holerite.matricula).trim().toUpperCase();
        const matCadastro = String(funcionario.matricula).trim().toUpperCase();

        if (matHolerite !== matCadastro) {
          adicionarErro(
            erros,
            holerite.linhaPlanilha,
            "Matrícula",
            "Matrícula",
            holerite.matricula,
            "Matrícula divergente",
            "matricula_divergente",
            funcionario.matricula
          );
        }

        // Normalização preventiva das strings de data para evitar falsas divergências estruturais
        const dataH = String(holerite.dataAdmissao).trim();
        const dataC = String(funcionario.dataAdmissao).trim();

        if (dataH !== dataC && dataH && dataC) {
          adicionarErro(
            erros,
            holerite.linhaPlanilha,
            "Data Admissão",
            "Data Admissão",
            holerite.dataAdmissao,
            "Data de admissão divergente",
            "admissao_divergente",
            funcionario.dataAdmissao
          );
        }
      }
    }

    // 3. Validação de Verba de De-Para
    const codigoVerbaLimpo = String(holerite.codigoVerba).trim().toUpperCase();

    if (codigoVerbaLimpo && !verbas.has(codigoVerbaLimpo)) {
      adicionarErro(
        erros,
        holerite.linhaPlanilha,
        "Código Verba",
        "Código Verba",
        holerite.codigoVerba,
        "Código de verba não encontrado no mapeamento De-Para",
        "verba_nao_cadastrada"
      );
    }
  }

  console.log("ERROS GERADOS PROCESSADOS:", erros);
  return erros;
}