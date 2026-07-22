from app.models.erro import ErroAuditoria


def validar_financeiro(linha, numero):

    erros=[]

    try:

        valor=float(linha["VALOR_VERBA"])

    except:

        return erros

    if valor < 0:

        erros.append(
            ErroAuditoria(
                linha=numero,
                campo="VALOR_VERBA",
                mensagem="Valor negativo encontrado.",
                tipo="FINANCEIRO",
                gravidade="VERMELHO"
            )
        )

    return erros