import re


def somente_numeros(valor):

    if valor is None:

        return ""

    return re.sub(r"\D", "", str(valor))


def normalizar_texto(valor):

    if valor is None:

        return ""

    return str(valor).strip().upper()


def vazio(valor):

    return valor is None or str(valor).strip() == ""