import { HoleriteLinha, FuncionarioRelatorio, DeParaVerba, ErroAuditoria } from "./tipos";
import { validarCPF, validarCNPJ } from "./validadores";

interface ParametrosErro {
  erros: ErroAuditoria[];
  linha: number;
  campo: string;
  valorEncontrado: string;
  mensagem: string;
  categoria: ErroAuditoria["categoria"];
  valorEsperado?: string;
}

function adicionarErro({
  erros,
  linha,
  campo,
  valorEncontrado,
  mensagem,
  categoria,
  valorEsperado
}: ParametrosErro) {
  erros.push({
    linha,
    coluna: "", // Mapeado dinamicamente no route.ts
    campo,
    valorEncontrado,
    valorEsperado,
    mensagem,
    categoria
  });
}

const estaVazio = (val: any) => val === null || val === undefined || String(val).trim() === "";

export function executarAuditoria(
  holerites: HoleriteLinha[],
  funcionarios: FuncionarioRelatorio[],
  dePara: DeParaVerba[]
): ErroAuditoria[] {

  const erros: ErroAuditoria[] = [];

  // 1. Dicionários de Tradução das Regras dos Comentários
  const dicionarioTipoFolha: Record<string, string> = {
    "1": "Folha Regular",
    "2": "Adiantamento",
    "3": "Décimo Terceiro",
    "4": "Férias",
    "5": "Rescisão",
    "6": "Adiantamento de Décimo Terceiro",
    "7": "Adiantamento Complementar",
    "8": "Rescisão Complementar",
    "9": "RPA",
    "10": "PLR",
    "14": "Recesso Estagiário"
  };

  const dicionarioNatureza: Record<string, string> = {
    "0": "Provento",
    "1": "Desconto",
    "2": "Base",
    "3": "Encargos",
    "4": "Informação"
  };

  const dicionarioIncidencia: Record<string, string> = {
    "0": "Não",
    "1": "Sim"
  };

  // Indexação dos funcionários (CPF + CNPJ)
  const funcionariosMap = new Map<string, FuncionarioRelatorio>();
  funcionarios.forEach(f => {
    const cpfLimpo = String(f.cpf || "").replace(/\D/g, "");
    const cnpjLimpo = String(f.cnpjRegistro || "").replace(/\D/g, "");
    if (cpfLimpo) funcionariosMap.set(`${cpfLimpo}-${cnpjLimpo}`, f);
  });

  const verbasValidasSet = new Set(dePara.map(v => String(v.codigoCliente).trim().toUpperCase()));

  const regexDataAmericana = /^\d{4}-\d{2}-\d{2}$/;
  const regexDecimalPonto = /^\d+(\.\d+)?$/;

  for (const holerite of holerites) {
    const linha = holerite.linhaPlanilha;

    // ==========================================
    // 🟧 CAMPOS LARANJAS: Obrigatórios + Formato Estrito
    // ==========================================

    // CPF
    if (estaVazio(holerite.cpf)) {
      adicionarErro({ erros, linha, campo: "CPF", valorEncontrado: "", mensagem: "Campo obrigatório (Laranja) não preenchido.", categoria: "campo_obrigatorio" });
    } else if (/\D/.test(holerite.cpf) || !validarCPF(holerite.cpf)) {
      adicionarErro({ erros, linha, campo: "CPF", valorEncontrado: holerite.cpf, mensagem: "Formato incorreto ou inválido. Deve conter apenas números, sem pontos ou traços.", categoria: "formato_invalido", valorEsperado: "Apenas números" });
    }

    // CNPJ REGISTRO
    if (estaVazio(holerite.cnpj)) {
      adicionarErro({ erros, linha, campo: "CNPJ", valorEncontrado: "", mensagem: "Campo obrigatório (Laranja) não preenchido.", categoria: "campo_obrigatorio" });
    } else if (/[^a-zA-Z0-9]/.test(holerite.cnpj) || !validarCNPJ(holerite.cnpj)) {
      adicionarErro({ erros, linha, campo: "CNPJ", valorEncontrado: holerite.cnpj, mensagem: "Formato incorreto ou inválido. Deve conter apenas números/letras sem caracteres especiais.", categoria: "formato_invalido", valorEsperado: "Apenas números" });
    }

    // DATA ADMISSÃO
    if (estaVazio(holerite.dataAdmissao)) {
      adicionarErro({ erros, linha, campo: "Data Admissão", valorEncontrado: "", mensagem: "Campo obrigatório (Laranja) não preenchido.", categoria: "campo_obrigatorio" });
    } else if (!regexDataAmericana.test(holerite.dataAdmissao)) {
      adicionarErro({ erros, linha, campo: "Data Admissão", valorEncontrado: holerite.dataAdmissao, mensagem: "Data fora do formato padrão americano exigido (AAAA-MM-DD).", categoria: "formato_invalido", valorEsperado: "YYYY-MM-DD" });
    }

    // ==========================================
    // 🟨 CAMPOS AMARELOS: Obrigatórios Simples
    // ==========================================

    // MATRÍCULA
    if (estaVazio(holerite.matricula)) {
      adicionarErro({ erros, linha, campo: "Matrícula", valorEncontrado: "", mensagem: "Campo obrigatório (Amarelo) não pode permanecer em branco.", categoria: "campo_obrigatorio" });
    }

    // TIPO DE FOLHA
    const tipoFolhaSlipped = String(holerite.tipoFolha || "").trim();
    if (estaVazio(holerite.tipoFolha)) {
      adicionarErro({ erros, linha, campo: "Tipo de Folha", valorEncontrado: "", mensagem: "Campo obrigatório (Amarelo) não pode permanecer em branco.", categoria: "campo_obrigatorio" });
    } else if (!dicionarioTipoFolha[tipoFolhaSlipped]) {
      const opcoes = Object.entries(dicionarioTipoFolha).map(([k, v]) => `${k}-${v}`).join(", ");
      adicionarErro({ erros, linha, campo: "Tipo de Folha", valorEncontrado: holerite.tipoFolha, mensagem: `Código inválido. Opções aceitas pelo sistema: [${opcoes}]`, categoria: "formato_invalido" });
    }

    // ==========================================
    // 🟩 CAMPOS VERDES: Opcionais com Formato
    // ==========================================

    // VALOR VERBA
    if (!estaVazio(holerite.valorVerba)) {
      if (String(holerite.valorVerba).includes(",") || !regexDecimalPonto.test(String(holerite.valorVerba))) {
        adicionarErro({ erros, linha, campo: "Valor Verba", valorEncontrado: String(holerite.valorVerba), mensagem: "Formato inválido (Verde). Valores numéricos devem utilizar ponto (.) como separador decimal, nunca vírgula (,).", categoria: "formato_invalido", valorEsperado: "Ex: 1500.50" });
      }
    }

    // QUANTIDADE REFERÊNCIA
    if (!estaVazio(holerite.quantidadeReferencia)) {
      if (String(holerite.quantidadeReferencia).includes(",") || !regexDecimalPonto.test(String(holerite.quantidadeReferencia))) {
        adicionarErro({ erros, linha, campo: "Quantidade Referência", valorEncontrado: String(holerite.quantidadeReferencia), mensagem: "Formato inválido (Verde). Deve utilizar ponto (.) para decimais.", categoria: "formato_invalido", valorEsperado: "Ex: 220.00" });
      }
    }

    // NATUREZA VERBA
    const naturezaSlipped = String(holerite.naturezaVerba || "").trim();
    if (!estaVazio(holerite.naturezaVerba) && !dicionarioNatureza[naturezaSlipped]) {
      const opcoesNat = Object.entries(dicionarioNatureza).map(([k, v]) => `${k}=${v}`).join(", ");
      adicionarErro({ erros, linha, campo: "Natureza Verba", valorEncontrado: String(holerite.naturezaVerba), mensagem: `Código inválido. Use os padrões de eSocial: [${opcoesNat}]`, categoria: "formato_invalido" });
    }

    // INCIDÊNCIA INSS
    const inssSlipped = String(holerite.incidenciaInss || "").trim();
    if (!estaVazio(holerite.incidenciaInss) && !dicionarioIncidencia[inssSlipped]) {
      adicionarErro({ erros, linha, campo: "Incidência INSS", valorEncontrado: String(holerite.incidenciaInss), mensagem: "Valor inválido. Preencha apenas com 0 (Não) ou 1 (Sim).", categoria: "formato_invalido", valorEsperado: "0 ou 1" });
    }

    // INCIDÊNCIA FGTS
    const fgtsSlipped = String(holerite.incidenciaFgts || "").trim();
    if (!estaVazio(holerite.incidenciaFgts) && !dicionarioIncidencia[fgtsSlipped]) {
      adicionarErro({ erros, linha, campo: "Incidência FGTS", valorEncontrado: String(holerite.incidenciaFgts), mensagem: "Valor inválido. Preencha apenas com 0 (Não) ou 1 (Sim).", categoria: "formato_invalido", valorEsperado: "0 ou 1" });
    }

    // PERCENTUAL VERBA (Obrigatório se for Hora Extra)
    const descVerba = String(holerite.descricaoVerba || "").toUpperCase();
    if (descVerba.includes("HORA EXTRA") && estaVazio(holerite.percentualVerba)) {
      adicionarErro({ erros, linha, campo: "Percentual Verba", valorEncontrado: "", mensagem: "Aviso: Esta verba é identificada como Hora Extra e necessita do preenchimento do percentual multiplicador.", categoria: "campo_obrigatorio" });
    }

    // ==========================================
    // 🔍 CRUZAMENTO CADASTRAL ENTRE PLANILHAS
    // ==========================================
    const cpfLimpo = String(holerite.cpf || "").replace(/\D/g, "");
    const cnpjLimpo = String(holerite.cnpj || "").replace(/\D/g, "");
    
    if (cpfLimpo && cnpjLimpo) {
      const funcionarioCadastrado = funcionariosMap.get(`${cpfLimpo}-${cnpjLimpo}`);

      if (!funcionarioCadastrado) {
        adicionarErro({ erros, linha, campo: "CPF", valorEncontrado: holerite.cpf, mensagem: "Funcionário não localizado no cadastro ativo do PRD para este CNPJ (Pode indicar uma transferência de filial pendente).", categoria: "cpf_nao_encontrado" });
      } else {
        const matHolerite = String(holerite.matricula || "").trim().replace(/^0+/, "");
        const matCadastro = String(funcionarioCadastrado.matricula || "").trim().replace(/^0+/, "");
        if (matHolerite !== matCadastro && !estaVazio(holerite.matricula)) {
          adicionarErro({ erros, linha, campo: "Matrícula", valorEncontrado: holerite.matricula, mensagem: `Divergência Cadastral. No sistema PRD a matrícula ativa é ${funcionarioCadastrado.matricula}. Certifique-se de que não enviou a Ficha de Registro.`, categoria: "matricula_divergente", valorEsperado: funcionarioCadastrado.matricula });
        }

        const dataH = String(holerite.dataAdmissao || "").trim();
        const dataC = String(funcionarioCadastrado.dataAdmissao || "").trim();
        if (dataH !== dataC && regexDataAmericana.test(dataH) && !estaVazio(dataC)) {
          adicionarErro({ erros, linha, campo: "Data Admissão", valorEncontrado: holerite.dataAdmissao, mensagem: `Divergência Cadastral. A data registrada no PRD é ${dataC}.`, categoria: "admissao_divergente", valorEsperado: dataC });
        }
      }
    }

    const codVerbaMapeado = String(holerite.codigoVerba || "").trim().toUpperCase();
    if (!estaVazio(holerite.codigoVerba) && !verbasValidasSet.has(codVerbaMapeado)) {
      adicionarErro({ erros, linha, campo: "Código Verba", valorEncontrado: holerite.codigoVerba, mensagem: "Código de verba enviado pelo cliente não possui correspondência mapeada na tabela De-Para.", categoria: "verba_nao_cadastrada" });
    }
  }

  return erros;
}