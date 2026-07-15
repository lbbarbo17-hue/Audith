// app/api/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

// Importando as funções e interfaces diretamente do arquivo local do Dev 2
import { 
  executarAuditoria, 
  gerarResumoParaMaya, 
  HoleriteLinha, 
  FuncionarioRelatorio, 
  DeParaVerba 
} from "./auditoria";

// ==========================================
// 🛠️ PIPELINE DE HIGIENIZAÇÃO (Sua parte - Dev 1)
// ==========================================

function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, ""); // Remove pontos, traços e espaços
}

function limparCNPJ(cnpj: string, aceitarAlfanumerico: boolean): string {
  if (aceitarAlfanumerico) {
    return cnpj.replace(/[-./]/g, "").trim(); // Mantém letras se o toggle do front for ativo
  }
  return cnpj.replace(/\D/g, ""); // Se false, limpa deixando só números
}

function padronizarData(dataRaw: any): string {
  if (!dataRaw) return "";
  if (dataRaw instanceof Date) {
    return dataRaw.toISOString().split("T")[0];
  }
  const dataStr = String(dataRaw).trim();
  const regexBR = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dataStr.match(regexBR);
  if (match) {
    const [_, dia, mes, ano] = match;
    return `${ano}-${mes}-${dia}`; // DD/MM/YYYY -> YYYY-MM-DD
  }
  return dataStr;
}

interface ErroEstrutural {
  linha: number;
  coluna: string;
  mensagem: string;
}

