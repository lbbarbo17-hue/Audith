import ExcelJS from "exceljs";
import { ErroAuditoria } from "./tipos";


function converterColunaParaNumero(coluna:string){

    let numero = 0;

    for(let i = 0; i < coluna.length; i++){

        numero =
        numero * 26 +
        coluna.charCodeAt(i) -
        64;

    }

    return numero;

}



export async function marcarErros(
    planilha: ExcelJS.Worksheet,
    erros: ErroAuditoria[]
){

    for(const erro of erros){


        const linha =
        Number(erro.linha);


        const coluna =
        converterColunaParaNumero(
            erro.coluna
        );


        if(
            !linha ||
            !coluna
        ){
            continue;
        }


        const celula =
        planilha.getCell(
            linha,
            coluna
        );


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
`
Erro:
${erro.mensagem}

Campo:
${erro.campo}

Valor:
${erro.valorEncontrado}
`;

    }

}