from dataclasses import dataclass
from typing import Literal

TipoErro = Literal[
    "ERRO_ESTRUTURAL",
    "ERRO_CADASTRAL",
    "ERRO_FINANCEIRO",
    "ERRO_DEPARA",
    "ERRO_CPF",
    "AVISO"
]

StatusVisual = Literal[
    "VERMELHO",
    "AMARELO"
]


@dataclass
class ErroAuditoria:

    linha: int

    coluna: str

    campo: str

    valor_encontrado: str

    mensagem: str

    tipo: TipoErro

    status: StatusVisual

    sugestao: str