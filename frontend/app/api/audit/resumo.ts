import { ErroAuditoria } from "./tipos";


export function gerarResumo(
    erros: ErroAuditoria[]
) {


    const cpfsInvalidos =
        erros.filter(
            e => e.categoria === "cpf_invalido"
        ).length;



    const cpfsNaoEncontrados =
        erros.filter(
            e => e.categoria === "cpf_nao_encontrado"
        ).length;



    const cnpjsInvalidos =
        erros.filter(
            e => e.categoria === "cnpj_invalido"
        ).length;



    const cnpjsDivergentes =
        erros.filter(
            e => e.categoria === "cnpj_divergente"
        ).length;



    const datasInvalidas =
        erros.filter(
            e => e.categoria === "data_invalida"
        ).length;



    const admissoesDivergentes =
        erros.filter(
            e => e.categoria === "admissao_divergente"
        ).length;



    const matriculasDivergentes =
        erros.filter(
            e => e.categoria === "matricula_divergente"
        ).length;



    const camposObrigatorios =
        erros.filter(
            e => e.categoria === "campo_obrigatorio"
        ).length;



    const verbasNaoCadastradas =
        erros.filter(
            e => e.categoria === "verba_nao_cadastrada"
        ).length;



    const duplicidadesDePara =
        erros.filter(
            e => e.categoria === "duplicidade_depara"
        ).length;



    return {


        mensagem_prompt:

        `
        Auditoria concluída.

        Foram encontrados ${erros.length} apontamentos.

        Principais análises:
        - CPF inválido: ${cpfsInvalidos}
        - CPF não encontrado: ${cpfsNaoEncontrados}
        - CNPJ inválido: ${cnpjsInvalidos}
        - CNPJ divergente: ${cnpjsDivergentes}
        - Data inválida: ${datasInvalidas}
        - Admissão divergente: ${admissoesDivergentes}
        - Matrícula divergente: ${matriculasDivergentes}
        - Campos obrigatórios: ${camposObrigatorios}
        - Verbas não cadastradas: ${verbasNaoCadastradas}
        - Duplicidades De-Para: ${duplicidadesDePara}

        Recomenda-se validar os registros apontados
        antes do fechamento da folha.
        `,


        dados_brutos:{


            totalErros:
            erros.length,


            totalCpfInvalido:
            cpfsInvalidos,


            totalCpfNaoEncontrado:
            cpfsNaoEncontrados,


            totalCnpjInvalido:
            cnpjsInvalidos,


            totalCnpjDivergente:
            cnpjsDivergentes,


            totalDataInvalida:
            datasInvalidas,


            totalAdmissaoDivergente:
            admissoesDivergentes,


            totalMatriculaDivergente:
            matriculasDivergentes,


            totalCampoObrigatorio:
            camposObrigatorios,


            totalVerbaNaoCadastrada:
            verbasNaoCadastradas,


            totalDuplicidadeDePara:
            duplicidadesDePara

        }

    };

}