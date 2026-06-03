from datetime import datetime

from db.database import get_session
from db.models import Chunk, Document
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from ingestion.chunker import chunk_text
from ingestion.embedder import embed_chunks
from ingestion.parser import parse_pdf, parse_text, parse_url
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.ingest import IngestResponse, IngestTextRequest, IngestURLRequest

router = APIRouter()


async def _store_document(
    session: AsyncSession,
    source: str,
    content_type: str,
    raw_text: str,
) -> tuple[Document, int]:
    doc = Document(source=source, content_type=content_type, ingested_at=datetime.utcnow())
    session.add(doc)
    await session.flush()

    chunks = chunk_text(raw_text)
    if not chunks:
        raise HTTPException(status_code=422, detail="No text could be extracted from source")

    vectors = await embed_chunks(chunks)

    for idx, (text, vector) in enumerate(zip(chunks, vectors, strict=True)):
        session.add(Chunk(document_id=doc.id, content=text, embedding=vector, chunk_index=idx))

    await session.commit()
    return doc, len(chunks)


@router.post("/url", response_model=IngestResponse)
async def ingest_url(body: IngestURLRequest, db: AsyncSession = Depends(get_session)):
    try:
        text = await parse_url(str(body.url))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    doc, count = await _store_document(db, str(body.url), "url", text)
    return IngestResponse(document_id=doc.id, source=doc.source, chunk_count=count)


@router.post("/pdf", response_model=IngestResponse)
async def ingest_pdf(file: UploadFile = File(...), db: AsyncSession = Depends(get_session)):
    data = await file.read()
    try:
        text = parse_pdf(data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    doc, count = await _store_document(db, file.filename or "upload.pdf", "pdf", text)
    return IngestResponse(document_id=doc.id, source=doc.source, chunk_count=count)


@router.post("/text", response_model=IngestResponse)
async def ingest_text(body: IngestTextRequest, db: AsyncSession = Depends(get_session)):
    try:
        text = parse_text(body.content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    doc, count = await _store_document(db, body.title, "text", text)
    return IngestResponse(document_id=doc.id, source=doc.source, chunk_count=count)
