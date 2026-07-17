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

export function validarCPF(
    cpf:string
):boolean {


    const somenteNumeros =
        cpf.replace(/\D/g,"");


    return somenteNumeros.length === 11;

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