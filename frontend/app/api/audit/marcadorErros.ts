import ExcelJS from "exceljs";
import { ErroAuditoria } from "./tipos";


function colunaNumero(coluna:string){

    let numero = 0;

    for(let i = 0; i < coluna.length; i++){

        numero =
        numero * 26 +
        coluna
        .toUpperCase()
        .charCodeAt(i) - 64;

    }

    return numero;

}



export async function marcarErros(

    planilha:ExcelJS.Worksheet,

    erros:ErroAuditoria[]

){


    console.log(
        "MARCAÇÃO DE ERROS:",
        erros.length
    );


    for(const erro of erros){


        const linha =
        Number(erro.linha);


        const coluna =
        colunaNumero(
            erro.coluna
        );



        console.log(
            "Pintando:",
            linha,
            coluna,
            erro.campo
        );



        const celula =
        planilha
        .getCell(
            linha,
            coluna
        );



        // cria uma cópia do estilo somente da célula

        celula.fill = {
            type:"pattern",
            pattern:"solid",
            fgColor:{
                argb:"FFFF0000"
            }
        };


        celula.font = {
            bold:true,
            color:{
                argb:"FFFFFFFF"
            }
        };


        celula.note =
        `${erro.campo}

${erro.mensagem}

Valor:
${erro.valorEncontrado}`;


    }


}