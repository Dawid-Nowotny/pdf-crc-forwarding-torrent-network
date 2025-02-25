from pydantic import BaseModel, field_validator

from src.constants import NODE_PORTS

class PDFRequest(BaseModel):
    first_seeder: str
    target_node: str

    @field_validator("first_seeder", "target_node")
    def validate_nodes(cls, node: str) -> str:
        if node not in NODE_PORTS:
            raise ValueError(f"Invalid node: {node}")
        return node

    @field_validator("target_node")
    def different_nodes(cls, target_node: str, first_seeder: str) -> str:
        if first_seeder is not None and first_seeder == target_node:
            raise ValueError("Admin and target nodes must be different")
        return target_node