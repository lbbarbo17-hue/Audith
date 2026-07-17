import ExcelJS from "exceljs";
import { ErroAuditoria } from "./tipos";


function colunaNumero(coluna: string): number {

    let numero = 0;

    for (const letra of coluna.toUpperCase()) {

        numero =
            numero * 26 +
            letra.charCodeAt(0) - 64;

    }

    return numero;

}



export async function marcarErros(

    planilha: ExcelJS.Worksheet,

    erros: ErroAuditoria[]

) {


    for (const erro of erros) {


        const linha =
            Number(erro.linha);


        const coluna =
            colunaNumero(erro.coluna);



        if (
            linha <= 1 ||
            coluna <= 0
        ) {
            continue;
        }



        const celula =
            planilha
                .getRow(linha)
                .getCell(coluna);



        // remove qualquer estilo de preenchimento herdado

        celula.fill = {
            type: "pattern",
            pattern: "none"
        };



        // aplica vermelho APENAS nessa célula
        console.log(
            "PINTANDO CÉLULA:",
            celula.address
        );

        celula.fill = {

            type: "pattern",

            pattern: "solid",

            fgColor: {
                argb: "FFFF0000"
            }

        };



        celula.font = {

            name: "Calibri",

            size: 11,

            bold: true,

            color: {
                argb: "FFFFFFFF"
            }

        };


        celula.alignment = {

            vertical: "middle",

            horizontal: "center"

        };


        celula.note =
            `
Campo: ${erro.campo}

Erro:
${erro.mensagem}

Valor:
${erro.valorEncontrado}
        `;


    }

}