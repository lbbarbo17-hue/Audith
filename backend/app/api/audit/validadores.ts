// app/api/audit/validadores.ts

/**
 * Verifica se um campo obrigatório foi informado.
 */
export function campoObrigatorio(valor: string): boolean {
  return valor.trim().length > 0;
}

/**
 * Validação de CPF.
 */
export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) return false;

  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  return resto === Number(cpf[10]);
}

/**
 * Aceita CNPJ numérico e prepara o sistema para
 * futuros CNPJs alfanuméricos.
 *
 * Neste momento valida apenas tamanho mínimo.
 */
export function validarCNPJ(cnpj: string): boolean {

  if (!cnpj) return false;

  cnpj = cnpj
    .trim()
    .toUpperCase()
    .replace(/[.\-\/\s]/g, "");

  if (cnpj.length !== 14) {
    return false;
  }

  return true;
}

/**
 * Verifica se uma data foi convertida
 * corretamente para YYYY-MM-DD.
 */
export function validarData(data: string): boolean {

  if (!data) return false;

  return /^\d{4}-\d{2}-\d{2}$/.test(data);

}