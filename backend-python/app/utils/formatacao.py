import re


def normalizar_cpf(cpf):

    return re.sub(r"\D", "", str(cpf))


def normalizar_cnpj(cnpj):

    return re.sub(r"[^A-Za-z0-9]", "", str(cnpj)).upper()


def normalizar_matricula(m):

    return str(m).strip()