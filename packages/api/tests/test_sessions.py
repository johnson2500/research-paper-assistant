from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from db.database import get_session
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.mark.asyncio
async def test_create_session():
    mock_db = AsyncMock()
    mock_db.flush = AsyncMock()
    mock_db.commit = AsyncMock()

    async def fake_refresh(obj):
        obj.id = 1
        obj.created_at = datetime.now(UTC)
        obj.updated_at = datetime.now(UTC)

    mock_db.refresh = fake_refresh
    app.dependency_overrides[get_session] = lambda: mock_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/sessions", json={"name": "My Session"})

    app.dependency_overrides.clear()
    assert response.status_code == 201
    assert response.json()["name"] == "My Session"


@pytest.mark.asyncio
async def test_list_sessions_empty():
    mock_db = AsyncMock()
    result = MagicMock()
    result.scalars.return_value.all.return_value = []
    mock_db.execute = AsyncMock(return_value=result)
    app.dependency_overrides[get_session] = lambda: mock_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/sessions")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json() == []
