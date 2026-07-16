// app/api/audit/utils.ts

/**
 * Remove máscara do CPF.
 * Ex: 123.456.789-01 -> 12345678901
 */
export function normalizarCPF(cpf: string): string {
  return String(cpf ?? "")
    .trim()
    .replace(/\D/g, "");
}

/**
 * Remove máscara do CNPJ.
 * Compatível com CNPJ numérico e futuro CNPJ alfanumérico.
 *
 * Ex:
 * 64.682.387/0001-96 -> 64682387000196
 * AB.123.CD/0001-XY -> AB123CD0001XY
 */
export function normalizarCNPJ(cnpj: string): string {
  return String(cnpj ?? "")
    .trim()
    .toUpperCase()
    .replace(/[.\-\/\s]/g, "");
}

/**
 * Remove espaços da matrícula.
 */
export function normalizarMatricula(matricula: string): string {
  return String(matricula ?? "").trim();
}

/**
 * Remove espaços do código da verba.
 */
export function normalizarCodigoVerba(codigo: string): string {
  return String(codigo ?? "").trim();
}

/**
 * Converte qualquer formato de data para YYYY-MM-DD.
 */
export function normalizarData(valor: any): string {
  if (!valor) return "";

  // ExcelJS pode retornar Date
  if (valor instanceof Date) {
    return valor.toISOString().split("T")[0];
  }

  const texto = String(valor).trim();

  // Já está no padrão ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  const data = new Date(texto);

  if (!isNaN(data.getTime())) {
    return data.toISOString().split("T")[0];
  }

  return texto;
}