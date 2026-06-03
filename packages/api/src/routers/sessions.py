from datetime import datetime

from db.database import get_session
from db.models import Chunk, Document, ResearchSession, SessionSnippet
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..schemas.sessions import SessionCreate, SessionOut, SnippetAdd, SnippetOut

router = APIRouter()


@router.post("", response_model=SessionOut, status_code=201)
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_session)):
    now = datetime.utcnow()
    session = ResearchSession(name=body.name, created_at=now, updated_at=now)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return SessionOut(id=session.id, name=session.name, created_at=session.created_at, updated_at=session.updated_at)


@router.get("", response_model=list[SessionOut])
async def list_sessions(db: AsyncSession = Depends(get_session)):
    rows = await db.execute(select(ResearchSession).order_by(ResearchSession.updated_at.desc()))
    sessions = rows.scalars().all()
    return [SessionOut(id=s.id, name=s.name, created_at=s.created_at, updated_at=s.updated_at) for s in sessions]


@router.get("/{session_id}", response_model=SessionOut)
async def get_session_detail(session_id: int, db: AsyncSession = Depends(get_session)):
    row = await db.execute(
        select(ResearchSession).where(ResearchSession.id == session_id).options(selectinload(ResearchSession.snippets))
    )
    session = row.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    snippet_outs = []
    for sn in sorted(session.snippets, key=lambda x: x.order):
        chunk_row = await db.execute(
            select(Chunk, Document.source)
            .join(Document, Document.id == Chunk.document_id)
            .where(Chunk.id == sn.chunk_id)
        )
        chunk, source = chunk_row.one()
        snippet_outs.append(
            SnippetOut(
                id=sn.id,
                chunk_id=sn.chunk_id,
                content=chunk.content,
                source=source,
                order=sn.order,
                annotation=sn.annotation,
            )
        )

    return SessionOut(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        updated_at=session.updated_at,
        snippets=snippet_outs,
    )


@router.post("/{session_id}/snippets", response_model=SnippetOut, status_code=201)
async def add_snippet(session_id: int, body: SnippetAdd, db: AsyncSession = Depends(get_session)):
    session_row = await db.execute(select(ResearchSession).where(ResearchSession.id == session_id))
    session = session_row.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    chunk_row = await db.execute(
        select(Chunk, Document.source).join(Document, Document.id == Chunk.document_id).where(Chunk.id == body.chunk_id)
    )
    result = chunk_row.one_or_none()
    if not result:
        raise HTTPException(status_code=404, detail="Chunk not found")
    chunk, source = result

    count_row = await db.execute(select(SessionSnippet).where(SessionSnippet.session_id == session_id))
    order = len(count_row.scalars().all())

    snippet = SessionSnippet(session_id=session_id, chunk_id=body.chunk_id, order=order, annotation=body.annotation)
    db.add(snippet)
    session.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(snippet)

    return SnippetOut(
        id=snippet.id,
        chunk_id=snippet.chunk_id,
        content=chunk.content,
        source=source,
        order=snippet.order,
        annotation=snippet.annotation,
    )


@router.delete("/{session_id}/snippets/{snippet_id}", status_code=204)
async def remove_snippet(session_id: int, snippet_id: int, db: AsyncSession = Depends(get_session)):
    await db.execute(
        delete(SessionSnippet).where(
            SessionSnippet.id == snippet_id,
            SessionSnippet.session_id == session_id,
        )
    )
    await db.commit()


@router.delete("/{session_id}", status_code=204)
async def delete_session(session_id: int, db: AsyncSession = Depends(get_session)):
    await db.execute(delete(SessionSnippet).where(SessionSnippet.session_id == session_id))
    await db.execute(delete(ResearchSession).where(ResearchSession.id == session_id))
    await db.commit()
