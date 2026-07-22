from dataclasses import dataclass


@dataclass
class Funcionario:

    cpf: str

    cnpj: str

    matricula: str

    nome: str

    admissao: str

    empresa: str