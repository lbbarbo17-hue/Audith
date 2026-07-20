const XLSX = require('xlsx');

// 1. BASE DE FUNCIONÁRIOS (Elenco Naruto com CNPJs Alfanuméricos)
const dadosCadastro = [
  { "CNPJ Principal": "64.ABC.387/0001-9X", "Empresa": "Empresa Fictícia Augusto", "Número Matrícula": "01", "Nome": "Naruto Uzumaki", "CPF": "123.456.789-01", "Data Admissão": "2022-02-14" },
  { "CNPJ Principal": "78.XYZ.545/0001-6W", "Empresa": "Empresa Fictícia Valeria", "Número Matrícula": "01", "Nome": "Sasuke Uchiha", "CPF": "234.567.890-12", "Data Admissão": "2022-08-03" },
  { "CNPJ Principal": "62.KGB.319/0001-63", "Empresa": "Empresa Fictícia Nathaly", "Número Matrícula": "01", "Nome": "Sakura Haruno", "CPF": "345.678.901-23", "Data Admissão": "2023-01-19" },
  { "CNPJ Principal": "46.ALF.341/0001-85", "Empresa": "Empresa Fictícia Sergio", "Número Matrícula": "01", "Nome": "Kakashi Hatake", "CPF": "456.789.012-34", "Data Admissão": "2023-05-27" }
];

// 2. BASE DE-PARA REAL (Enviada por você)
const dadosDePara = [
  { "Clie": "101", "Descrição Cliente": "Salário Base", "Nat. Cli": "Provento", "Cod_WFP": "20" },
  { "Clie": "20120", "Descrição Cliente": "Gratificação", "Nat. Cli": "Provento", "Cod_WFP": "11" },
  { "Clie": "5901", "Descrição Cliente": "INSS", "Nat. Cli": "Desconto", "Cod_WFP": "6" },
  { "Clie": "5902", "Descrição Cliente": "IRRF", "Nat. Cli": "Desconto", "Cod_WFP": "63" },
  { "Clie": "5905", "Descrição Cliente": "Vale Transporte", "Nat. Cli": "Desconto", "Cod_WFP": "66" },
  { "Clie": "150", "Descrição Cliente": "Horas Extras 50%", "Nat. Cli": "Provento", "Cod_WFP": "12" }
];

// 3. BASE DE HOLERITES (Cruzando os dados com os erros propositais de teste)
const dadosHolerite = [
  {
    // ERRO 1 (Cadastral): Naruto na folha está como matrícula "011", mas no cadastro ele é "01"
    CPF: "12345678901", CNPJ_REGISTRO: "64ABC38700019X", DATA_ADMISSAO: "2022-02-14", 
    MATRICULA: "011", TIPO_FOLHA: "01", DATA_PAGAMENTO: "2023-01-30", MESANO: "012023",
    CODIGO_VERBA: "101", DESCRICAO_VERBANATUREZA_VERBA: "Salário Base", VALOR_VERBA: 4500.00
  },
  {
    // OK: Sasuke está com dados 100% consistentes
    CPF: "23456789012", CNPJ_REGISTRO: "78XYZ54500016W", DATA_ADMISSAO: "2022-08-03", 
    MATRICULA: "01", TIPO_FOLHA: "01", DATA_PAGAMENTO: "2023-01-30", MESANO: "012023",
    CODIGO_VERBA: "101", DESCRICAO_VERBANATUREZA_VERBA: "Salário Base", VALOR_VERBA: 6519.91
  },
  {
    // ERRO 2 (Cálculo): Sakura com um desconto abusivo/errado de R$ 3.900,00 de INSS (Verba 5901)
    CPF: "34567890123", CNPJ_REGISTRO: "62KGB319000163", DATA_ADMISSAO: "2023-01-19", 
    MATRICULA: "01", TIPO_FOLHA: "01", DATA_PAGAMENTO: "2024-01-31", MESANO: "012024",
    CODIGO_VERBA: "5901", DESCRICAO_VERBANATUREZA_VERBA: "INSS", VALOR_VERBA: 3900.00
  },
  {
    // ERRO 3 (De-Para): Kakashi com código de verba "99999" que NÃO existe na tabela De-Para acima
    CPF: "45678901234", CNPJ_REGISTRO: "46ALF341000185", DATA_ADMISSAO: "2023-05-27", 
    MATRICULA: "01", TIPO_FOLHA: "01", DATA_PAGAMENTO: "2024-01-31", MESANO: "012024",
    CODIGO_VERBA: "99999", DESCRICAO_VERBANATUREZA_VERBA: "Verba Secreta", VALOR_VERBA: 750.00
  }
];

// Função geradora que cria os arquivos .xlsx
function criarPlanilha(dados, nomeArquivo) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, nomeArquivo);
  console.log(`\x1b[32m%s\x1b[0m`, `🚀 Arquivo gerado com sucesso -> ${nomeArquivo}`);
}

// Execução
criarPlanilha(dadosHolerite, "teste_holerite.xlsx");
criarPlanilha(dadosDePara, "teste_depara.xlsx");
criarPlanilha(dadosCadastro, "teste_cadastro.xlsx");