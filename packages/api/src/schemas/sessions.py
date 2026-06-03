from datetime import datetime

from pydantic import BaseModel


class SessionCreate(BaseModel):
    name: str


class SnippetAdd(BaseModel):
    chunk_id: int
    annotation: str | None = None


class SnippetOut(BaseModel):
    id: int
    chunk_id: int
    content: str
    source: str
    order: int
    annotation: str | None

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    snippets: list[SnippetOut] = []

    model_config = {"from_attributes": True}
