from db.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from ingestion.embedder import embed_chunks
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.search import SearchRequest, SearchResponse, SearchResult

router = APIRouter()


@router.post("", response_model=SearchResponse)
async def semantic_search(body: SearchRequest, db: AsyncSession = Depends(get_session)):
    if not body.query.strip():
        raise HTTPException(status_code=422, detail="Query must not be empty")

    vectors = await embed_chunks([body.query])
    query_vector = vectors[0]

    rows = await db.execute(
        text("""
            SELECT
                c.id          AS chunk_id,
                c.document_id,
                d.source,
                c.content,
                1 - (c.embedding <=> CAST(:vec AS vector)) AS score
            FROM chunks c
            JOIN documents d ON d.id = c.document_id
            ORDER BY c.embedding <=> CAST(:vec AS vector)
            LIMIT :lim
        """),
        {"vec": str(query_vector), "lim": body.limit},
    )

    results = [
        SearchResult(
            chunk_id=row.chunk_id,
            document_id=row.document_id,
            source=row.source,
            content=row.content,
            score=float(row.score),
        )
        for row in rows
    ]
    return SearchResponse(results=results)
