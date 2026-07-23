from app.models.erro import ErroAuditoria
from app.utils.formatacao import (
    normalizar_cpf,
    normalizar_cnpj,
    normalizar_matricula
)


def validar_cadastro(holerite, cadastro):

    erros = []

    funcionarios = {}

    for _, row in cadastro.iterrows():

        chave = normalizar_cpf(row["CPF"])

        funcionarios[chave] = row

    for indice, row in holerite.iterrows():

        cpf = normalizar_cpf(row["CPF"])

        if cpf not in funcionarios:

            erros.append(

                ErroAuditoria(

                    linha=indice + 2,

                    coluna="CPF",

                    campo="CPF",

                    valor_encontrado=cpf,

                    mensagem="CPF não encontrado no cadastro de funcionários.",

                    tipo="ERRO_CADASTRAL",

                    status="VERMELHO",

                    sugestao="Verifique se o funcionário existe na base cadastral."

                )

            )

            continue

        cadastro_func = funcionarios[cpf]

        if normalizar_cnpj(row["CNPJ_REGISTRO"]) != normalizar_cnpj(cadastro_func["CNPJ Principal"]):

            erros.append(

                ErroAuditoria(

                    linha=indice + 2,

                    coluna="CNPJ_REGISTRO",

                    campo="CNPJ",

                    valor_encontrado=row["CNPJ_REGISTRO"],

                    mensagem="O CNPJ informado é diferente do cadastro.",

                    tipo="ERRO_CADASTRAL",

                    status="VERMELHO",

                    sugestao="Confirme se o funcionário pertence à empresa correta."

                )

            )

        if normalizar_matricula(row["MATRICULA"]) != normalizar_matricula(cadastro_func["Número Matrícula"]):

            erros.append(

                ErroAuditoria(

                    linha=indice + 2,

                    coluna="MATRICULA",

                    campo="Matrícula",

                    valor_encontrado=row["MATRICULA"],

                    mensagem="A matrícula é diferente da cadastrada.",

                    tipo="ERRO_CADASTRAL",

                    status="AMARELO",

                    sugestao="Pode indicar promoção, transferência ou alteração cadastral. Confirme antes de corrigir."

                )

            )

        if str(row["DATA_ADMISSAO"]) != str(cadastro_func["Data Admissão"]):

            erros.append(

                ErroAuditoria(

                    linha=indice + 2,

                    coluna="DATA_ADMISSAO",

                    campo="Data de admissão",

                    valor_encontrado=row["DATA_ADMISSAO"],

                    mensagem="A data de admissão é diferente da cadastrada.",

                    tipo="ERRO_CADASTRAL",

                    status="AMARELO",

                    sugestao="Verifique se houve recontratação ou movimentação interna."

                )

            )

    return erros