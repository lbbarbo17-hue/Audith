export interface HoleriteLinha {
  linhaPlanilha: number;
  cpf: string;
  cnpj: string;
  dataAdmissao: string;
  matricula: string;
  tipoFolha: string;
  descricaoVerba?: string;
  codigoVerba?: string;
  valorVerba?: string;
  quantidadeReferencia?: string;
  naturezaVerba?: string;
  incidenciaInss?: string;
  incidenciaFgts?: string;
  incidenciaIrrf?: string;
  percentualVerba?: string;
}

export interface FuncionarioRelatorio {
  cpf: string;
  cnpjRegistro: string;
  matricula: string;
  dataAdmissao: string;
}

export interface DeParaVerba {
  codigoCliente: string;
}

export interface ErroAuditoria {
  linha: number;
  coluna: string;
  campo: string;
  valorEncontrado: string;
  valorEsperado?: string;
  mensagem: string;
  tipoNotificacao: 'ERRO_ESTRUTURAL' | 'DIVERGENCIA_CPF';
  statusVisual: 'VERMELHO' | 'AMARELO'; 
  categoria?: string;
}