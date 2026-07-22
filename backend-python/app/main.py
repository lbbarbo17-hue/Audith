from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, APP_VERSION

app = FastAPI(

    title=APP_NAME,

    version=APP_VERSION

)

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


@app.get("/")

def home():

    return {

        "sistema": APP_NAME,

        "versao": APP_VERSION,

        "status": "online"

    }


@app.get("/health")

def health():

    return {

        "status": "ok"

    }