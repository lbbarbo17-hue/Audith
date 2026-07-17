// app/api/audit/utils.ts


export function normalizarCPF(
    valor:string
):string {

    return valor
        .replace(/\D/g,"")
        .padStart(11,"0");

}



export function normalizarCNPJ(
    valor:string
):string {

    return valor
        .replace(/\D/g,"")
        .padStart(14,"0");

}



export function normalizarMatricula(
    valor:string
):string {

    return valor
        .trim()
        .toUpperCase();

}



export function normalizarCodigoVerba(
    valor:string
):string {

    return valor
        .trim()
        .toUpperCase();

}



export function normalizarData(
    valor:any
):string {


    if(!valor){
        return "";
    }


    if(valor instanceof Date){

        return valor
        .toISOString()
        .split("T")[0];

    }


    return String(valor)
        .trim();

}