// ==========================================
// 🚀 ROTA PRINCIPAL DA API (Integração Total)
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const cnpjAlfanumerico = formData.get("cnpjAlfanumerico") === "true"; // Toggle vindo do front

    // --- MOCKS DO DEV 2 (Dados simulados para o cruzamento) ---
    const mockFuncionariosRH: FuncionarioRelatorio[] = [
      { cpf: "12345678901", cnpjRegistro: "12345678000199", matricula: "M001", dataAdmissao: "2020-01-15" },
      { cpf: "98765432100", cnpjRegistro: "12345678000199", matricula: "M002", dataAdmissao: "2018-06-10" }
    ];

    const mockDeParaVerbas: DeParaVerba[] = [
      { codigoCliente: "101", codigoWfp: "WFP-SALARIO" },
      { codigoCliente: "102", codigoWfp: "WFP-VALE" }
    ];

    if (!file) {
      return NextResponse.json({ sucesso: false, erro: "Selecione um arquivo de planilha." }, { status: 400 });
    }

 // 1. Ingestão e Leitura Segura da Planilha
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    
    // Convertemos o arrayBuffer usando "as unknown as ArrayBuffer" para o ExcelJS aceitar no Next.js
    await workbook.xlsx.load(arrayBuffer as unknown as ArrayBuffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return NextResponse.json({ sucesso: false, erro: "A planilha está sem abas ativas." }, { status: 400 });
    }

    const dadosHigienizados: HoleriteLinha[] = [];
    const errosEstruturais: ErroEstrutural[] = [];

    // Coordenadas das colunas na planilha física
    const colunas = { 
      cpf: "A", 
      cnpj: "B", 
      matricula: "C", 
      codigoVerba: "D", 
      valorVerba: "E", 
      mes: "F", 
      ano: "G", 
      dataAdmissao: "H" 
    };

    // 2. Loop de Processamento e Higienização (Dev 1)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Ignora a linha do cabeçalho

      const rawCpf = row.getCell(colunas.cpf).value;
      const rawCnpj = row.getCell(colunas.cnpj).value;
      const rawMatricula = row.getCell(colunas.matricula).value;
      const rawCodigoVerba = row.getCell(colunas.codigoVerba).value;
      const rawMes = row.getCell(colunas.mes).value;
      const rawAno = row.getCell(colunas.ano).value;
      const rawDataAdmissao = row.getCell(colunas.dataAdmissao).value;

      // Executa o seu Pipeline de Tratamento
      const cpfLimpo = rawCpf ? limparCPF(String(rawCpf)) : "";
      const cnpjLimpo = rawCnpj ? limparCNPJ(String(rawCnpj), cnpjAlfanumerico) : "";
      const matriculaStr = rawMatricula ? String(rawMatricula).trim() : "";
      const codigoVerbaStr = rawCodigoVerba ? String(rawCodigoVerba).trim() : "";
      const mesStr = rawMes ? String(rawMes).trim().padStart(2, "0") : "";
      const anoStr = rawAno ? String(rawAno).trim() : "";
      const dataAdmissaoFormatada = padronizarData(rawDataAdmissao);

      let linhaErro = false;

      // Validação CPF (11 dígitos)
      if (!cpfLimpo || cpfLimpo.length !== 11) {
        errosEstruturais.push({ linha: rowNumber, coluna: colunas.cpf, mensagem: "CPF inválido. Deve ter exatamente 11 dígitos numéricos." });
        linhaErro = true;
      }

      // Validação CNPJ (14 dígitos)
      if (!cnpjLimpo || cnpjLimpo.length !== 14) {
        errosEstruturais.push({ linha: rowNumber, coluna: colunas.cnpj, mensagem: "CNPJ inválido. Deve ter exatamente 14 dígitos." });
        linhaErro = true;
      }

      // Validação de Mês (01 a 12)
      const mesNum = parseInt(mesStr, 10);
      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        errosEstruturais.push({ linha: rowNumber, coluna: colunas.mes, mensagem: "Mês inválido (deve ser entre 01 e 12)." });
        linhaErro = true;
      }

      // Validação de Ano (4 dígitos)
      if (anoStr.length !== 4 || isNaN(parseInt(anoStr, 10))) {
        errosEstruturais.push({ linha: rowNumber, coluna: colunas.ano, mensagem: "Ano inválido. Deve ter 4 dígitos." });
        linhaErro = true;
      }

      // Se passou nas validações, adiciona à lista para o Dev 2 cruzar
      if (!linhaErro) {
        dadosHigienizados.push({
          linhaPlanilha: rowNumber,
          cpf: cpfLimpo,
          cnpj: cnpjLimpo,
          matricula: matriculaStr,
          codigoVerba: codigoVerbaStr,
          dataAdmissao: dataAdmissaoFormatada
        });
      }
    });

    // 3. Execução da Auditoria do Dev 2 (Cruzando dados)
    const errosCruzamento = executarAuditoria(dadosHigienizados, mockFuncionariosRH, mockDeParaVerbas);

    // 4. Criação do resumo de prompt para a IA Maya
    const promptParaMaya = gerarResumoParaMaya(errosCruzamento);

    // 5. Pintura das células na planilha física caso haja erros
    const todosOsErros = [
      ...errosEstruturais.map(e => ({ ...e, categoria: "erro_estrutural" })),
      ...errosCruzamento.map(e => ({ ...e, categoria: e.categoria }))
    ];

    if (todosOsErros.length > 0) {
      todosOsErros.forEach(erro => {
        const row = worksheet.getRow(erro.linha);
        const cell = row.getCell(erro.coluna);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF0000" } // Pintura vermelha estrita (FF0000)
        };
        cell.note = erro.mensagem; // Adiciona comentário de balão na célula explicativa
      });

      // Grava novamente as mudanças estruturais no buffer
      await workbook.xlsx.writeBuffer();
    }

    // 6. Retorno bem-sucedido e estruturado para o frontend
    return NextResponse.json({
      sucesso: todosOsErros.length === 0,
      errosEstruturais,
      errosCruzamento,
      promptParaMaya
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro interno no processamento:", error);
    return NextResponse.json({ 
      sucesso: false, 
      erro: "Ocorreu um erro ao processar o arquivo. Certifique-se de que o arquivo enviado é uma planilha válida." 
    }, { status: 500 });
  }
}