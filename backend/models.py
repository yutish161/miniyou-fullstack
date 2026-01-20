from pydantic import BaseModel
from typing import List

class RepoSummary(BaseModel):
    tech_stack: List[str]
    key_files: List[str]
    description: str
    suggestions: List[str]
