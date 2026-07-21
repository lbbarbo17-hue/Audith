import { NextResponse } from "next/server";
import { google } from "googleapis";
import { HoleriteLinha, FuncionarioRelatorio, DeParaVerba } from "./tipos";
import { normalizarCPF, normalizarCNPJ, normalizarMatricula, normalizarCodigoVerba, normalizarData } from "./utils";
import { executarAuditoria } from "./auditoria";
import { gerarResumo } from "./resumo";

// Tratamento robusto da chave privada para evitar erros de criptografia OpenSSL
function obterChaveTratada(): string | undefined {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!rawKey) return undefined;
  
  // Remove aspas externas se existirem e converte \n em quebras de linha reais
  return rawKey.replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n");
}

// COLOQUE AS CREDENCIAIS DIRETAMENTE AQUI PARA TESTAR
const CLIENT_EMAIL = "apex-sheets@apex-503102.iam.gserviceaccount.com";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDUQp+peviquIxC\nipJDYKdq/4mP3nrAguKHaQA4KnEzivIHfU2eS4HBGs5l4Y8fT+NwYACT4zUB/AX1\nPPxRCqu+JRNANuzuh+ailZuGXp7EIknlRlh/cnkHt2/jeObvpwU/8zuwI9HrXPMZ\nDhziGbF43N7LGf0OuMPX+iCnd2Jrgm8Ineia/d4Net7YkYZ+yIPt5f45MWNPjHzI\noBZpgsw45fqYxPvDBjn+RO/BSc3B9uUqeJbzSoms/npyX9NQ8HIyIE3jiVCBky+H\nB/P56cbMlbjEuGChfgpgaWqNYfYLIVKvSlJt9CnKUeDwXANXAyZi4zZPIpjeDlSH\nD7HP1QcxAgMBAAECggEAD3ALCboKZOxIMzy9142rj4InYKHXPrImRJ/z5qHbmtqT\nsMzBvO4T8VYARfOqQ6Y9TfqFgDwJqmvIiSYW2dQTWqB6rnRwNgcHVLLZ3WN7W5t8\n0WKU5CwQtml2h05PSYXVwWlw4WYxidM4UQ2wNxeUS0yRHad1usDgaZBlGJj7vQLd\nCXn5a/wrdpbLqZIehcLmAkDBcSA3vpkC3yeTb1lNTYpAJdPH2UnwqubnBygNZor+\ndEUc5d5Mw1u9yJr04W3r5AvjQ3H5D+WKBSxgQytwn1fUODxbXWnbD40aneyuhYqZ\nt3Gz9pXKJgUu+aFnWZ/f7JH+bN96RY/dhoR9L5zvSwKBgQD8bLvU+rYRyf9ruzFS\nl40EkPv/BzB0iu1D5s8bmN3QhVc3Y2E7Rn3A8kvdziD734o1MiA+AJRaEsyss0D/\nPw6Y/DSLCrarreSz9Be811No0qPns2aVC59JWMwd2vv6IizotU5UG8rGMPzwkCyN\nT6cqxcPwkkUaLPNtILx9sEizJwKBgQDXREHzgsNNeLhQeuuY6GsRhYezT+I39JHS\n2sGrCRsbLtCnAfDqFGd/lK7uBBK+JD/lGaP8hHArl7JmeVcyJVXQZ3qHFChcmK1+\nWvrhQNdPun2yPFXs5ZaLdfnUaneTiwM5O+N7Cu5Z6jLOw6+wuvKGNe0i1aggx+x3\n70ey+fkJ5wKBgQDZG+yyUrEmu8aksmzJzO/NbaZQw645jwRj0rFv2xttrkJFsYR/\npzGiMsRuEkzsVmhZOLPioDz4/BJut/6/i0zS6JmIvb5AC2EaJmgEVG+5SPMQ5ozk\nxQpL28Q0KZVwntRhkw+75+uQa7Iidt7a7BesAk11LVmiGeeFhRKaSHU/IQKBgQDA\nh70QxVhWFu2KlZXX6a+xOSN4fa8Par9tvdfPWFKVClb1t+e4BE3ZLqsSGDSHOTao\nejlP5UfJxWB7BHW3VOsefR56Z839m1Q4mbie9HZeSaaYXhxfx6vQydCLajnOjVtx\nuh2n88vgQXX1tdGSGHJHFT4llMBNqWHWlv0ily5k6wKBgGyD+wgj4KmNQBLrhupg\nIuh1TiWU4mu+Bk5LTTACWNbroTmfQiSVtCNV4nQkc+hHvecMBtUHSKGIX+c589aV\nVWreBewJEifW41XU7inWF/f25QkxmQq0OzUYpTee/5F0Q7MkYW5aWd0CjooSEZsy\nhYM+7HB+fUt49bkZXZFKHTEn\n-----END PRIVATE KEY-----\n
`;

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL || CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || PRIVATE_KEY)
    .replace(/^"(.*)"$/, "$1")
    .replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Helper para converter qualquer valor de célula em string tratada
function valorCelula(valor: any): string {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

// Helper para ler dados brutos de uma aba
async function obterMatrizDaAba(spreadsheetId: string, nomeAba: string): Promise<string[][]> {
  try {
    const resposta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${nomeAba}!A:Z`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    return (resposta.data.values as string[][]) || [];
  } catch (error) {
    console.error(`Erro ao ler a aba '${nomeAba}':`, error);
    throw new Error(`Não foi possível acessar a aba '${nomeAba}' na planilha.`);
  }
}

