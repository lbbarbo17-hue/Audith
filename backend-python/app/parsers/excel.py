from pathlib import Path

import pandas as pd

from app.parsers.normalizador import Normalizador


class ExcelParser:

    def __init__(self, arquivo):

        self.arquivo = Path(arquivo)

    def ler_holerite(self):

        df = pd.read_excel(

            self.arquivo,

            dtype=str,

            keep_default_na=False

        )

        return Normalizador(df).holerite()