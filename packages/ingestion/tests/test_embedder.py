from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ingestion.embedder import embed_chunks


@pytest.mark.asyncio
async def test_embed_chunks_empty():
    result = await embed_chunks([])
    assert result == []


@pytest.mark.asyncio
async def test_embed_chunks_batches():
    fake_embedding = [0.1] * 768
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=fake_embedding)]

    mock_client = MagicMock()
    mock_client.embeddings.create = AsyncMock(return_value=mock_response)

    with patch("ingestion.embedder._client", return_value=mock_client):
        result = await embed_chunks(["hello world"])

    assert len(result) == 1
    assert len(result[0]) == 768
