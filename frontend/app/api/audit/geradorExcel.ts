import ExcelJS from "exceljs";
import { ErroAuditoria } from "./tipos";

export async function gerarExcelResultado(
  bufferOriginal: ArrayBuffer, 
  dadosAuditoria: { totalAnalises: number; erros: ErroAuditoria[] }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  await workbook.xlsx.load(bufferOriginal as ExcelJS.Buffer);
  const sheet = workbook.getWorksheet(1);

  if (!sheet) {
    throw new Error("Não foi possível carregar a primeira aba da planilha.");
  }

  const layoutCores: Record<string, string> = {
    "A1": "FFE5CC", "B1": "FFE5CC", "D1": "FFE5CC",
    "C1": "DDEBF7",
    "E1": "FFF2CC", "F1": "FFF2CC",
    "G1": "E2EFDA", "H1": "E2EFDA", "I1": "E2EFDA", "J1": "E2EFDA", "K1": "E2EFDA",
    "L1": "E2EFDA", "M1": "E2EFDA", "N1": "E2EFDA", "O1": "E2EFDA", "P1": "E2EFDA",
    "Q1": "E2EFDA", "R1": "E2EFDA", "S1": "E2EFDA", "T1": "E2EFDA"
  };

  const bordaSuave = {
    left: { style: 'thin' as const, color: { argb: 'E0E0E0' } },
    right: { style: 'thin' as const, color: { argb: 'E0E0E0' } },
    top: { style: 'thin' as const, color: { argb: 'E0E0E0' } },
    bottom: { style: 'thin' as const, color: { argb: 'E0E0E0' } }
  };

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 20; 
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: "Arial", size: 10, color: { argb: "212121" } };
        cell.border = bordaSuave;
        cell.fill = { type: 'pattern', pattern: 'none' };
      });
    }
  });

  sheet.getRow(1).height = 26;
  Object.entries(layoutCores).forEach(([celula, corHex]) => {
    const cell = sheet.getCell(celula);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid' as const,
      fgColor: { argb: corHex }
    };
    cell.font = { bold: true, color: { argb: "37474F" }, name: "Arial", size: 10 };
    cell.alignment = { horizontal: "center" as const, vertical: "middle" as const };
    cell.border = bordaSuave;
  });

  const mapearNomeParaLetra: Record<string, string> = {
    "CPF": "A", "CNPJ": "B", "CNPJ Tomador": "C", "Data Admissão": "D",
    "Matrícula": "E", "Tipo de Folha": "F", "Código Verba": "L",
    "Natureza Verba": "N", "Percentual Verba": "O", "Quantidade Referência": "P",
    "Valor Verba": "Q", "Incidência INSS": "R", "Incidência IRRF": "S", "Incidência FGTS": "T"
  };

  dadosAuditoria.erros.forEach(erro => {
    let letraColuna = erro.coluna;
    if (!letraColuna && erro.campo) {
      letraColuna = mapearNomeParaLetra[erro.campo];
    }

    if (letraColuna && /^[A-T]$/.test(letraColuna.toUpperCase()) && erro.linha) {
      const enderecoCelula = `${letraColuna.toUpperCase()}${erro.linha}`;
      const cell = sheet.getCell(enderecoCelula);

      const corFundo = erro.statusVisual === 'AMARELO' ? 'FFFDE7' : 'FFEBEE';
      const corTexto = erro.statusVisual === 'AMARELO' ? 'F57F17' : 'C62828';

      cell.fill = {
        type: 'pattern',
        pattern: 'solid' as const,
        fgColor: { argb: corFundo }
      };
      cell.font = {
        color: { argb: corTexto },
        bold: true,
        name: "Arial",
        size: 10
      };
      cell.border = bordaSuave;
    }
  });

  const resultadoBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(resultadoBuffer);
}