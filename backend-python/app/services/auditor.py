from app.parsers.excel import ExcelParser
from app.rules.estrutural import validar_colunas


class Auditor:

    def __init__(self, holerite, relatorio, depara):

        self.holerite = ExcelParser.ler(holerite)
        self.relatorio = ExcelParser.ler(relatorio)
        self.depara = ExcelParser.ler(depara)

        self.erros = []

    def executar(self):

        obrigatorias = [
            "CPF",
            "Nome",
            "Empresa"
        ]

        self.erros.extend(
            validar_colunas(
                self.relatorio,
                obrigatorias
            )
        )

        return {
            "empresa": "",
            "score": 100,
            "total_erros": len(self.erros),
            "erros": [
                erro.__dict__
                for erro in self.erros
            ]
        }