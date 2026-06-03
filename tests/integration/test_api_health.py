import httpx
import pytest

API_URL = "http://localhost:8080"


@pytest.mark.asyncio
async def test_health():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_URL}/health")
    assert response.status_code == 200
