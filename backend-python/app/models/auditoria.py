from dataclasses import dataclass, field
from datetime import datetime
from .erro import ErroAuditoria


@dataclass
class Auditoria:

    empresa: str

    score: float = 100

    erros: list[ErroAuditoria] = field(default_factory=list)

    data: str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")