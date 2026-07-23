import pandas as pd


class ExcelParser:

    @staticmethod
    def ler(caminho):

        return pd.read_excel(
            caminho,
            dtype=str
        ).fillna("")