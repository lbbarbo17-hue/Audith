import ExcelJS from "exceljs";
import { HoleriteLinha, FuncionarioRelatorio, DeParaVerba } from "./tipos";
import { normalizarCPF, normalizarCNPJ, normalizarMatricula, normalizarCodigoVerba, normalizarData } from "./utils";

function valorCelula(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return valor.toISOString().split('T')[0];
  if (typeof valor === "object" && "text" in valor) return String((valor as { text: unknown }).text).trim();
  return String(valor).trim();
}

function mapearCabecalhos(row: ExcelJS.Row): Record<string, number> {
  const mapa: Record<string, number> = {};
  row.eachCell((cell, colNumber) => {
    const nome = String(cell.value || "").toUpperCase().trim();
    mapa[nome] = colNumber;
  });
  return mapa;
}

export async function lerHolerite(file: File): Promise<HoleriteLinha[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  
  await workbook.xlsx.load(arrayBuffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) throw new Error("Planilha Holerite não encontrada.");

  const dados: HoleriteLinha[] = [];
  let mapaColunas: Record<string, number> = {};

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      mapaColunas = mapearCabecalhos(row);
      return;
    }

    const colCpf = mapaColunas["CPF"] || 1;
    const colCnpj = mapaColunas["CNPJ"] || 2;
    const colData = mapaColunas["DATA ADMISSÃO"] || mapaColunas["DATA_ADMISSAO"] || mapaColunas["ADMISSAO"] || 4;
    const colMatricula = mapaColunas["MATRÍCULA"] || mapaColunas["MATRICULA"] || 5;
    const colTipoFolha = mapaColunas["TIPO DE FOLHA"] || mapaColunas["TIPO_FOLHA"] || mapaColunas["TIPO DE CALCULO"] || 6;
    const colCodVerba = mapaColunas["CÓDIGO VERBA"] || mapaColunas["CODIGO VERBA"] || mapaColunas["VERBA"] || 12;
    const colDescVerba = mapaColunas["DESCRIÇÃO VERBA"] || mapaColunas["DESCRICAO VERBA"] || 13;
    const colNatVerba = mapaColunas["NATUREZA VERBA"] || mapaColunas["NATUREZA_VERBA"] || 14;
    const colPctVerba = mapaColunas["PERCENTUAL VERBA"] || mapaColunas["PERCENTUAL_VERBA"] || 15;
    const colQtdRef = mapaColunas["QUANTIDADE REFERÊNCIA"] || mapaColunas["QUANTIDADE REFERENCIA"] || mapaColunas["REFERENCIA"] || 16;
    const colValorVerba = mapaColunas["VALOR VERBA"] || mapaColunas["VALOR_VERBA"] || mapaColunas["VALOR"] || 17;
    const colInss = mapaColunas["INCIDÊNCIA INSS"] || mapaColunas["INCIDENCIA INSS"] || mapaColunas["INSS"] || 18;
    const colIrrf = mapaColunas["INCIDÊNCIA IRRF"] || mapaColunas["INCIDENCIA IRRF"] || mapaColunas["IRRF"] || 19;
    const colFgts = mapaColunas["INCIDÊNCIA FGTS"] || mapaColunas["INCIDENCIA FGTS"] || mapaColunas["FGTS"] || 20;

    const cpfRaw = valorCelula(row.getCell(colCpf).value);
    const cnpjRaw = valorCelula(row.getCell(colCnpj).value);

    if (!cpfRaw && !cnpjRaw) return;

    dados.push({
      linhaPlanilha: rowNumber,
      cpf: normalizarCPF(cpfRaw),
      cnpj: normalizarCNPJ(cnpjRaw),
      dataAdmissao: normalizarData(valorCelula(row.getCell(colData).value)),
      matricula: normalizarMatricula(valorCelula(row.getCell(colMatricula).value)),
      tipoFolha: valorCelula(row.getCell(colTipoFolha).value),
      codigoVerba: normalizarCodigoVerba(valorCelula(row.getCell(colCodVerba).value)),
      descricaoVerba: valorCelula(row.getCell(colDescVerba).value),
      naturezaVerba: valorCelula(row.getCell(colNatVerba).value),
      percentualVerba: valorCelula(row.getCell(colPctVerba).value),
      quantidadeReferencia: valorCelula(row.getCell(colQtdRef).value),
      valorVerba: valorCelula(row.getCell(colValorVerba).value),
      incidenciaInss: valorCelula(row.getCell(colInss).value),
      incidenciaFgts: valorCelula(row.getCell(colFgts).value),
      incidenciaIrrf: valorCelula(row.getCell(colIrrf).value)
    });
  });

  return dados;
}

export async function lerRelatorio(file: File): Promise<FuncionarioRelatorio[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) throw new Error("Relatório não encontrado.");

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
    if (!cpfRaw) return;

    dados.push({
      cnpjRegistro: normalizarCNPJ(valorCelula(row.getCell(colCnpj).value)),
      matricula: normalizarMatricula(valorCelula(row.getCell(colMatricula).value)),
      cpf: normalizarCPF(cpfRaw),
      dataAdmissao: normalizarData(valorCelula(row.getCell(colData).value))
    });
  });

  return dados;
}

export async function lerDePara(file: File): Promise<DeParaVerba[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) throw new Error("De-Para não encontrado.");

  const dados: DeParaVerba[] = [];
  let mapaColunas: Record<string, number> = {};

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      mapaColunas = mapearCabecalhos(row);
      return;
    }

    const colCliente = mapaColunas["CÓDIGO CLIENTE"] || mapaColunas["CODIGO CLIENTE"] || mapaColunas["CODIGO"] || 1;
    const codClienteRaw = valorCelula(row.getCell(colCliente).value);
    if (!codClienteRaw) return;

    dados.push({
      codigoCliente: normalizarCodigoVerba(codClienteRaw)
    });
  });

  return dados;
}