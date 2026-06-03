import os
from datetime import UTC, datetime

from db.database import get_session
from db.models import Chunk, DraftOutput, ResearchSession
from fastapi import APIRouter, Depends, HTTPException
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..schemas.draft import DraftOut, DraftRequest

router = APIRouter()

_model = os.getenv("LLM_MODEL", "granite-3.1-8b-instruct")


def _llm() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url=os.getenv("LLM_BASE_URL", "http://localhost:8000/v1"),
        api_key=os.getenv("LLM_API_KEY", "unused"),
    )


@router.post("", response_model=DraftOut, status_code=201)
async def generate_draft(body: DraftRequest, db: AsyncSession = Depends(get_session)):
    row = await db.execute(
        select(ResearchSession)
        .where(ResearchSession.id == body.session_id)
        .options(selectinload(ResearchSession.snippets))
    )
    session = row.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.snippets:
        raise HTTPException(status_code=422, detail="Session has no snippets — add content before drafting")

    snippets_sorted = sorted(session.snippets, key=lambda s: s.order)
    chunk_ids = [s.chunk_id for s in snippets_sorted]

    chunks_row = await db.execute(select(Chunk).where(Chunk.id.in_(chunk_ids)))
    chunks_by_id = {c.id: c for c in chunks_row.scalars().all()}

    context_text = "\n\n---\n\n".join(chunks_by_id[cid].content for cid in chunk_ids if cid in chunks_by_id)

    focus_instruction = f" Focus specifically on: {body.focus}." if body.focus else ""
    instruction = (
        "You are a scientific writing assistant. Using the research excerpts below, "
        "write a coherent draft report with an introduction, body sections, and "
        f"conclusion.{focus_instruction}"
    )
    prompt = (
        f"{instruction}\n\n"
        "Keep the tone formal and objective. Do not add information beyond what is "
        "provided in the excerpts.\n\n"
        f"--- RESEARCH EXCERPTS ---\n{context_text}\n--- END EXCERPTS ---\n\nDraft report:"
    )

    completion = await _llm().chat.completions.create(
        model=_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2048,
    )

    content = completion.choices[0].message.content or ""

    draft = DraftOutput(session_id=body.session_id, content=content, created_at=datetime.now(UTC))
    db.add(draft)
    await db.commit()
    await db.refresh(draft)

    return DraftOut(id=draft.id, session_id=draft.session_id, content=draft.content, created_at=draft.created_at)


@router.get("/{session_id}", response_model=list[DraftOut])
async def list_drafts(session_id: int, db: AsyncSession = Depends(get_session)):
    rows = await db.execute(
        select(DraftOutput).where(DraftOutput.session_id == session_id).order_by(DraftOutput.created_at.desc())
    )
    return [
        DraftOut(id=d.id, session_id=d.session_id, content=d.content, created_at=d.created_at) for d in rows.scalars()
    ]
