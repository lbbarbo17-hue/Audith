import { NextResponse } from "next/server";


let arquivoGerado: Buffer | null = null;



export function salvarArquivo(
    arquivo: Buffer
){

    arquivoGerado = arquivo;

}



export async function GET(){

    if(!arquivoGerado){

        return NextResponse.json(
            {
                erro:
                "Nenhum arquivo disponível para download."
            },
            {
                status:404
            }
        );

    }



    return new NextResponse(
        new Uint8Array(arquivoGerado),
        {

            status:200,

            headers:{

                "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",


                "Content-Disposition":
                'attachment; filename="holerite_auditado.xlsx"'

            }

        }
    );

}