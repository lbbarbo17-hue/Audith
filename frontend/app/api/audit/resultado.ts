import { ErroAuditoria } from "./tipos";
import { gerarResumo } from "./resumo";

export interface ResultadoAuditoria {

    sucesso: boolean;

    totalRegistros: number;

    totalErros: number;

    resumo: ReturnType<typeof gerarResumo>;

    erros: ErroAuditoria[];

}

export function montarResultado(

    totalRegistros: number,

    erros: ErroAuditoria[]

): ResultadoAuditoria {

    return {

        sucesso: true,

        totalRegistros,

        totalErros: erros.length,

        resumo: gerarResumo(erros),

        erros

    };

}