// frontend/app/api/audit/tipos.ts


export interface HoleriteLinha {

    linhaPlanilha: number;

    cpf: string;

    cnpj: string;

    dataAdmissao: string;

    matricula: string;

    codigoVerba: string;

}



export interface FuncionarioRelatorio {

    cnpjRegistro: string;

    matricula: string;

    cpf: string;

    dataAdmissao: string;

}



export interface DeParaVerba {

    codigoCliente: string;

    codigoWfp: string;

}



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

    campo:string;

    valorEncontrado:string;

    valorEsperado?:string;

    mensagem:string;

    categoria:
    | "cpf_invalido"
    | "cpf_nao_encontrado"
    | "cnpj_invalido"
    | "cnpj_divergente"
    | "data_invalida"
    | "admissao_divergente"
    | "matricula_divergente"
    | "campo_obrigatorio"
    | "verba_nao_cadastrada"
    | "duplicidade_depara";


    sugestao?:string;

}




export interface ResultadoAuditoria {

    totalAnalises: number;

    erros: ErroAuditoria[];

}