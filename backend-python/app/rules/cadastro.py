import re

from app.models import ErroAuditoria

def validar_cpf(linha, numero):

    erros=[]

    cpf=str(linha.get("CPF",""))

    cpf=re.sub(r"[^\w]","",cpf)

    if len(cpf)!=11:

        erros.append(

            ErroAuditoria(

                linha=numero,

                campo="CPF",

                valor_encontrado=cpf,

                mensagem="CPF possui quantidade inválida de caracteres.",

                tipo="ERRO",

                confianca=100

            )

        )

    return erros