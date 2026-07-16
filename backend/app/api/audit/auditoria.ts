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
    linha: number,
    coluna: string,
    campo: string,
    valorEncontrado: string,
    mensagem: string,
    categoria: ErroAuditoria["categoria"],
    valorEsperado?: string
) {

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

    holerites: HoleriteLinha[],

    funcionarios: FuncionarioRelatorio[],

    dePara: DeParaVerba[]

): ErroAuditoria[] {

    const erros: ErroAuditoria[] = [];

    const funcionariosMap = new Map<string, FuncionarioRelatorio>();

    funcionarios.forEach(f => {

        funcionariosMap.set(f.cpf, f);

    });

    const verbasMap = new Map<string, string[]>();

    dePara.forEach(v => {

        if (!verbasMap.has(v.codigoCliente)) {

            verbasMap.set(v.codigoCliente, []);

        }

        verbasMap.get(v.codigoCliente)!.push(v.codigoWfp);

    });

    for (const holerite of holerites) {

        //----------------------------------------
        // CAMPOS OBRIGATÓRIOS
        //----------------------------------------

        if (!campoObrigatorio(holerite.cpf)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "A",
                "CPF",
                "",
                "CPF não informado.",
                "campo_obrigatorio"
            );

            continue;

        }

        if (!campoObrigatorio(holerite.cnpj)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "B",
                "CNPJ",
                "",
                "CNPJ não informado.",
                "campo_obrigatorio"
            );

        }

        if (!campoObrigatorio(holerite.dataAdmissao)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "D",
                "Data Admissão",
                "",
                "Data de admissão não informada.",
                "campo_obrigatorio"
            );

        }

        if (!campoObrigatorio(holerite.matricula)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "E",
                "Matrícula",
                "",
                "Matrícula não informada.",
                "campo_obrigatorio"
            );

        }

        if (!campoObrigatorio(holerite.codigoVerba)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "L",
                "Código Verba",
                "",
                "Código da verba não informado.",
                "campo_obrigatorio"
            );

        }

        //----------------------------------------
        // VALIDAÇÕES
        //----------------------------------------

        if (!validarCPF(holerite.cpf)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "A",
                "CPF",
                holerite.cpf,
                "CPF inválido.",
                "cpf_invalido"
            );

        }

        if (!validarCNPJ(holerite.cnpj)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "B",
                "CNPJ",
                holerite.cnpj,
                "CNPJ inválido.",
                "cnpj_invalido"
            );

        }

        if (!validarData(holerite.dataAdmissao)) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "D",
                "Data Admissão",
                holerite.dataAdmissao,
                "Data inválida.",
                "data_invalida"
            );

        }

        //----------------------------------------
        // RELATÓRIO
        //----------------------------------------

        const funcionario = funcionariosMap.get(holerite.cpf);

        if (!funcionario) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "A",
                "CPF",
                holerite.cpf,
                "Funcionário não encontrado.",
                "cpf_nao_encontrado"
            );

            continue;

        }

        if (holerite.cnpj !== funcionario.cnpjRegistro) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "B",
                "CNPJ",
                holerite.cnpj,
                "CNPJ diferente do relatório.",
                "cnpj_divergente",
                funcionario.cnpjRegistro
            );

        }

        if (holerite.matricula !== funcionario.matricula) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "E",
                "Matrícula",
                holerite.matricula,
                "Matrícula divergente.",
                "matricula_divergente",
                funcionario.matricula
            );

        }

        if (holerite.dataAdmissao !== funcionario.dataAdmissao) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "D",
                "Data Admissão",
                holerite.dataAdmissao,
                "Data de admissão divergente.",
                "admissao_divergente",
                funcionario.dataAdmissao
            );

        }

        //----------------------------------------
        // DE PARA
        //----------------------------------------

        const verba = verbasMap.get(holerite.codigoVerba);

        if (!verba) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "L",
                "Código Verba",
                holerite.codigoVerba,
                "Código inexistente no De-Para.",
                "verba_nao_cadastrada"
            );

        }

        else if (verba.length > 1) {

            adicionarErro(
                erros,
                holerite.linhaPlanilha,
                "L",
                "Código Verba",
                holerite.codigoVerba,
                "Duplicidade encontrada no De-Para.",
                "duplicidade_depara"
            );

        }

    }

    return erros;

}