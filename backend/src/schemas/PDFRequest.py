from pydantic import BaseModel, field_validator

from src.constants import NODE_PORTS

class PDFRequest(BaseModel):
    first_seeder: str
    target_node: str
    polynomial: str

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
    
    @field_validator("polynomial")
    def validate_polynomial(cls, polynomial: str) -> str:
        if not all(bit in "01" for bit in polynomial):
            raise ValueError("Polynomial must be a binary string")
        if len(polynomial) not in (8, 16, 32):
            raise ValueError("Polynomial length must be 8, 16, or 32 bits")
        return polynomial