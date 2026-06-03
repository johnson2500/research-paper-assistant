from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from db.database import get_session
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.mark.asyncio
async def test_search_empty_query():
    mock_db = AsyncMock()
    app.dependency_overrides[get_session] = lambda: mock_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/search", json={"query": "   ", "limit": 5})

    app.dependency_overrides.clear()
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_search_returns_results():
    mock_db = AsyncMock()

    fake_row = MagicMock()
    fake_row.chunk_id = 1
    fake_row.document_id = 1
    fake_row.source = "http://example.com"
    fake_row.content = "Some content"
    fake_row.score = 0.95

    mock_result = MagicMock()
    mock_result.__iter__ = MagicMock(return_value=iter([fake_row]))
    mock_db.execute = AsyncMock(return_value=mock_result)
    app.dependency_overrides[get_session] = lambda: mock_db

    with patch("src.routers.search.embed_chunks", new=AsyncMock(return_value=[[0.1] * 768])):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/search", json={"query": "climate change", "limit": 5})

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "results" in response.json()