// Cria um mapa dinâmico de [NOME_DA_COLUNA]: INDEX_DA_COLUNA
function mapearCabecalhosGoogle(linhaCabecalho: string[]): Record<string, number> {
  const mapa: Record<string, number> = {};
  if (!linhaCabecalho) return mapa;

  linhaCabecalho.forEach((celula, index) => {
    const nome = valorCelula(celula).toUpperCase();
    mapa[nome] = index;
  });
  return mapa;
}

// --- PARSERS INDIVIDUAIS COM AS MESMAS REGRAS DO leitorPlanilhas.ts ---

function processarHolerites(linhas: string[][]): HoleriteLinha[] {
  if (linhas.length === 0) return [];
  const mapa = mapearCabecalhosGoogle(linhas[0]);
  const dados: HoleriteLinha[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const row = linhas[i];
    const rowNumber = i + 1; // número da linha na planilha física

    const colCpf = mapa["CPF"] ?? 0;
    const colCnpj = mapa["CNPJ"] ?? 1;
    const colData = mapa["DATA ADMISSÃO"] ?? mapa["DATA_ADMISSAO"] ?? mapa["ADMISSAO"] ?? 3;
    const colMatricula = mapa["MATRÍCULA"] ?? mapa["MATRICULA"] ?? 4;
    const colTipoFolha = mapa["TIPO DE FOLHA"] ?? mapa["TIPO_FOLHA"] ?? mapa["TIPO DE CALCULO"] ?? 5;
    const colCodVerba = mapa["CÓDIGO VERBA"] ?? mapa["CODIGO VERBA"] ?? mapa["VERBA"] ?? 11;
    const colDescVerba = mapa["DESCRIÇÃO VERBA"] ?? mapa["DESCRICAO VERBA"] ?? 12;
    const colNatVerba = mapa["NATUREZA VERBA"] ?? mapa["NATUREZA_VERBA"] ?? 13;
    const colPctVerba = mapa["PERCENTUAL VERBA"] ?? mapa["PERCENTUAL_VERBA"] ?? 14;
    const colQtdRef = mapa["QUANTIDADE REFERÊNCIA"] ?? mapa["QUANTIDADE REFERENCIA"] ?? mapa["REFERENCIA"] ?? 15;
    const colValorVerba = mapa["VALOR VERBA"] ?? mapa["VALOR_VERBA"] ?? mapa["VALOR"] ?? 16;
    const colInss = mapa["INCIDÊNCIA INSS"] ?? mapa["INCIDENCIA INSS"] ?? mapa["INSS"] ?? 17;
    const colIrrf = mapa["INCIDÊNCIA IRRF"] ?? mapa["INCIDENCIA IRRF"] ?? mapa["IRRF"] ?? 18;
    const colFgts = mapa["INCIDÊNCIA FGTS"] ?? mapa["INCIDENCIA FGTS"] ?? mapa["FGTS"] ?? 19;

    const cpfRaw = valorCelula(row[colCpf]);
    const cnpjRaw = valorCelula(row[colCnpj]);

    if (!cpfRaw && !cnpjRaw) continue;

    dados.push({
      linhaPlanilha: rowNumber,
      cpf: normalizarCPF(cpfRaw),
      cnpj: normalizarCNPJ(cnpjRaw),
      dataAdmissao: normalizarData(valorCelula(row[colData])),
      matricula: normalizarMatricula(valorCelula(row[colMatricula])),
      tipoFolha: valorCelula(row[colTipoFolha]),
      codigoVerba: normalizarCodigoVerba(valorCelula(row[colCodVerba])),
      descricaoVerba: valorCelula(row[colDescVerba]),
      naturezaVerba: valorCelula(row[colNatVerba]),
      percentualVerba: valorCelula(row[colPctVerba]),
      quantidadeReferencia: valorCelula(row[colQtdRef]),
      valorVerba: valorCelula(row[colValorVerba]),
      incidenciaInss: valorCelula(row[colInss]),
      incidenciaFgts: valorCelula(row[colFgts]),
      incidenciaIrrf: valorCelula(row[colIrrf]),
    });
  }

  return dados;
}

