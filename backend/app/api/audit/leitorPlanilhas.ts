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

export async function lerHolerite(file: File): Promise<HoleriteLinha[]> {

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("Planilha Holerite não encontrada.");
  }

  const dados: HoleriteLinha[] = [];

  sheet.eachRow((row, rowNumber) => {

    if (rowNumber === 1) return;

    dados.push({

      linhaPlanilha: rowNumber,

      cpf: normalizarCPF(String(row.getCell(1).value ?? "")),

      cnpj: normalizarCNPJ(String(row.getCell(2).value ?? "")),

      dataAdmissao: normalizarData(row.getCell(4).value),

      matricula: normalizarMatricula(String(row.getCell(5).value ?? "")),

      codigoVerba: normalizarCodigoVerba(String(row.getCell(12).value ?? ""))

    });

  });

  return dados;

}

export async function lerRelatorio(file: File): Promise<FuncionarioRelatorio[]> {

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("Relatório não encontrado.");
  }

  const dados: FuncionarioRelatorio[] = [];

  sheet.eachRow((row, rowNumber) => {

    if (rowNumber === 1) return;

    dados.push({

      cnpjRegistro: normalizarCNPJ(String(row.getCell(1).value ?? "")),

      matricula: normalizarMatricula(String(row.getCell(3).value ?? "")),

      cpf: normalizarCPF(String(row.getCell(5).value ?? "")),

      dataAdmissao: normalizarData(row.getCell(6).value)

    });

  });

  return dados;

}

export async function lerDePara(file: File): Promise<DeParaVerba[]> {

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("De-Para não encontrado.");
  }

  const dados: DeParaVerba[] = [];

  sheet.eachRow((row, rowNumber) => {

    if (rowNumber === 1) return;

    dados.push({

      codigoCliente: normalizarCodigoVerba(
        String(row.getCell(1).value ?? "")
      ),

      codigoWfp: String(row.getCell(4).value ?? "").trim()

    });

  });

  return dados;

}