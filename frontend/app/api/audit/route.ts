// frontend/app/api/audit/route.ts

import { NextRequest, NextResponse } from "next/server";

import {
    lerHolerite,
    lerRelatorio,
    lerDePara
} from "./leitorPlanilhas";

import {
    executarAuditoria
} from "./auditoria";

import {
    gerarResumo
} from "./resumo";

import {
    gerarExcelResultado
} from "./geradorExcel";



export async function POST(
    request: NextRequest
) {

    try {


        const formData =
            await request.formData();



        const holerite =
            formData.get("holerite") as File;


        const depara =
            formData.get("depara") as File;


        const relatorio =
            formData.get("relatorio") as File;



        if (
            !holerite ||
            !depara ||
            !relatorio
        ) {

            return NextResponse.json(
                {
                    erro:
                    "Envie os três arquivos."
                },
                {
                    status:400
                }
            );

        }



        /*
            LEITURA DAS PLANILHAS
        */


        const dadosHolerite =
            await lerHolerite(
                holerite
            );


        const dadosRelatorio =
            await lerRelatorio(
                relatorio
            );


        const dadosDePara =
            await lerDePara(
                depara
            );




        /*
            EXECUTA AUDITORIA
        */


        const erros =
            executarAuditoria(
                dadosHolerite,
                dadosRelatorio,
                dadosDePara
            );




        /*
            GERA RESUMO PARA GEMINI / N8N
        */


        const resumo =
            gerarResumo(
                erros
            );




        /*
            GERA PLANILHA FINAL
            COM ERROS DESTACADOS
        */


        const arquivoOriginal =
            await holerite.arrayBuffer();



        const arquivoFinal =
            await gerarExcelResultado(
                arquivoOriginal,
                {
                    totalAnalises:
                    dadosHolerite.length,

                    erros
                }
            );




        /*
            CONVERTE EXCEL PARA BASE64
            PARA O FRONTEND BAIXAR
        */


        const arquivoBase64 =
            Buffer.from(
                arquivoFinal
            ).toString(
                "base64"
            );





        /*
            RETORNO FINAL
        */


        return NextResponse.json({

            success:true,


            totalAnalises:
            dadosHolerite.length,


            errosCount:
            erros.length,


            erros,



            geminiPayload:
            resumo,



            arquivo:
            arquivoBase64

        });


    }
    catch(error){


        console.error(
            "Erro na auditoria:",
            error
        );



        return NextResponse.json(
            {
                erro:
                "Erro ao executar auditoria."
            },
            {
                status:500
            }
        );


    }

}