from sqlalchemy import Column, Integer, Text

from app.core.database import Base


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    resume_text = Column(Text, nullable=False)
    job_description = Column(Text, nullable=False)
    match_percentage = Column(Integer, nullable=False)
    missing_skills = Column(Text, nullable=False)
    improvement_suggestions = Column(Text, nullable=False)
    tailored_summary = Column(Text, nullable=False)
