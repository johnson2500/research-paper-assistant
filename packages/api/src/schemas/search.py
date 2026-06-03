from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResult(BaseModel):
    chunk_id: int
    document_id: int
    source: str
    content: str
    score: float


class SearchResponse(BaseModel):
    results: list[SearchResult]
