// frontend/app/api/audit/validadores.ts


export function campoObrigatorio(
    valor: string | undefined | null
): boolean {

    return (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
    );

}



/*
    CPF fictício da base:
    Não valida dígito verificador.

    Apenas verifica:
    - preenchido
    - 11 números
*/

export function validarCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  const cpfLimpo = cpf.replace(/[\.\-\s]/g, "").toUpperCase();

  // Verifica se tem o tamanho padrão de um CPF (11 caracteres)
  if (cpfLimpo.length !== 11) return false;

  // Se possuir alguma LETRA (A-Z), tratamos como CPF Alfanumérico válido
  if (/[A-Z]/.test(cpfLimpo)) {
    return true; 
  }

  // Se for puramente numérico, aplica a validação tradicional de dígitos
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false; // Elimina sequências repetidas como 111.111.111-11

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;

  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}




/*
    CNPJ fictício da base:

    Não valida CNPJ real.

    Apenas:
    - preenchido
    - 14 números
*/

export function validarCNPJ(
    cnpj:string
):boolean {


    const somenteNumeros =
        cnpj.replace(/\D/g,"");


    return somenteNumeros.length === 14;

}




/*
    Data:

    Como vem de Excel,
    a validação fica simples.
*/

export function validarData(
    data:string
):boolean {


    if(!data){
        return false;
    }


    const partes =
        data.split("-");


    if(partes.length !== 3){
        return false;
    }


    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const dia =
        Number(partes[2]);


    return (
        ano > 1900 &&
        mes >=1 &&
        mes <=12 &&
        dia >=1 &&
        dia <=31
    );

}