from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/extract")
async def extract_resume_text(file: UploadFile = File(...)) -> dict[str, str]:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_bytes = await file.read()
    extracted_text = extract_text_from_pdf(file_bytes)

    if not extracted_text:
        raise HTTPException(status_code=400, detail="No text found in PDF")

    return {"filename": file.filename or "resume.pdf", "text": extracted_text}
