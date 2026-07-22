from pydantic import BaseModel

class ErroAuditoria(BaseModel):

    linha: int

    campo: str

    valor_encontrado: str

    valor_esperado: str | None = None

    mensagem: str

    sugestao: str

    tipo: str

    confianca: int

    categoria: str


class ResultadoAuditoria(BaseModel):

    total_linhas: int

    erros: list[ErroAuditoria]

    score: int

    resumo: str