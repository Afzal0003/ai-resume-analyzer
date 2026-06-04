import json

from google import genai
from pydantic import BaseModel, Field

from app.core.config import settings


class ResumeAnalysisResult(BaseModel):
    match_percentage: int = Field(description="Overall match score from 0 to 100.")
    missing_skills: list[str] = Field(
        description="Important skills missing from the resume."
    )
    improvement_suggestions: list[str] = Field(
        description="Clear suggestions to improve the resume for this job."
    )
    tailored_summary: str = Field(
        description="A short tailored professional summary for the resume."
    )


def analyze_resume_with_gemini(
    resume_text: str, job_description: str
) -> ResumeAnalysisResult:
    if not settings.gemini_api_key:
      raise ValueError("Gemini API key is missing")

    client = genai.Client(api_key=settings.gemini_api_key)

    prompt = f"""
You are an expert resume analyzer.

Compare the resume and the job description.
Return:
1. A match percentage from 0 to 100
2. A list of missing skills
3. A list of practical resume improvement suggestions
4. A short tailored resume summary

Resume:
{resume_text}

Job Description:
{job_description}
""".strip()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ResumeAnalysisResult,
        },
    )

    if response.parsed:
        return response.parsed

    return ResumeAnalysisResult.model_validate(json.loads(response.text))
