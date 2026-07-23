from app.models.erro import ErroAuditoria


def validar_colunas(df, obrigatorias):

    erros = []

    for coluna in obrigatorias:

        if coluna not in df.columns:

            erros.append(

                ErroAuditoria(

                    linha=0,

                    coluna=coluna,

                    valor_encontrado="",

                    valor_correto="",

                    tipo="Estrutural",

                    gravidade="Critico",

                    mensagem=f"Coluna '{coluna}' não encontrada."

                )

            )

    return erros