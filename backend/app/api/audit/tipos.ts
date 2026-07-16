// app/api/audit/tipos.ts


export type CategoriaErro =

    | "cpf_invalido"
    | "cpf_nao_encontrado"
    | "cnpj_invalido"
    | "cnpj_divergente"
    | "data_invalida"
    | "admissao_divergente"
    | "matricula_divergente"
    | "campo_obrigatorio"
    | "verba_nao_cadastrada"
    | "duplicidade_depara"
    | "ficha_registro_suspeita";



export interface ErroAuditoria {


    linha:number;


    coluna:string;


    mensagem:string;


    categoria:
    CategoriaErro;



    sugestao?:string;


}



export interface ResultadoAuditoria {


    totalAnalises:number;


    erros:
    ErroAuditoria[];


}