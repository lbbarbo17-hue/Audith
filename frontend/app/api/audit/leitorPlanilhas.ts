import ExcelJS from "exceljs";

import {
  HoleriteLinha,
  FuncionarioRelatorio,
  DeParaVerba
} from "./tipos";

import {
  normalizarCPF,
  normalizarCNPJ,
  normalizarMatricula,
  normalizarCodigoVerba,
  normalizarData
} from "./utils";

function valorCelula(valor: any): string {
  if (valor === null || valor === undefined) {
    return "";
  }
  if (valor instanceof Date) {
    // Retorna no formato YYYY-MM-DD para simplificar normalizações de data
    return valor.toISOString().split('T')[0];
  }
  if (typeof valor === "object" && "text" in valor) {
    return String(valor.text).trim();
  }
  return String(valor).trim();
}

// Auxiliar dinâmico para encontrar os índices reais das colunas pelos nomes
function mapearCabecalhos(row: ExcelJS.Row): Record<string, number> {
  const mapa: Record<string, number> = {};
  row.eachCell((cell, colNumber) => {
    const nome = String(cell.value || "").toUpperCase().trim();
    mapa[nome] = colNumber;
  });
  return mapa;
}

/*
=========================
HOLERITE
=========================
*/
export async function lerHolerite(file: File): Promise<HoleriteLinha[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("Planilha Holerite não encontrada.");
  }

  const dados: HoleriteLinha[] = [];
  let mapaColunas: Record<string, number> = {};

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      mapaColunas = mapearCabecalhos(row);
      return;
    }

    // Identificar dinamicamente as colunas comuns ou mapear por fallback se não achar o nome
    const colCpf = mapaColunas["CPF"] || 1;
    const colCnpj = mapaColunas["CNPJ"] || 2;
    const colData = mapaColunas["DATA ADMISSÃO"] || mapaColunas["DATA_ADMISSAO"] || mapaColunas["ADMISSAO"] || 4;
    const colMatricula = mapaColunas["MATRÍCULA"] || mapaColunas["MATRICULA"] || 5;
    const colVerba = mapaColunas["CÓDIGO VERBA"] || mapaColunas["CODIGO VERBA"] || mapaColunas["VERBA"] || 12;

    const cpfRaw = valorCelula(row.getCell(colCpf).value);
    const cnpjRaw = valorCelula(row.getCell(colCnpj).value);

    // Evita processar linhas fantasmas que o Excel deixa em branco no fim do arquivo
    if (!cpfRaw && !cnpjRaw) return;

    const linha: HoleriteLinha = {
      linhaPlanilha: rowNumber,
      cpf: normalizarCPF(cpfRaw),
      cnpj: normalizarCNPJ(cnpjRaw),
      dataAdmissao: normalizarData(valorCelula(row.getCell(colData).value)),
      matricula: normalizarMatricula(valorCelula(row.getCell(colMatricula).value)),
      codigoVerba: normalizarCodigoVerba(valorCelula(row.getCell(colVerba).value))
    };

    dados.push(linha);
  });

  return dados;
}

/*
=========================
RELATÓRIO (BASE CADASTRAL)
=========================
*/
export async function lerRelatorio(file: File): Promise<FuncionarioRelatorio[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("Relatório não encontrado.");
  }

  const dados: FuncionarioRelatorio[] = [];
  let mapaColunas: Record<string, number> = {};

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      mapaColunas = mapearCabecalhos(row);
      return;
    }

    const colCnpj = mapaColunas["CNPJ CADASTRAL"] || mapaColunas["CNPJ REGISTRO"] || mapaColunas["CNPJ"] || 1;
    const colMatricula = mapaColunas["MATRÍCULA"] || mapaColunas["MATRICULA"] || 3;
    const colCpf = mapaColunas["CPF"] || 5;
    const colData = mapaColunas["DATA ADMISSÃO"] || mapaColunas["DATA_ADMISSAO"] || mapaColunas["ADMISSAO"] || 6;

    const cpfRaw = valorCelula(row.getCell(colCpf).value);
    if (!cpfRaw) return; // Ignora se a linha estiver completamente em branco

    dados.push({
      cnpjRegistro: normalizarCNPJ(valorCelula(row.getCell(colCnpj).value)),
      matricula: normalizarMatricula(valorCelula(row.getCell(colMatricula).value)),
      cpf: normalizarCPF(cpfRaw),
      dataAdmissao: normalizarData(valorCelula(row.getCell(colData).value))
    });
  });

  return dados;
}

/*
=========================
DE PARA
=========================
*/
export async function lerDePara(file: File): Promise<DeParaVerba[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("De-Para não encontrado.");
  }

  const dados: DeParaVerba[] = [];
  let mapaColunas: Record<string, number> = {};

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      mapaColunas = mapearCabecalhos(row);
      return;
    }

    const colCliente = mapaColunas["CÓDIGO CLIENTE"] || mapaColunas["CODIGO CLIENTE"] || mapaColunas["CODIGO"] || 1;
    const colWfp = mapaColunas["CÓDIGO WFP"] || mapaColunas["CODIGO WFP"] || mapaColunas["WFP"] || 4;

    const codClienteRaw = valorCelula(row.getCell(colCliente).value);
    if (!codClienteRaw) return;

    dados.push({
      codigoCliente: normalizarCodigoVerba(codClienteRaw),
      codigoWfp: valorCelula(row.getCell(colWfp).value)
    });
  });

  return dados;
}