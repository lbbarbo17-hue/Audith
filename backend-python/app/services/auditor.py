from app.models.auditoria import ResultadoAuditoria


class Auditor:

    def __init__(self):

        self.resultado = ResultadoAuditoria()

    def executar(self):

        return self.resultado