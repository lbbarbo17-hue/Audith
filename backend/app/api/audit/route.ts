// app/api/audit/route.ts

import { NextRequest, NextResponse } from "next/server";

import { lerPlanilha } from "./leitorPlanilhas";
import { executarAuditoria } from "./auditoria";
import { gerarExcelResultado } from "./geradorExcel";
import { gerarResumo } from "./resumo";


export async function POST(
    request: NextRequest
) {

    try {


        const formData = await request.formData();


        const holerite =
            formData.get("holerite") as File;


        const depara =
            formData.get("depara") as File;


        const relatorio =
            formData.get("relatorio") as File;



        if(!holerite || !depara || !relatorio){

            return NextResponse.json(
                {
                    erro:
                    "Todos os arquivos são obrigatórios."
                },
                {
                    status:400
                }
            );

        }



        const bufferHolerite =
            Buffer.from(
                await holerite.arrayBuffer()
            );



        /*
            Lê o holerite principal
        */

        const dados =
            await lerPlanilha(
                bufferHolerite
            );



        /*
            Executa regras de auditoria
        */

        const resultado =
            await executarAuditoria(
                dados
            );



        /*
            Gera o Excel final
        */

        const planilhaFinal =
            await gerarExcelResultado(
                bufferHolerite,
                resultado
            );



        const resumo =
            gerarResumo(
                resultado
            );



        /*
            Aqui temporariamente vamos retornar
            somente os dados para a tela.

            Depois criaremos a rota de download.
        */


        return NextResponse.json({

            success:true,


            totalAnalises:
            resultado.totalAnalises,


            errosCount:
            resultado.erros.length,


            erros:
            resultado.erros,


            mayaPayload: resumo

        });



    } catch(error){


        console.error(
            "Erro na auditoria:",
            error
        );


        return NextResponse.json(
            {
                erro:
                "Erro interno ao processar auditoria."
            },
            {
                status:500
            }
        );

    }

}