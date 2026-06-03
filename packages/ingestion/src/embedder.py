"""Embed chunks via vLLM OpenAI-compatible endpoint."""
import os
from openai import AsyncOpenAI

_client = AsyncOpenAI(
    base_url=os.getenv("EMBED_BASE_URL", "http://localhost:8001/v1"),
    api_key=os.getenv("EMBED_API_KEY", "unused"),
)
_model = os.getenv("EMBED_MODEL", "nomic-embed-text")


async def embed_chunks(chunks: list[str]) -> list[list[float]]:
    response = await _client.embeddings.create(input=chunks, model=_model)
    return [item.embedding for item in response.data]
