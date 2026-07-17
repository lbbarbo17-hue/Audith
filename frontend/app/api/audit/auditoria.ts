import {
    HoleriteLinha,
    FuncionarioRelatorio,
    DeParaVerba,
    ErroAuditoria
} from "./tipos";

import {
    campoObrigatorio,
    validarCPF,
    validarCNPJ,
    validarData
} from "./validadores";


function adicionarErro(
    erros: ErroAuditoria[],
    linha:number,
    coluna:string,
    campo:string,
    valorEncontrado:string,
    mensagem:string,
    categoria:ErroAuditoria["categoria"],
    valorEsperado?:string
){

    erros.push({
        linha,
        coluna,
        campo,
        valorEncontrado,
        valorEsperado,
        mensagem,
        categoria
    });

}



export function executarAuditoria(

    holerites:HoleriteLinha[],
    funcionarios:FuncionarioRelatorio[],
    dePara:DeParaVerba[]

):ErroAuditoria[]{


const erros:ErroAuditoria[] = [];


// CPF + CNPJ é a chave correta

const funcionariosMap =
new Map<string,FuncionarioRelatorio>();


funcionarios.forEach(f=>{

    const cpf =
    f.cpf.replace(/\D/g,"");


    const cnpj =
    f.cnpjRegistro.replace(/\D/g,"");


    const chave =
    `${cpf}-${cnpj}`;


    funcionariosMap.set(
        chave,
        {
            ...f,
            cpf,
            cnpjRegistro:cnpj
        }
    );


});


// DePara

const verbas =
new Set<string>();


dePara.forEach(v=>{

    verbas.add(
        v.codigoCliente
    );

});



// Evita repetir erro do mesmo funcionário

const funcionariosProcessados =
new Set<string>();



for(const holerite of holerites){



const chaveFuncionario =
`${holerite.cpf.replace(/\D/g,"")}-${holerite.cnpj.replace(/\D/g,"")}`;



// valida CPF somente uma vez

if(!funcionariosProcessados.has(chaveFuncionario)){


    funcionariosProcessados.add(
        chaveFuncionario
    );



    if(!validarCPF(holerite.cpf)){

        adicionarErro(
            erros,
            holerite.linhaPlanilha,
            "A",
            "CPF",
            holerite.cpf,
            "CPF inválido",
            "cpf_invalido"
        );

    }



    if(!validarCNPJ(holerite.cnpj)){


        adicionarErro(
            erros,
            holerite.linhaPlanilha,
            "B",
            "CNPJ",
            holerite.cnpj,
            "CNPJ inválido",
            "cnpj_invalido"
        );

    }



    const funcionario =
    funcionariosMap.get(
        chaveFuncionario
    );



    if(!funcionario){


        adicionarErro(
            erros,
            holerite.linhaPlanilha,
            "A",
            "CPF",
            holerite.cpf,
            "Funcionário não encontrado para este CNPJ",
            "cpf_nao_encontrado"
        );


    }
    else{


        if(
            holerite.matricula !==
            funcionario.matricula
        ){

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "E",
                "Matrícula",
                holerite.matricula,
                "Matrícula divergente",
                "matricula_divergente",
                funcionario.matricula
            );

        }



        if(
            holerite.dataAdmissao !==
            funcionario.dataAdmissao
        ){

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "D",
                "Data Admissão",
                holerite.dataAdmissao,
                "Data de admissão divergente",
                "admissao_divergente",
                funcionario.dataAdmissao
            );

        }

    }


}




// DePara

    // DePara

    if(
        !verbas.has(
            holerite.codigoVerba
        )
    ){

        adicionarErro(
            erros,
            holerite.linhaPlanilha,
            "L",
            "Código Verba",
            holerite.codigoVerba,
            "Código não encontrado no De-Para",
            "verba_nao_cadastrada"
        );

    }


} // fecha o for

console.log(
    "ERROS GERADOS:",
    erros
);

return erros;


} // fecha a função executarAuditoria