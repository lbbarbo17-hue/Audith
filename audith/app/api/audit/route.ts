import { NextRequest, NextResponse } from 'next/server';
import * as ExcelJS from 'exceljs'; // CORREÇÃO 1: Importação correta para evitar erros de default export

export async function POST(request: NextRequest) {
  try {
    // 1. Recebe os arquivos enviados pelo formulário
    const formData = await request.formData();
    const holeriteFile = formData.get('holerite') as File;
    const deparaFile = formData.get('depara') as File;
    const relatorioFile = formData.get('relatorio') as File;

    if (!holeriteFile || !deparaFile || !relatorioFile) {
      return NextResponse.json(
        { error: 'Por favor, envie as três planilhas obrigatórias.' },
        { status: 400 }
      );
    }

    // 2. Transforma o arquivo do Holerite em um Buffer para o ExcelJS ler
    const holeriteBuffer = Buffer.from(await holeriteFile.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(holeriteBuffer);

    // Seleciona a primeira aba da planilha de holerite
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: 'Não foi possível ler a primeira aba da planilha de holerites.' },
        { status: 400 }
      );
    }

    // 3. Estruturas para carregar o De-Para e o Relatório de Funcionários
    
    // --- VALIDAÇÃO COM CORREÇÃO ---
    // CORREÇÃO 2: Tipagem explícita dos parâmetros (row: ExcelJS.Row, rowNumber: number)
    worksheet.eachRow({ includeEmpty: false }, (row: ExcelJS.Row, rowNumber: number) => {
      if (rowNumber === 1) return; // Pula a linha de títulos

      // Imagine que a coluna 1 é o CPF e a coluna 2 é o Nome
      const cpfCell = row.getCell(1);
      const cpfValue = cpfCell.value ? String(cpfCell.value).replace(/\D/g, '') : ''; // Remove pontos e traços

      // Validação de teste: CPF deve ter exatamente 11 dígitos
      if (cpfValue.length !== 11) {
        // PINTA A CÉLULA DE VERMELHO SE ESTIVER ERRADO
        cpfCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }, // Vermelho (formato ARGB)
        };
        
        // Adiciona um comentário na célula explicando o erro
        cpfCell.note = 'Erro: CPF inválido ou incompleto. Deve conter 11 dígitos numéricos.';
      }
    });

    // 4. Gera a planilha modificada na memória
    const outputBuffer = await workbook.xlsx.writeBuffer() as Buffer; // Força o tipo correto de Buffer

    // 5. Devolve o arquivo modificado de volta para o cliente (navegador)
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="HOLERITE_AUDITADO_ERROS.xlsx"',
      },
    });

  } catch (error: any) {
    console.error('Erro no processamento do backend:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar planilhas: ' + error.message },
      { status: 500 }
    );
  }
}