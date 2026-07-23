from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil

from app.services.auditor import Auditor

app = FastAPI(
    title="AuditH",
    version="1.0"
)

# Permite comunicação com o Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def inicio():
    return {
        "status": "AuditH Online"
    }


@app.post("/auditar")
async def auditar(
    holerite: UploadFile = File(...),
    relatorio: UploadFile = File(...),
    depara: UploadFile = File(...)
):

    caminho_holerite = UPLOAD_DIR / holerite.filename
    caminho_relatorio = UPLOAD_DIR / relatorio.filename
    caminho_depara = UPLOAD_DIR / depara.filename

    with open(caminho_holerite, "wb") as buffer:
        shutil.copyfileobj(holerite.file, buffer)

    with open(caminho_relatorio, "wb") as buffer:
        shutil.copyfileobj(relatorio.file, buffer)

    with open(caminho_depara, "wb") as buffer:
        shutil.copyfileobj(depara.file, buffer)

    auditoria = Auditor(
        caminho_holerite,
        caminho_relatorio,
        caminho_depara
    )

    resultado = auditoria.executar()

    return resultado