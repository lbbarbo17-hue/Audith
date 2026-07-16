// app/api/audit/download.ts

import { NextResponse } from "next/server";


export function criarDownloadExcel(
    arquivo: Buffer,
    nomeArquivo:string = "holerite_auditado.xlsx"
){

    return new NextResponse(
        arquivo,
        {

            status:200,

            headers:{

                "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",


                "Content-Disposition":
                `attachment; filename="${nomeArquivo}"`

            }

        }
    );

}