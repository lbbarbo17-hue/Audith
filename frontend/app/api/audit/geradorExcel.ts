import ExcelJS from "exceljs";

import {
    ResultadoAuditoria
} from "./tipos";

import {
    marcarErros
} from "./marcadorErros";



export async function gerarExcelResultado(

    arquivoOriginal:ArrayBuffer,

    resultado:ResultadoAuditoria

):Promise<Buffer>{



const workbook =
new ExcelJS.Workbook();



await workbook.xlsx.load(
    arquivoOriginal
);



const planilha =
workbook.worksheets[0];



await marcarErros(
    planilha,
    resultado.erros
);



const buffer =
await workbook.xlsx.writeBuffer();



return Buffer.from(buffer);


}