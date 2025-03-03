from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader
from pypdf.errors import PdfReadError

import io
import os
import random

async def validate_pdf(file: UploadFile):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF files are allowed."
        )

    file_content = await file.read()
    if not file_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF file is empty."
        )
    
    try:
        PdfReader(io.BytesIO(file_content))
    except PdfReadError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid PDF."
        )
    
def corrupt_file(file_path: str) -> None:
    with open(file_path, "r+b") as f:
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return

        f.seek(random.randint(0, file_size - 1))
        f.write(bytes([random.randint(0, 255)]))