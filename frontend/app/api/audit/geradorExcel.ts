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



    const workbookOriginal =
        new ExcelJS.Workbook();


    await workbookOriginal.xlsx.load(
        arquivoOriginal
    );


    const planilhaOriginal =
        workbookOriginal.worksheets[0];



    const novoWorkbook =
        new ExcelJS.Workbook();



    const novaPlanilha =
        novoWorkbook.addWorksheet(
            planilhaOriginal.name
        );



    // copia somente valores

    planilhaOriginal.eachRow(
        (row,rowNumber)=>{


            const novaLinha =
                novaPlanilha.getRow(rowNumber);



            row.eachCell(
                (cell,colNumber)=>{


                    novaLinha
                    .getCell(colNumber)
                    .value =
                    cell.value;


                }
            );


        }
    );



    // copia largura das colunas

    planilhaOriginal.columns.forEach(
        (col,index)=>{


            novaPlanilha
            .getColumn(index+1)
            .width =
            col.width || 15;


        }
    );



    // aplica somente os erros

    await marcarErros(
        novaPlanilha,
        resultado.erros
    );



    const buffer =
        await novoWorkbook.xlsx.writeBuffer();



    return Buffer.from(buffer);

}