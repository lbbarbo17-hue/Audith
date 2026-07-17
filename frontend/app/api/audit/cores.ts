// app/api/audit/cores.ts

import { ErroAuditoria } from "./tipos";

export function obterCorErro(
    categoria: ErroAuditoria["categoria"]
): string {

    switch (categoria) {

        case "cpf_invalido":
            return "FFFF0000";

        case "cpf_nao_encontrado":
            return "FFFF4D4D";

        case "cnpj_invalido":
            return "FFFF0000";

        case "cnpj_divergente":
            return "FFFFA500";

        case "data_invalida":
            return "FFFFC000";

        case "admissao_divergente":
            return "FFFFFF00";

        case "matricula_divergente":
            return "FFFF8C00";

        case "campo_obrigatorio":
            return "FFB22222";

        case "verba_nao_cadastrada":
            return "FFFF1493";

        case "duplicidade_depara":
            return "FF8B0000";

        default:
            return "FFFF0000";

    }

}