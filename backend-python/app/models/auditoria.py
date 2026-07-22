from dataclasses import dataclass, field
from typing import List
from .erro import ErroAuditoria


@dataclass
class ResultadoAuditoria:

    total_linhas: int = 0

    erros: List[ErroAuditoria] = field(default_factory=list)

    avisos: List[ErroAuditoria] = field(default_factory=list)

    def adicionar(self, erro: ErroAuditoria):

        if erro.status == "AMARELO":

            self.avisos.append(erro)

        else:

            self.erros.append(erro)