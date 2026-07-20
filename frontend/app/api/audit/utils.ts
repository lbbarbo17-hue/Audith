// app/api/audit/utils.ts


export function normalizarCPF(cpf: unknown): string {
  if (!cpf) return "";
  // Remove pontos, traços, barras e espaços, mas MANTÉM letras e números
  return String(cpf)
    .replace(/[\.\-\s]/g, "")
    .trim()
    .toUpperCase();
}



export function normalizarCNPJ(cnpj: unknown): string {
  if (cnpj === null || cnpj === undefined) return "";
  // Transforma em string, remove pontos, barras, traços e espaços, mantendo letras/números
  return String(cnpj)
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim()
    .toUpperCase();
}

export function normalizarMatricula(matricula: unknown): string {
  if (matricula === null || matricula === undefined) return "";
  // Remove espaços, transforma em string e limpa zeros à esquerda para o match perfeito
  return String(matricula).trim().replace(/^0+/, "");
}

export function normalizarCodigoVerba(codigo: unknown): string {
  if (codigo === null || codigo === undefined) return "";
  // Garante tratamento como string limpa e sem espaços nas pontas
  return String(codigo).trim().toUpperCase();
}



export function normalizarData(data: unknown): string {
  if (data === null || data === undefined) return "";

  // Se o ExcelJS já interpretou o campo como um objeto Date nativo do JS
  if (data instanceof Date) {
    if (isNaN(data.getTime())) return ""; // Evita datas inválidas
    return data.toISOString().split("T")[0]; // Retorna no padrão AAAA-MM-DD
  }

  // Se veio como string ou número, limpamos e validamos o formato básico
  const stringData = String(data).trim();
  
  // Caso a string já esteja no formato AAAA-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringData)) {
    return stringData;
  }

  // Caso esteja no formato brasileiro DD/MM/AAAA, convertemos para AAAA-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(stringData)) {
    const [dia, mes, ano] = stringData.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  return stringData;
}