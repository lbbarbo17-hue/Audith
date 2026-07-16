// app/api/audit/resumo.ts

import { ErroAuditoria } from "./tipos";


export interface ResumoAuditoria {

    mensagem_prompt:string;


    dados_brutos:{

        matriculasDivergentes:number;

        fichasRegistroSuspeitas:number;

        verbasNaoEncontradas:number;

        duplicidadesDePara:number;

        totalErros:number;

    };

}



export function gerarResumo(
    erros: ErroAuditoria[]
): ResumoAuditoria {


    const matriculas =
        erros.filter(
            e => e.categoria === "matricula_divergente"
        ).length;



    const verbas =
        erros.filter(
            e => e.categoria === "verba_nao_cadastrada"
        ).length;



    const duplicidades =
        erros.filter(
            e => e.categoria === "duplicidade_depara"
        ).length;



    const fichas =
        erros.filter(
            e => e.categoria === "ficha_registro_suspeita"
        ).length;



    return {


        mensagem_prompt:

        `
        Auditoria concluída.

        Foram encontrados ${erros.length} pontos de atenção.
        Recomenda-se revisar os registros destacados
        antes do fechamento da folha.
        `,



        dados_brutos:{


            matriculasDivergentes:
            matriculas,


            fichasRegistroSuspeitas:
            fichas,


            verbasNaoEncontradas:
            verbas,


            duplicidadesDePara:
            duplicidades,


            totalErros:
            erros.length


        }

    };


}