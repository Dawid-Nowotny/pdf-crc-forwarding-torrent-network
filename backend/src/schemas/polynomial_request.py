from pydantic import BaseModel, field_validator

class PolynomialRequest(BaseModel):
    polynomial: str
    
    @field_validator("polynomial")
    def validate_polynomial(cls, polynomial: str) -> str:
        if not all(bit in "01" for bit in polynomial):
            raise ValueError("Polynomial must be a binary string")
        if len(polynomial) not in (8, 16, 32):
            raise ValueError("Polynomial length must be 8, 16, or 32 bits")
        return polynomial