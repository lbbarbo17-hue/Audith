// app/api/audit/excel.ts

import ExcelJS from "exceljs";
import { ErroAuditoria } from "./tipos";

export async function gerarPlanilhaSaida(
    workbook: ExcelJS.Workbook,
    erros: ErroAuditoria[]
): Promise<ExcelJS.Workbook> {

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
        throw new Error("Planilha do Holerite não encontrada.");
    }

    for (const erro of erros) {

        const linha = worksheet.getRow(erro.linha);

        const celula = linha.getCell(erro.coluna);

        // Fundo vermelho
        celula.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FFFF0000"
            }
        };

        // Letra branca
        celula.font = {
            ...(celula.font ?? {}),
            bold: true,
            color: {
                argb: "FFFFFFFF"
            }
        };

        // Borda vermelha
        celula.border = {

            top: {
                style: "thin",
                color: { argb: "FFFF0000" }
            },

            left: {
                style: "thin",
                color: { argb: "FFFF0000" }
            },

            bottom: {
                style: "thin",
                color: { argb: "FFFF0000" }
            },

            right: {
                style: "thin",
                color: { argb: "FFFF0000" }
            }

        };

        // Comentário da célula
        celula.note = `${erro.mensagem}

Campo: ${erro.campo}

Valor encontrado: ${erro.valorEncontrado}

${erro.valorEsperado
            ? `Valor esperado: ${erro.valorEsperado}`
            : ""}`;

    }

    return workbook;

}