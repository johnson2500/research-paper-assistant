from datetime import datetime

from pydantic import BaseModel


class DraftRequest(BaseModel):
    session_id: int
    focus: str | None = None


class DraftOut(BaseModel):
    id: int
    session_id: int
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
