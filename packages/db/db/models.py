from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(2048))  # URL or filename
    content_type: Mapped[str] = mapped_column(String(32))  # pdf | url | text
    ingested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    chunks: Mapped[list["Chunk"]] = relationship(back_populates="document")


class Chunk(Base):
    __tablename__ = "chunks"

    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"))
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(768))
    chunk_index: Mapped[int] = mapped_column(Integer)
    document: Mapped["Document"] = relationship(back_populates="chunks")


class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    snippets: Mapped[list["SessionSnippet"]] = relationship(back_populates="session")
    drafts: Mapped[list["DraftOutput"]] = relationship(back_populates="session")


class SessionSnippet(Base):
    __tablename__ = "session_snippets"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("research_sessions.id"))
    chunk_id: Mapped[int] = mapped_column(ForeignKey("chunks.id"))
    order: Mapped[int] = mapped_column(Integer, default=0)
    annotation: Mapped[str | None] = mapped_column(Text, nullable=True)
    session: Mapped["ResearchSession"] = relationship(back_populates="snippets")


class DraftOutput(Base):
    __tablename__ = "draft_outputs"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("research_sessions.id"))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    session: Mapped["ResearchSession"] = relationship(back_populates="drafts")
