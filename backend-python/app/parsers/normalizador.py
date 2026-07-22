from app.utils.helpers import localizar_coluna
from app.utils.normalizacao import (
    normalizar_cpf,
    normalizar_cnpj,
    normalizar_data,
    normalizar_matricula
)


class Normalizador:

    def __init__(self, dataframe):
        self.df = dataframe

    def holerite(self):

        cpf = localizar_coluna(self.df, "cpf")
        cnpj = localizar_coluna(self.df, "cnpj")
        matricula = localizar_coluna(self.df, "matricula")
        admissao = localizar_coluna(self.df, "data_admissao")
        codigo = localizar_coluna(self.df, "codigo_verba")
        descricao = localizar_coluna(self.df, "descricao_verba")
        valor = localizar_coluna(self.df, "valor_verba")

        resultado = []

        for indice, linha in self.df.iterrows():

            resultado.append({

                "linha": indice + 2,

                "cpf": normalizar_cpf(linha.get(cpf, "")),

                "cnpj": normalizar_cnpj(linha.get(cnpj, "")),

                "matricula": normalizar_matricula(
                    linha.get(matricula, "")
                ),

                "data_admissao": normalizar_data(
                    linha.get(admissao, "")
                ),

                "codigo_verba": str(
                    linha.get(codigo, "")
                ).strip(),

                "descricao_verba": str(
                    linha.get(descricao, "")
                ).strip(),

                "valor_verba": linha.get(valor, "")
            })

        return resultado