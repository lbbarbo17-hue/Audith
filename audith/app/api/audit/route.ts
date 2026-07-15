// app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as ExcelJS from 'exceljs';
import { 
  executarAuditoria, 
  gerarResumoParaMaya, 
  HoleriteLinha, 
  FuncionarioRelatorio, 
  DeParaVerba 
} from './auditoria';

export async function POST(request: NextRequest) {
  try {
    // 1. Recebe os arquivos enviados pelo formulário
    const formData = await request.formData();
    const holeriteFile = formData.get('holerite') as File;
    const deparaFile = formData.get('depara') as File;
    const relatorioFile = formData.get('relatorio') as File;

    if (!holeriteFile || !deparaFile || !relatorioFile) {
      return NextResponse.json(
        { error: 'Por favor, envie as três planilhas obrigatórias (holerite, depara, relatorio).' },
        { status: 400 }
      );
    }

    // --- LEITURA 1: HOLERITE ---
    const holeriteBuffer = Buffer.from(await holeriteFile.arrayBuffer());
    const workbookHolerite = new ExcelJS.Workbook();
    await workbookHolerite.xlsx.load(holeriteBuffer);
    const sheetHolerite = workbookHolerite.getWorksheet(1);
    
    if (!sheetHolerite) {
      return NextResponse.json({ error: 'Aba do Holerite não encontrada.' }, { status: 400 });
    }

    const holerites: HoleriteLinha[] = [];
    // Começa na linha 2 ignorando o cabeçalho
    sheetHolerite.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        holerites.push({
          linhaPlanilha: rowNumber,
          cpf: String(row.getCell(1).value || '').trim(),           // Coluna A
          cnpj: String(row.getCell(2).value || '').trim(),          // Coluna B
          matricula: String(row.getCell(3).value || '').trim(),     // Coluna C
          codigoVerba: String(row.getCell(4).value || '').trim(),   // Coluna D
          dataAdmissao: String(row.getCell(5).value || '').trim()   // Coluna E
        });
      }
    });

    // --- LEITURA 2: RELATÓRIO DE FUNCIONÁRIOS ---
    const relatorioBuffer = Buffer.from(await relatorioFile.arrayBuffer());
    const workbookRelatorio = new ExcelJS.Workbook();
    await workbookRelatorio.xlsx.load(relatorioBuffer);
    const sheetRelatorio = workbookRelatorio.getWorksheet(1);
    
    const funcionarios: FuncionarioRelatorio[] = [];
    if (sheetRelatorio) {
      sheetRelatorio.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          funcionarios.push({
            cpf: String(row.getCell(1).value || '').trim(),           // Coluna A
            cnpjRegistro: String(row.getCell(2).value || '').trim(),  // Coluna B
            matricula: String(row.getCell(3).value || '').trim(),     // Coluna C
            dataAdmissao: String(row.getCell(4).value || '').trim()   // Coluna D
          });
        }
      });
    }

    // --- LEITURA 3: DE-PARA DE VERBAS ---
    const deparaBuffer = Buffer.from(await deparaFile.arrayBuffer());
    const workbookDepara = new ExcelJS.Workbook();
    await workbookDepara.xlsx.load(deparaBuffer);
    const sheetDepara = workbookDepara.getWorksheet(1);

    const deParaList: DeParaVerba[] = [];
    if (sheetDepara) {
      sheetDepara.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          deParaList.push({
            codigoCliente: String(row.getCell(1).value || '').trim(), // Coluna A
            codigoWfp: String(row.getCell(2).value || '').trim()      // Coluna B
          });
        }
      });
    }

    // 2. Executa a auditoria cruzando todos os dados importados
    const errosEncontrados = executarAuditoria(holerites, funcionarios, deParaList);

    // 3. Estrutura o objeto de resumo para a IA Maya
    const resumoMaya = gerarResumoParaMaya(errosEncontrados);

    // 4. Retorna a resposta de sucesso com todos os erros estruturados
    return NextResponse.json({
      success: true,
      totalAnalises: holerites.length,
      errosCount: errosEncontrados.length,
      erros: errosEncontrados,
      mayaPayload: resumoMaya
    });

  } catch (error: any) {
    console.error('Erro na rota de auditoria:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar as planilhas.', detalhes: error.message },
      { status: 500 }
    );
  }
}