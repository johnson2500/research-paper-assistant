"""Split text into overlapping chunks."""

from langchain_text_splitters import RecursiveCharacterTextSplitter

_splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)


def chunk_text(text: str) -> list[str]:
    return _splitter.split_text(text)
