"""Embed text chunks via vLLM OpenAI-compatible endpoint."""

import os

from openai import AsyncOpenAI

_BATCH_SIZE = 32


def _client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url=os.getenv("EMBED_BASE_URL", "http://localhost:8001/v1"),
        api_key=os.getenv("EMBED_API_KEY", "unused"),
    )


async def embed_chunks(chunks: list[str]) -> list[list[float]]:
    """Return one embedding vector per chunk. Batches requests to avoid payload limits."""
    if not chunks:
        return []
    client = _client()
    model = os.getenv("EMBED_MODEL", "nomic-embed-text")
    results: list[list[float]] = []
    for i in range(0, len(chunks), _BATCH_SIZE):
        batch = chunks[i : i + _BATCH_SIZE]
        response = await client.embeddings.create(input=batch, model=model)
        results.extend(item.embedding for item in response.data)
    return results
