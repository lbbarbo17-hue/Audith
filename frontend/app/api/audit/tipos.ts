export interface HoleriteLinha {
  linhaPlanilha: number;
  cpf: string;
  cnpj: string;
  cnpjTomador?: string;
  dataAdmissao: string;
  matricula: string;
  tipoFolha: string;
  dataPagamento?: string;
  mes?: string;
  ano?: string;
  qtdeDependentesIrrf?: string;
  qtdeDependentesSf?: string;
  codigoVerba: string;
  descricaoVerba?: string;
  naturezaVerba?: string;
  percentualVerba?: string;
  quantidadeReferencia?: string;
  valorVerba?: string;
  incidenciaInss?: string;
  incidenciaIrrf?: string;
  incidenciaFgts?: string;
}

export interface FuncionarioRelatorio {
  cnpjRegistro: string;
  matricula: string;
  cpf: string;
  dataAdmissao: string;
}

export interface DeParaVerba {
  codigoCliente: string;
  codigoWfp: string;
}

export interface ErroAuditoria {
  linha: number;
  coluna: string; // Deixe como string simples para receber a letra dinamicamente
  campo: string;
  valorEncontrado: string;
  valorEsperado?: string;
  mensagem: string;
  categoria: string; // Alterado para string simples para evitar erro de atribuição estrita
}