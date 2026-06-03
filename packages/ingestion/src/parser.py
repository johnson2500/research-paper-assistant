"""Parse PDF, URL, and plain text into raw string content."""
import io
import httpx
import trafilatura
from pypdf import PdfReader

MAX_BYTES = 250 * 1024 * 1024  # 250 MB


def parse_pdf(data: bytes) -> str:
    if len(data) > MAX_BYTES:
        raise ValueError(f"PDF exceeds 250 MB limit ({len(data)} bytes)")
    reader = PdfReader(io.BytesIO(data))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


async def parse_url(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()
        if len(response.content) > MAX_BYTES:
            raise ValueError("URL content exceeds 250 MB limit")
    text = trafilatura.extract(response.text)
    if not text:
        raise ValueError(f"Could not extract text from {url}")
    return text


def parse_text(content: str) -> str:
    if len(content.encode()) > MAX_BYTES:
        raise ValueError("Text content exceeds 250 MB limit")
    return content
