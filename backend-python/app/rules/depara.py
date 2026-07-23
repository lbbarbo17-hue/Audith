from app.models.erro import ErroAuditoria


def validar_depara(holerite, depara):

    erros = []

    verbas = set()

    for _, row in depara.iterrows():

        verbas.add(str(row["Clie"]).strip())

    for indice, row in holerite.iterrows():

        codigo = str(row["CODIGO_VERBA"]).strip()

        if codigo not in verbas:

            erros.append(

                ErroAuditoria(

                    linha=indice + 2,

                    coluna="CODIGO_VERBA",

                    campo="Código da verba",

                    valor_encontrado=codigo,

                    mensagem="Esta verba não existe na tabela De-Para.",

                    tipo="ERRO_DEPARA",

                    status="VERMELHO",

                    sugestao="Cadastre a verba ou utilize um código válido."

                )

            )

    return erros