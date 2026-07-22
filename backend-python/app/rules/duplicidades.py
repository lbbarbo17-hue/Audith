from collections import Counter
from app.models.erro import ErroAuditoria


def validar_cpfs_duplicados(df):

    erros=[]

    contador=Counter(df["CPF"])

    for indice,linha in df.iterrows():

        if contador[linha["CPF"]] > 1:

            erros.append(
                ErroAuditoria(
                    linha=indice+2,
                    campo="CPF",
                    mensagem="Existe mais de um registro com este CPF na folha.",
                    tipo="CPF_DUPLICADO",
                    gravidade="AMARELO"
                )
            )

    return erros