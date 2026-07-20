import { NextRequest, NextResponse } from "next/server";
import { lerHolerite, lerRelatorio, lerDePara } from "./leitorPlanilhas";
import { executarAuditoria } from "./auditoria";
import { gerarResumo } from "./resumo";
import { gerarExcelResultado } from "./geradorExcel";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const holerite = formData.get("holerite") as File;
    const depara = formData.get("depara") as File;
    const relatorio = formData.get("relatorio") as File;

    if (!holerite || !depara || !relatorio) {
      return NextResponse.json(
        { erro: "Envie os três arquivos." },
        { status: 400 }
      );
    }

    const dadosHolerite = await lerHolerite(holerite);
    const dadosRelatorio = await lerRelatorio(relatorio);
    const dadosDePara = await lerDePara(depara);

    const erros = executarAuditoria(
      dadosHolerite,
      dadosRelatorio,
      dadosDePara
    );

    const resumo = gerarResumo(erros);

    let insightsDaIA = "Não foi possível gerar o diagnóstico descritivo da IA.";
    const apiKey = process.env.GROQ_API_KEY;

    try {
      if (!apiKey) {
        throw new Error("Chave GROQ_API_KEY não configurada no ambiente.");
      }

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', 
          messages: [
            {
              role: 'system',
              content: 'Você é um auditor sênior especialista em folha de pagamento e análise de holerites. O usuário vai te enviar um relatório estruturado de inconsistências matemáticas encontradas entre sitemas. Escreva um parágrafo executivo direto, profissional e claro resumindo a gravidade dos erros e o que a equipe de RH/DP deve corrigir imediatamente. Seja sucinto e direto ao ponto, sem introduções vazias.'
            },
            {
              role: 'user',
              content: `Analise as seguintes inconsistências e me dê o diagnóstico executivo: ${JSON.stringify(resumo)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        insightsDaIA = groqData.choices[0].message.content;
      }
    } catch (groqError) {
      console.error("Falha ao conectar com a Groq:", groqError);
      insightsDaIA = "Auditoria local concluída com sucesso. Erros mapeados na planilha para download.";
    }

    const arquivoOriginalBuffer = await holerite.arrayBuffer();
    const arquivoFinalBuffer = await gerarExcelResultado(arquivoOriginalBuffer, {
      totalAnalises: dadosHolerite.length,
      erros: erros
    });

    const arquivoBase64 = Buffer.from(arquivoFinalBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      totalAnalises: dadosHolerite.length,
      errosCount: erros.length,
      erros, 
      geminiPayload: insightsDaIA, 
      arquivo: arquivoBase64
    });

  } catch (error) {
    console.error("Erro na auditoria:", error);
    return NextResponse.json(
      { erro: "Erro ao executar auditoria." },
      { status: 500 }
    );
  }
}