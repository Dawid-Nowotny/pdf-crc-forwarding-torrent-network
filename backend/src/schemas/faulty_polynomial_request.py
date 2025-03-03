from pydantic import BaseModel, field_validator

from src.constants import NODE_PORTS

class FaultyPolynomialRequest(BaseModel):
    polynomial: str
    faulty_node: str
    faulty_polynomial: str
    
    @field_validator("faulty_node")
    def validate_nodes(cls, node: str) -> str:
        if node not in NODE_PORTS:
            raise ValueError(f"Invalid node: {node}")
        return node

    @field_validator("faulty_polynomial", "polynomial")
    def validate_polynomial(cls, polynomial: str) -> str:
        if not all(bit in "01" for bit in polynomial):
            raise ValueError("Polynomial must be a binary string")
        if len(polynomial) not in (8, 16, 32):
            raise ValueError("Polynomial length must be 8, 16, or 32 bits")
        return polynomial