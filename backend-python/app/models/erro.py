from dataclasses import dataclass


@dataclass
class ErroAuditoria:
    linha: int
    coluna: str
    valor_encontrado: str
    valor_correto: str
    tipo: str
    gravidade: str
    mensagem: str