import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs"; // 🟧 Importante: certifique-se de que está instalado

import {
    lerHolerite,
    lerRelatorio,
    lerDePara
} from "./leitorPlanilhas";

import {
    executarAuditoria
} from "./auditoria";

import {
    gerarResumo
} from "./resumo";

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
                            content: 'Você é um auditor sênior especialista em folha de pagamento e análise de holerites. O usuário vai te enviar um relatório estruturado de inconsistências matemáticas encontradas entre sistemas. Escreva um parágrafo executivo direto, profissional e claro resumindo a gravidade dos erros e o que a equipe de RH/DP deve corrigir imediatamente. Seja sucinto e direto ao ponto, sem introduções vazias.'
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

        // 🛠️ 1. MAPEAMENTO CORRIGIDO: Vincula o 'campo' retornado pela auditoria à coluna real
        const mapearNomeParaLetra: Record<string, string> = {
            "CPF": "A",
            "CNPJ": "B",
            "CNPJ Tomador": "C",
            "Data Admissão": "D",
            "Matrícula": "E",
            "Tipo de Folha": "F",
            "Código Verba": "L",
            "Natureza Verba": "N",
            "Percentual Verba": "O",
            "Quantidade Referência": "P",
            "Valor Verba": "Q",
            "Incidência INSS": "R",
            "Incidência IRRF": "S",
            "Incidência FGTS": "T"
        };

        // 🛠️ 2. RECONSTRUÇÃO DO EXCEL DIRETAMENTE NA ROTA COM AS CORES CORRETAS
        const arquivoOriginal = await holerite.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arquivoOriginal);
        const sheet = workbook.getWorksheet(1);

        if (!sheet) {
            throw new Error("Não foi possível carregar a primeira aba da planilha.");
        }

        // A) Forçar a paleta de cores de identificação no cabeçalho (Linha 1)
        const layoutCoresCabecalho: Record<string, string> = {
            "A1": "FFE5CC", "B1": "FFE5CC", "D1": "FFE5CC", // Laranja
            "C1": "DDEBF7",                                 // Azul
            "E1": "FFF2CC", "F1": "FFF2CC",                 // Amarelo
            "G1": "E2EFDA", "H1": "E2EFDA", "I1": "E2EFDA", "J1": "E2EFDA", "K1": "E2EFDA",
            "L1": "E2EFDA", "M1": "E2EFDA", "N1": "E2EFDA", "O1": "E2EFDA", "P1": "E2EFDA",
            "Q1": "E2EFDA", "R1": "E2EFDA", "S1": "E2EFDA", "T1": "E2EFDA" // Verde
        };

        Object.entries(layoutCoresCabecalho).forEach(([celula, corHex]) => {
            const cell = sheet.getCell(celula);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: corHex }
            };
            cell.font = { bold: true, color: { argb: "000000" }, name: "Calibri", size: 11 };
        });

        // B) PINTURA CIRÚRGICA DOS ERROS EM VERMELHO
        erros.forEach(erro => {
            // Obtém a letra correspondente baseada no nome do campo que falhou
            const letraColuna = mapearNomeParaLetra[erro.campo];
            
            if (letraColuna && erro.linha) {
                const enderecoCelula = `${letraColuna.toUpperCase()}${erro.linha}`;
                const cell = sheet.getCell(enderecoCelula);

                // Aplica o estilo de erro estritamente nessa célula
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFC7CE' } // Vermelho suave de erro
                };
                cell.font = {
                    color: { argb: '9C0006' }, // Letra escura
                    bold: true,
                    name: "Calibri",
                    size: 11
                };
            }
        });

        // Gerar o buffer final com as alterações aplicadas
        const arquivoFinalBuffer = await workbook.xlsx.writeBuffer();
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