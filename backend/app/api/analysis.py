import json

from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import AnalysisHistory
from app.services.gemini_service import analyze_resume_with_gemini

router = APIRouter(prefix="/analysis", tags=["Analysis"])


class AnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=1)
    job_description: str = Field(min_length=1)


@router.post("/preview")
def preview_analysis(payload: AnalysisRequest) -> dict[str, str | int]:
    return {
        "message": "Analysis request received",
        "resume_characters": len(payload.resume_text),
        "job_description_characters": len(payload.job_description),
    }


@router.post("/run")
def run_analysis(payload: AnalysisRequest) -> dict[str, object]:
    result = analyze_resume_with_gemini(
        resume_text=payload.resume_text,
        job_description=payload.job_description,
    )

    db = SessionLocal()
    db_record = AnalysisHistory(
        resume_text=payload.resume_text,
        job_description=payload.job_description,
        match_percentage=result.match_percentage,
        missing_skills=json.dumps(result.missing_skills),
        improvement_suggestions=json.dumps(result.improvement_suggestions),
        tailored_summary=result.tailored_summary,
    )
    db.add(db_record)
    db.commit()
    db.close()

    return result.model_dump()


@router.get("/history")
def get_analysis_history() -> list[dict[str, object]]:
    db = SessionLocal()
    records = db.execute(
        select(AnalysisHistory).order_by(AnalysisHistory.id.desc())
    ).scalars().all()
    db.close()

    return [
        {
            "id": record.id,
            "match_percentage": record.match_percentage,
            "missing_skills": json.loads(record.missing_skills),
            "improvement_suggestions": json.loads(record.improvement_suggestions),
            "tailored_summary": record.tailored_summary,
        }
        for record in records
    ]
