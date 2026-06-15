import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services import ai_helper

app = FastAPI(title="CareerAI Pro - AI Microservice", version="1.0.0")

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummaryRequest(BaseModel):
    skills: List[str]
    experience: List[str]

class BulletsRequest(BaseModel):
    role: str
    bullet_point: str

class ATSRequest(BaseModel):
    resume_text: str
    job_description: str

class InterviewQuestionsRequest(BaseModel):
    role: str
    experience_level: str

class InterviewEvaluateRequest(BaseModel):
    question: str
    user_answer: str

class CoverLetterRequest(BaseModel):
    company: str
    role: str
    skills: List[str]
    experience: str

class PortfolioRequest(BaseModel):
    personal_info: Dict[str, Any]
    skills: List[str]
    projects: List[Dict[str, Any]]

class TailorRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str

class ToneRequest(BaseModel):
    text: str
    tone: str

class GrammarRequest(BaseModel):
    text: str

class AchievementRequest(BaseModel):
    bullet: str

class RoadmapRequest(BaseModel):
    target_role: str
    current_skills: List[str]

class LearningPlanRequest(BaseModel):
    skill_gap: List[str]

class OutreachRequest(BaseModel):
    company: str
    role: str
    context: Optional[str] = ""

class NegotiationRequest(BaseModel):
    role: str
    offer_details: str

class LinkedinBioRequest(BaseModel):
    role: str
    key_skills: List[str]


@app.get("/")
def read_root():
    return {"status": "healthy", "service": "CareerAI Pro AI Microservice"}

@app.post("/api/resume-summary")
def get_summary(req: SummaryRequest):
    try:
        summary = ai_helper.generate_resume_summary(req.skills, req.experience)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume-bullets")
def get_bullets(req: BulletsRequest):
    try:
        bullets = ai_helper.generate_resume_bullets(req.role, req.bullet_point)
        return {"bullets": bullets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ats-score")
def get_ats_score(req: ATSRequest):
    try:
        analysis = ai_helper.analyze_ats_score(req.resume_text, req.job_description)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/questions")
def get_questions(req: InterviewQuestionsRequest):
    try:
        questions = ai_helper.generate_interview_questions(req.role, req.experience_level)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/evaluate")
def evaluate_answer(req: InterviewEvaluateRequest):
    try:
        evaluation = ai_helper.evaluate_interview_answer(req.question, req.user_answer)
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cover-letter")
def get_cover_letter(req: CoverLetterRequest):
    try:
        cover_letter = ai_helper.generate_cover_letter(req.company, req.role, req.skills, req.experience)
        return {"cover_letter": cover_letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio")
def get_portfolio(req: PortfolioRequest):
    try:
        content = ai_helper.generate_portfolio_content(req.personal_info, req.skills, req.projects)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume-tailor")
def do_tailor(req: TailorRequest):
    try:
        return ai_helper.tailor_resume(req.resume_data, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resume-tone")
def do_tone(req: ToneRequest):
    try:
        result = ai_helper.change_resume_tone(req.text, req.tone)
        return {"text": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/grammar-correction")
def do_grammar(req: GrammarRequest):
    try:
        return ai_helper.correct_grammar(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/achievements-rewrite")
def do_achievements(req: AchievementRequest):
    try:
        bullets = ai_helper.enhance_achievements(req.bullet)
        return {"bullets": bullets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/career-roadmap")
def do_roadmap(req: RoadmapRequest):
    try:
        return ai_helper.generate_career_roadmap(req.target_role, req.current_skills)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learning-plan")
def do_learning(req: LearningPlanRequest):
    try:
        return ai_helper.generate_learning_plan(req.skill_gap)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/job-followup")
def do_followup(req: OutreachRequest):
    try:
        email = ai_helper.generate_job_outreach(req.company, req.role, req.context)
        return {"email": email}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/negotiation-script")
def do_negotiation(req: NegotiationRequest):
    try:
        return ai_helper.generate_negotiation_script(req.role, req.offer_details)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/linkedin-bio")
def do_linkedin(req: LinkedinBioRequest):
    try:
        bios = ai_helper.generate_linkedin_bio(req.role, req.key_skills)
        return {"bios": bios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("main:app", host=host, port=port, reload=True)

