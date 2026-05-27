from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import datetime
import asyncio
import uvicorn

app = FastAPI(title="DJADWEB-IA API", description="Mock API para el MVP")

# Habilitar CORS para permitir llamadas desde el frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos en el MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PjudRequest(BaseModel):
    nombre: str
    apellidoPaterno: str
    competencia: str
    apellidoMaterno: Optional[str] = None
    anio: Optional[str] = None

@app.post("/api/pjud/nombre")
async def buscar_pjud(request: PjudRequest):
    # Simular una demora de scraping de 1 a 2 segundos
    await asyncio.sleep(1.5)
    
    return {
        "consultadoEn": datetime.datetime.now().isoformat(),
        "total": 2,
        "causas": [
            {
                "rit": "C-1234-2023",
                "tribunal": f"1° Juzgado {request.competencia.capitalize()} de Santiago",
                "estado": "Activa",
                "urlDetalle": "https://oficinajudicialvirtual.pjud.cl/"
            },
            {
                "rit": "C-5678-2022",
                "tribunal": f"3° Juzgado {request.competencia.capitalize()} de San Miguel",
                "estado": "Archivada",
                "urlDetalle": "https://oficinajudicialvirtual.pjud.cl/"
            }
        ],
        "_cache": False
    }

# Endpoint de salud para verificar que el servidor está corriendo
@app.get("/health")
async def health():
    return {"status": "ok", "service": "DJADWEB-IA API", "version": "0.1.0-mock"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
