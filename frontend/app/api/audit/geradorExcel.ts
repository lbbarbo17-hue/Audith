// Exemplo de correção para o bloco de estilização do seu gerador Excel
export async function gerarExcelResultado(bufferOriginal: ArrayBuffer, dadosAuditoria: { totalAnalises: number, erros: any[] }) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bufferOriginal);
  const sheet = workbook.getWorksheet(1); // Pega a primeira aba

  // 1. FORÇAR A CORRETUDE DOS CABEÇALHOS (Linha 1) CONFORME O PRD VISUAL
  const layoutCores: Record<string, string> = {
    // Laranja: Obrigatório + Formato Estrito
    "A1": "FFE5CC", "B1": "FFE5CC", "D1": "FFE5CC",
    // Azul: Opcional Livre
    "C1": "DDEBF7",
    // Amarelo: Obrigatório Simples
    "E1": "FFF2CC", "F1": "FFF2CC",
    // Verde: Opcional com Formato/Regras
    "G1": "E2EFDA", "H1": "E2EFDA", "I1": "E2EFDA", "J1": "E2EFDA", "K1": "E2EFDA",
    "L1": "E2EFDA", "M1": "E2EFDA", "N1": "E2EFDA", "O1": "E2EFDA", "P1": "E2EFDA",
    "Q1": "E2EFDA", "R1": "E2EFDA", "S1": "E2EFDA", "T1": "E2EFDA"
  };

  // Aplica as cores de identificação no cabeçalho para que ele nunca volte branco
  Object.entries(layoutCores).forEach(([celula, corHex]) => {
    const cell = sheet.getCell(celula);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: corHex }
    };
    cell.font = { bold: true, color: { argb: "000000" } };
  });

  // 2. CORREÇÃO DO BUG: Pintar EM VERMELHO puramente as células que falharam
  // Evita o efeito cascata ou blocos gigantes desalinhados
  dadosAuditoria.erros.forEach(erro => {
    // Garanta que a letra da coluna exista e seja válida (A-T)
    if (erro.coluna && /^[A-T]$/.test(erro.coluna.toUpperCase()) && erro.linha) {
      const enderecoCelula = `${erro.coluna.toUpperCase()}${erro.linha}`;
      const cell = sheet.getCell(enderecoCelula);

      // Aplica o vermelho suave de erro apenas nesta coordenada cirúrgica
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC7CE' } // Fundo vermelho claro
      };
      cell.font = {
        color: { argb: '9C0006' }, // Texto vermelho escuro
        bold: true
      };
    }
  });

  return await workbook.xlsx.writeBuffer();
}