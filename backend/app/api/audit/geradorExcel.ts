// app/api/audit/geradorExcel.ts

import ExcelJS from "exceljs";
import { ResultadoAuditoria } from "./tipos";
import { marcarErros } from "./marcadorErros";


export async function gerarExcelResultado(
    arquivoOriginal: Buffer,
    resultado: ResultadoAuditoria
): Promise<Buffer> {


    const workbook = new ExcelJS.Workbook();


    // Carrega a planilha original
    await workbook.xlsx.load(arquivoOriginal);



    /*
        Aqui criamos uma cópia do arquivo.

        A planilha original permanece intacta.
        O usuário recebe uma nova versão com os erros destacados.
    */


    const novaPlanilha = workbook.worksheets[0];



    // Aplica os erros encontrados
    await marcarErros(
        novaPlanilha,
        resultado.erros
    );



    // Remove abas de relatório antigas
    const abaErros =
        workbook.getWorksheet("Erros");


    if(abaErros){

        workbook.removeWorksheet(
            abaErros.id
        );

    }



    // Gera o arquivo final

    const buffer =
        await workbook.xlsx.writeBuffer();



    return Buffer.from(buffer);

}