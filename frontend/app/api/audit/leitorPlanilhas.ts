import ExcelJS from "exceljs";

import {
HoleriteLinha,
FuncionarioRelatorio,
DeParaVerba
} from "./tipos";

import {
normalizarCPF,
normalizarCNPJ,
normalizarMatricula,
normalizarCodigoVerba,
normalizarData
} from "./utils";


function valorCelula(
valor:any
){

    if(valor === null || valor === undefined){
        return "";
    }


    if(valor instanceof Date){

        return valor.toISOString();

    }


    if(typeof valor === "object" && "text" in valor){

        return valor.text;

    }


    return String(valor).trim();

}



/*
=========================
HOLERITE
=========================
*/


export async function lerHolerite(
file:File
):Promise<HoleriteLinha[]>{


const buffer =
await file.arrayBuffer();


const workbook =
new ExcelJS.Workbook();


await workbook.xlsx.load(buffer);


const sheet =
workbook.getWorksheet(1);


if(!sheet){

throw new Error(
"Planilha Holerite não encontrada."
);

}


const dados:HoleriteLinha[]=[];



sheet.eachRow(
(row,rowNumber)=>{


if(rowNumber <= 1)
return;



const cpf =
normalizarCPF(
valorCelula(
row.getCell(1).value
)
);



const linha:HoleriteLinha={


linhaPlanilha:
rowNumber,


cpf,


cnpj:
normalizarCNPJ(
valorCelula(
row.getCell(2).value
)
),


dataAdmissao:
normalizarData(
row.getCell(4).value
),


matricula:
normalizarMatricula(
valorCelula(
row.getCell(5).value
)
),


codigoVerba:
normalizarCodigoVerba(
valorCelula(
row.getCell(12).value
)
)

};



dados.push(linha);


});


return dados;


}




/*
=========================
RELATÓRIO
=========================
*/


export async function lerRelatorio(
file:File
):Promise<FuncionarioRelatorio[]>{


const buffer =
await file.arrayBuffer();


const workbook =
new ExcelJS.Workbook();


await workbook.xlsx.load(buffer);


const sheet =
workbook.getWorksheet(1);


if(!sheet){

throw new Error(
"Relatório não encontrado."
);

}



const dados:FuncionarioRelatorio[]=[];



sheet.eachRow(
(row,rowNumber)=>{


if(rowNumber<=1)
return;



dados.push({


cnpjRegistro:
normalizarCNPJ(
valorCelula(
row.getCell(1).value
)
),


matricula:
normalizarMatricula(
valorCelula(
row.getCell(3).value
)
),


cpf:
normalizarCPF(
valorCelula(
row.getCell(5).value
)
),


dataAdmissao:
normalizarData(
row.getCell(6).value
)


});


});



return dados;


}




/*
=========================
DE PARA
=========================
*/


export async function lerDePara(
file:File
):Promise<DeParaVerba[]>{


const buffer =
await file.arrayBuffer();


const workbook =
new ExcelJS.Workbook();


await workbook.xlsx.load(buffer);



const sheet =
workbook.getWorksheet(1);



if(!sheet){

throw new Error(
"De-Para não encontrado."
);

}



const dados:DeParaVerba[]=[];



sheet.eachRow(
(row,rowNumber)=>{


if(rowNumber<=1)
return;



dados.push({


codigoCliente:
normalizarCodigoVerba(
valorCelula(
row.getCell(1).value
)
),


codigoWfp:
valorCelula(
row.getCell(4).value
)


});


});


return dados;


}