function processarRelatorio(linhas: string[][]): FuncionarioRelatorio[] {
  if (linhas.length === 0) return [];
  const mapa = mapearCabecalhosGoogle(linhas[0]);
  const dados: FuncionarioRelatorio[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const row = linhas[i];

    const colCnpj = mapa["CNPJ CADASTRAL"] ?? mapa["CNPJ REGISTRO"] ?? mapa["CNPJ"] ?? 0;
    const colMatricula = mapa["MATRÍCULA"] ?? mapa["MATRICULA"] ?? 2;
    const colCpf = mapa["CPF"] ?? 4;
    const colData = mapa["DATA ADMISSÃO"] ?? mapa["DATA_ADMISSAO"] ?? mapa["ADMISSAO"] ?? 5;

    const cpfRaw = valorCelula(row[colCpf]);
    if (!cpfRaw) continue;

    dados.push({
      cnpjRegistro: normalizarCNPJ(valorCelula(row[colCnpj])),
      matricula: normalizarMatricula(valorCelula(row[colMatricula])),
      cpf: normalizarCPF(cpfRaw),
      dataAdmissao: normalizarData(valorCelula(row[colData])),
    });
  }

  return dados;
}

function processarDePara(linhas: string[][]): DeParaVerba[] {
  if (linhas.length === 0) return [];
  const mapa = mapearCabecalhosGoogle(linhas[0]);
  const dados: DeParaVerba[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const row = linhas[i];

    const colCliente = mapa["CÓDIGO CLIENTE"] ?? mapa["CODIGO CLIENTE"] ?? mapa["CODIGO"] ?? 0;
    const codClienteRaw = valorCelula(row[colCliente]);
    if (!codClienteRaw) continue;

    dados.push({
      codigoCliente: normalizarCodigoVerba(codClienteRaw),
    });
  }

  return dados;
}

// --- ROTA DE REQUISIÇÃO (POST) ---

export async function POST() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!spreadsheetId || !clientEmail || !privateKey) {
      return NextResponse.json(
        { erro: "Credenciais do Google Sheets não configuradas corretamente no .env.local" },
        { status: 400 }
      );
    }

    // 1. Busca os dados das 3 abas no Google Sheets
    const linhasHolerite = await obterMatrizDaAba(spreadsheetId, "Holerites");
    const linhasRelatorio = await obterMatrizDaAba(spreadsheetId, "Relatorio");
    const linhasDePara = await obterMatrizDaAba(spreadsheetId, "DePara");

    // 2. Transforma as matrizes nos tipos estruturados do sistema
    const dadosHolerite = processarHolerites(linhasHolerite);
    const dadosRelatorio = processarRelatorio(linhasRelatorio);
    const dadosDePara = processarDePara(linhasDePara);

    // 3. Executa a lógica da auditoria local
    const erros = executarAuditoria(
      dadosHolerite,
      dadosRelatorio,
      dadosDePara
    );

    const resumo = gerarResumo(erros);

    // 4. Integração com a IA Groq
    let insightsDaIA = "Não foi possível gerar o diagnóstico descritivo da IA.";
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;

    try {
      if (apiKey) {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "Você é um auditor sênior especialista em folha de pagamento e análise de holerites. O usuário vai te enviar um relatório estruturado de inconsistências encontradas entre sistemas. Escreva um parágrafo executivo direto, profissional e claro resumindo a gravidade dos erros e o que a equipe de RH/DP deve corrigir imediatamente. Seja sucinto e direto ao ponto.",
              },
              {
                role: "user",
                content: `Analise as seguintes inconsistências e me dê o diagnóstico executivo: ${JSON.stringify(resumo)}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          insightsDaIA = groqData.choices[0]?.message?.content || insightsDaIA;
        }
      }
    } catch (groqError) {
      console.error("Falha ao comunicar com a Groq:", groqError);
    }

    // 5. Retorno bem-sucedido
    return NextResponse.json({
      success: true,
      totalAnalises: dadosHolerite.length,
      errosCount: erros.length,
      erros,
      geminiPayload: insightsDaIA,
    });
  } catch (error: any) {
    console.error("Erro na rota de auditoria:", error);
    return NextResponse.json(
      { erro: error.message || "Erro ao executar auditoria via Google Sheets." },
      { status: 500 }
    );
  }
}