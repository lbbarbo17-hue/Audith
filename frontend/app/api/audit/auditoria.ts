import { HoleriteLinha, FuncionarioRelatorio, DeParaVerba, ErroAuditoria } from "./tipos";
import { validarCPF, validarCNPJ } from "./validadores";

const estaVazio = (val: unknown): boolean => val === null || val === undefined || String(val).trim() === "";

export function executarAuditoria(
  holerites: HoleriteLinha[],
  funcionarios: FuncionarioRelatorio[],
  dePara: DeParaVerba[]
): ErroAuditoria[] {

  const notificacoes: ErroAuditoria[] = [];

  // 🌟 MUDANÇA: Agora mantém letras e números (Remove apenas pontos, traços e espaços)
  const contagemCpfMap = new Map<string, number>();
  holerites.forEach(h => {
    const cpfLimpo = String(h.cpf || "").replace(/[\.\-\s]/g, "").toUpperCase();
    if (cpfLimpo) {
      contagemCpfMap.set(cpfLimpo, (contagemCpfMap.get(cpfLimpo) || 0) + 1);
    }
  });

  const cpfsJaAvisadosDuplicidade = new Set<string>();

  // 🌟 MUDANÇA: Mapeia os funcionários usando o CPF com suporte a letras
  const funcionariosMap = new Map<string, FuncionarioRelatorio>();
  funcionarios.forEach(f => {
    const cpfLimpo = String(f.cpf || "").replace(/[\.\-\s]/g, "").toUpperCase();
    const cnpjLimpo = String(f.cnpjRegistro || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cpfLimpo) funcionariosMap.set(`${cpfLimpo}-${cnpjLimpo}`, f);
  });

  const verbasValidasSet = new Set(dePara.map(v => String(v.codigoCliente).trim().toUpperCase()));
  const regexDataAmericana = /^\d{4}-\d{2}-\d{2}$/;
  const regexDecimalPonto = /^\d+(\.\d+)?$/;

  for (const holerite of holerites) {
    const linha = holerite.linhaPlanilha;
    const cpfOrigem = String(holerite.cpf || "").trim();
    
    // 🌟 MUDANÇA: Normalização alfanumérica mantendo as letras intactas
    const cpfLimpo = cpfOrigem.replace(/[\.\-\s]/g, "").toUpperCase();
    const cnpjLimpo = String(holerite.cnpj || "").replace(/[^a-zA-Z0-9]/g, "").trim().toUpperCase();

    // 🌟 MUDANÇA: Ajustada a validação estrutural do CPF para aceitar alfanuméricos
    if (estaVazio(cpfOrigem)) {
      notificacoes.push({ linha, coluna: "A", campo: "CPF", valorEncontrado: "", mensagem: "Campo obrigatório não preenchido.", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", categoria: "campo_obrigatorio" });
      continue;
    } else if (!validarCPF(cpfOrigem)) {
      notificacoes.push({ linha, coluna: "A", campo: "CPF", valorEncontrado: cpfOrigem, mensagem: "CPF inválido (Formato inválido ou dígitos verificadores incorretos).", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", valorEsperado: "Formato válido de 11 dígitos", categoria: "cpf_invalido" });
      continue;
    }

    const fCadastrado = funcionariosMap.get(`${cpfLimpo}-${cnpjLimpo}`);

    if (!fCadastrado) {
      notificacoes.push({
        linha,
        coluna: "A",
        campo: "CPF",
        valorEncontrado: cpfOrigem,
        mensagem: "Colaborador não localizado no cadastro ativo do PRD para esta filial.",
        tipoNotificacao: "DIVERGENCIA_CPF",
        statusVisual: "VERMELHO",
        categoria: "cpf_nao_encontrado"
      });
    } else {
      const ocorrenciasCpf = contagemCpfMap.get(cpfLimpo) || 0;
      if (ocorrenciasCpf > 1 && !cpfsJaAvisadosDuplicidade.has(cpfLimpo)) {
        notificacoes.push({
          linha,
          coluna: "A",
          campo: "CPF",
          valorEncontrado: cpfOrigem,
          mensagem: `Múltiplos registros ativos encontrados na planilha para o mesmo CPF (${ocorrenciasCpf} lançamentos). Verificação visual recomendada para múltiplos contratos.`,
          tipoNotificacao: "DIVERGENCIA_CPF",
          statusVisual: "AMARELO",
          categoria: "duplicidade_depara"
        });
        cpfsJaAvisadosDuplicidade.add(cpfLimpo);
      }

      const matH = String(holerite.matricula || "").trim().replace(/^0+/, "");
      const matC = String(fCadastrado.matricula || "").trim().replace(/^0+/, "");
      if (matH !== matC && !estaVazio(holerite.matricula)) {
        notificacoes.push({
          linha,
          coluna: "E",
          campo: "Matrícula",
          valorEncontrado: String(holerite.matricula),
          mensagem: `Divergência Cadastral. No sistema PRD a matrícula ativa é ${fCadastrado.matricula}.`,
          tipoNotificacao: "DIVERGENCIA_CPF",
          statusVisual: "VERMELHO",
          valorEsperado: fCadastrado.matricula,
          categoria: "matricula_divergente"
        });
      }
    }

    if (estaVazio(holerite.cnpj)) {
      notificacoes.push({ linha, coluna: "B", campo: "CNPJ", valorEncontrado: "", mensagem: "CNPJ obrigatório não preenchido.", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", categoria: "campo_obrigatorio" });
    } else if (!validarCNPJ(cnpjLimpo)) {
      notificacoes.push({ linha, coluna: "B", campo: "CNPJ", valorEncontrado: String(holerite.cnpj), mensagem: "CNPJ inválido.", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", categoria: "cnpj_invalido" });
    }

    if (estaVazio(holerite.dataAdmissao)) {
      notificacoes.push({ linha, coluna: "D", campo: "Data Admissão", valorEncontrado: "", mensagem: "Data de admissão obrigatória.", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", categoria: "campo_obrigatorio" });
    } else if (!regexDataAmericana.test(String(holerite.dataAdmissao).trim())) {
      notificacoes.push({ linha, coluna: "D", campo: "Data Admissão", valorEncontrado: String(holerite.dataAdmissao), mensagem: "Formato fora do padrão exigido (AAAA-MM-DD).", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", valorEsperado: "YYYY-MM-DD", categoria: "data_invalida" });
    }

    if (!estaVazio(holerite.valorVerba)) {
      if (String(holerite.valorVerba).includes(",") || !regexDecimalPonto.test(String(holerite.valorVerba))) {
        notificacoes.push({ linha, coluna: "Q", campo: "Valor Verba", valorEncontrado: String(holerite.valorVerba), mensagem: "Utilize ponto (.) como separador decimal.", tipoNotificacao: "ERRO_ESTRUTURAL", statusVisual: "VERMELHO", categoria: "campo_obrigatorio" });
      }
    }

    if (holerite.codigoVerba && !verbasValidasSet.has(String(holerite.codigoVerba).trim().toUpperCase())) {
      notificacoes.push({
        linha,
        coluna: "L",
        campo: "Código Verba",
        valorEncontrado: String(holerite.codigoVerba),
        mensagem: "Código de Verba não localizado na tabela de De-Para externa.",
        tipoNotificacao: "ERRO_ESTRUTURAL",
        statusVisual: "VERMELHO",
        categoria: "verba_nao_cadastrada"
      });
    }
  }

  return notificacoes;
}