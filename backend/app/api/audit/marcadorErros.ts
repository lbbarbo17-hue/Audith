// app/api/audit/marcadorErros.ts

import ExcelJS from "exceljs";
import { ErroAuditoria } from "./tipos";
import { obterCorErro } from "./cores";


export async function marcarErros(
    planilha: ExcelJS.Worksheet,
    erros: ErroAuditoria[]
){


    for(const erro of erros){


        const celula =
            planilha.getCell(
                erro.linha,
                erro.coluna
            );



        // pinta a célula

        celula.fill = {

            type:"pattern",

            pattern:"solid",

            fgColor:{
                argb:
                obterCorErro(
                    erro.categoria
                )
            }

        };



        // adiciona comentário

        celula.note =
        `
Erro encontrado:

${erro.mensagem}


Sugestão da IA Maya:

${erro.sugestao ?? 
"Verificar o cadastro."
}
        `;


    }


}