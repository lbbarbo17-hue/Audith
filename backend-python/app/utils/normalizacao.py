import re
import unicodedata


def texto(valor):

    if valor is None:
        return ""

    valor = str(valor).strip()

    valor = unicodedata.normalize("NFKD", valor)

    valor = valor.encode("ASCII", "ignore").decode()

    return valor.upper()


def cpf(valor):

    return re.sub(r"\D", "", str(valor))


def cnpj(valor):

    return re.sub(r"\D", "", str(valor))


def numero(valor):

    if valor == "":
        return None

    try:

        return float(
            str(valor)
            .replace(".", "")
            .replace(",", ".")
        )

    except:

        return None