from pydantic import BaseModel, HttpUrl


class IngestURLRequest(BaseModel):
    url: HttpUrl


class IngestTextRequest(BaseModel):
    content: str
    title: str = "Untitled"


class IngestResponse(BaseModel):
    document_id: int
    source: str
    chunk_count: int
