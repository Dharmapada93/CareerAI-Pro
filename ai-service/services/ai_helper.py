import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

# Load env vars
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
IS_MOCK_MODE = not api_key

llm = None
if api_key:
    genai.configure(api_key=api_key)
    os.environ["GOOGLE_API_KEY"] = api_key
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)
    except Exception as e:
        print(f"Error initializing LangChain ChatGoogleGenerativeAI: {e}")

def clean_json_response(text: str) -> dict:
    """Helper to extract JSON object from AI output."""
    try:
        # Try to find JSON content enclosed in triple backticks
        match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if match:
            return json.loads(match.group(1).strip())
        
        # Try to find any content enclosed in curly braces
        match = re.search(r"(\{.*\})", text, re.DOTALL)
        if match:
            return json.loads(match.group(1).strip())
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error parsing JSON from response: {e}. Raw response: {text}")
        raise ValueError("AI response did not contain valid JSON.")

def generate_resume_summary(skills: list, experience: list) -> str:
    if IS_MOCK_MODE:
        skills_str = ", ".join(skills) if skills else "Web Development, TypeScript"
        return f"Results-driven Software Engineer with extensive expertise in {skills_str}. Proven track record of developing highly performant, responsive web applications and scalable web systems. Adept at leveraging modern methodologies and collaborating in cross-functional teams to build next-generation career solutions."
    
    try:
        if llm:
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_template(
                "Generate a professional, compelling, and modern 3-4 sentence resume summary based on:\n"
                "Skills: {skills}\n"
                "Experience details: {experience}\n"
                "Output ONLY the summary string itself. Do not include markdown headers or extra quotes."
            )
            chain = prompt | llm
            response = chain.invoke({"skills": skills, "experience": experience})
            return response.content.strip()
        else:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            Generate a professional, compelling, and modern 3-4 sentence resume summary based on:
            Skills: {skills}
            Experience details: {experience}
            Output ONLY the summary string itself. Do not include markdown headers or extra quotes.
            """
            response = model.generate_content(prompt)
            return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        return "Dedicated professional with experience in modern software engineering practices, specializing in constructing high-performance user interfaces and robust APIs."

def generate_resume_bullets(role: str, bullet_point: str) -> list:
    if IS_MOCK_MODE:
        return [
            f"Designed and deployed responsive components for the {role} platform, improving page load speed by 25% using Next.js.",
            f"Collaborated closely with designers and product managers to refine the product requirements, resulting in a 15% increase in user retention.",
            f"Optimized database indexing and implemented Redis caching, reducing API endpoint latencies by 40%."
        ]
    
    try:
        if llm:
            from langchain_core.prompts import ChatPromptTemplate
            prompt = ChatPromptTemplate.from_template(
                "Take this raw resume bullet point: \"{bullet_point}\" for the role of \"{role}\".\n"
                "Refine it using the STAR methodology (Situation, Task, Action, Result).\n"
                "Generate 3 high-impact, professional, and action-verb filled alternatives.\n"
                "Output your response as a JSON array of strings:\n"
                "[\"Alternative 1\", \"Alternative 2\", \"Alternative 3\"]\n"
                "Return ONLY valid JSON."
            )
            chain = prompt | llm
            response = chain.invoke({"bullet_point": bullet_point, "role": role})
            return clean_json_response(response.content)
        else:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            Take this raw resume bullet point: "{bullet_point}" for the role of "{role}".
            Refine it using the STAR methodology (Situation, Task, Action, Result).
            Generate 3 high-impact, professional, and action-verb filled alternatives.
            Output your response as a JSON array of strings:
            ["Alternative 1", "Alternative 2", "Alternative 3"]
            Return ONLY valid JSON.
            """
            response = model.generate_content(prompt)
            return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return [f"Key contributor in delivering {role} features and resolving application bottlenecks."]

def analyze_ats_score(resume_text: str, job_description: str) -> dict:
    if IS_MOCK_MODE:
        return {
            "score": 78,
            "missingKeywords": ["Next.js 14", "Docker", "Mongoose", "CI/CD Pipelines", "Redis"],
            "formattingSuggestions": [
                "Structure your experience chronologically.",
                "Ensure that dates are aligned consistently on the right-hand margin.",
                "Shorten bullet points to not exceed two lines."
            ],
            "skillGapAnalysis": [
                "The job description requires hands-on containerization (Docker) and deployment pipelines, which are lacking or barely referenced in your resume.",
                "Advanced state management concepts could be elaborated further."
            ],
            "improvementTips": [
                "Quantify achievements in your experience section (e.g., 'reduced latency by 30%', 'managed 5 repositories').",
                "Integrate missing keywords such as 'CI/CD' and 'Next.js 14' naturally in your project descriptions."
            ]
        }
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Analyze this resume text against the job description.
        Resume:
        ---
        {resume_text}
        ---
        Job Description:
        ---
        {job_description}
        ---
        Evaluate and return a JSON object with:
        - "score" (integer, 0-100)
        - "missingKeywords" (array of strings)
        - "formattingSuggestions" (array of strings)
        - "skillGapAnalysis" (array of strings)
        - "improvementTips" (array of strings)
        
        Ensure valid JSON format. Return ONLY the JSON object.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return {
            "score": 60,
            "missingKeywords": ["Database optimization", "TypeScript APIs"],
            "formattingSuggestions": ["Fix line margins"],
            "skillGapAnalysis": ["General lack of structural design details"],
            "improvementTips": ["Include more bullet points describing custom projects"]
        }

def generate_interview_questions(role: str, experience_level: str) -> list:
    if IS_MOCK_MODE:
        return [
            "Explain the difference between Server and Client Components in Next.js 14 App Router.",
            "How does MongoDB handle indexing, and what strategies would you use to optimize a slow find() query?",
            "Can you explain your experience with state management in React, and when you'd choose Context API over Redux or Zustand?",
            "What is your approach to handling error boundaries and loading states in dynamic dashboard layouts?",
            "Describe a time when you had to debug a memory leak or severe performance bottleneck in a JavaScript/TypeScript application."
        ]
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Generate 5 distinct technical and behavioral mock interview questions for the role of a {role} at an {experience_level} level.
        Return your answer as a JSON array of strings:
        ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
        Ensure valid JSON format. Return ONLY the JSON array.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return [
            "Explain your technical stack and why it is suitable for building scalable web apps.",
            "Explain the role of middleware in routing and authentication handlers."
        ]

def evaluate_interview_answer(question: str, user_answer: str) -> dict:
    if IS_MOCK_MODE:
        word_count = len(user_answer.split())
        tech_score = min(40 + word_count * 2, 92) if word_count > 5 else 30
        comm_score = min(50 + word_count * 1.5, 95) if word_count > 5 else 40
        conf_score = min(60 + word_count, 90) if word_count > 5 else 50
        return {
            "technical": tech_score,
            "communication": comm_score,
            "confidence": conf_score,
            "feedback": "Your answer demonstrates a solid fundamental grasp, but lacks technical depth. Try incorporating specific terminology (e.g., rendering phases, index types) and explaining the practical application of your approach.",
            "improvedAnswer": "To answer this question optimally, begin by defining the core concepts, discuss the pros/cons, and finish by detailing a real-world scenario where you implemented this design pattern successfully."
        }
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Evaluate the user's answer to the mock interview question.
        Question: "{question}"
        User's Answer: "{user_answer}"
        
        Generate a JSON object containing:
        - "technical" (integer score 0-100)
        - "communication" (integer score 0-100)
        - "confidence" (integer score 0-100)
        - "feedback" (detailed string critique with improvements)
        - "improvedAnswer" (a professional version of how to answer the question perfectly)
        
        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return {
            "technical": 70,
            "communication": 75,
            "confidence": 80,
            "feedback": "Good response. Elaborate more on the technical backend details.",
            "improvedAnswer": "Provide a structured example using modern architecture concepts."
        }

def generate_cover_letter(company: str, role: str, skills: list, experience: str) -> str:
    if IS_MOCK_MODE:
        skills_str = ", ".join(skills) if skills else "TypeScript, Next.js, and Node.js"
        return f"""Dear Hiring Manager at {company},

I am writing to express my enthusiastic interest in the {role} position. With my background in software development and specialized expertise in {skills_str}, I am confident in my ability to make an immediate impact on your engineering team.

My technical background includes {experience} of building responsive, accessible web applications and developing performant backend APIs. I focus on writing modular, self-documenting code and optimizing user interfaces for performance. The opportunity to contribute to {company}'s innovative projects is highly exciting to me.

Thank you for your time and consideration. I look forward to the possibility of discussing how my skills align with your engineering needs.

Sincerely,
[Your Name]"""
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Generate a premium, professional, and personalized cover letter.
        Company: {company}
        Role: {role}
        Key Skills: {skills}
        Experience Details: {experience}
        Output ONLY the plain text cover letter. Do not include markdown styling or formatting markers.
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini error: {e}")
        return "Dear Hiring Team,\n\nI am writing to express my interest in the position. I have strong skills in programming and web design."

def generate_portfolio_content(personal_info: dict, skills: list, projects: list) -> dict:
    if IS_MOCK_MODE:
        return {
            "heroTitle": f"Hi, I'm {personal_info.get('name', 'Developer')}",
            "heroSubtitle": f"Building premium, responsive web platforms and user-centric systems. Specializing in React, Node.js, and scaling APIs.",
            "aboutMe": f"I am a passionate software engineer focused on building interactive, premium visual experiences. I enjoy resolving complex architecture challenges and developing production-grade web products.",
            "projectSubtitles": {p.get("title", f"Project {i}"): f"A full-stack implementation utilizing React and modern databases." for i, p in enumerate(projects)}
        }
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Generate premium portfolio content based on:
        Personal Info: {personal_info}
        Skills: {skills}
        Projects: {projects}
        
        Generate a JSON object containing:
        - "heroTitle" (string)
        - "heroSubtitle" (string)
        - "aboutMe" (string, detailed paragraph)
        - "projectSubtitles" (JSON object mapping project titles to dynamic professional descriptions)
        
        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini error: {e}")
        return {
            "heroTitle": "Welcome to my portfolio",
            "heroSubtitle": "Software Engineer",
            "aboutMe": "I write code to solve real-world problems.",
            "projectSubtitles": {}
        }

def tailor_resume(resume_data: dict, job_description: str) -> dict:
    if IS_MOCK_MODE:
        skills_list = resume_data.get("skills", [])
        return {
            "tailoredSummary": f"Detail-oriented and results-driven professional matching the required profile. Expert in {', '.join(skills_list[:3]) if skills_list else 'modern tech'} and software architectures to solve complex business cases outlined in the job description.",
            "tailoredSkills": list(set(skills_list + ["Next.js 14", "Agile Methodologies", "Cloud Infrastructures"])),
            "tailoredProjects": [
                {
                    "title": p.get("title", "Project"),
                    "description": p.get("description", "") + " Enhanced project setup specifically mapping to ATS core competencies in the job description."
                } for p in resume_data.get("projects", [])
            ]
        }
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Tailor this resume data to fit this job description. Focus on emphasizing matched keywords and technologies.
        Resume Data: {json.dumps(resume_data)}
        Job Description: {job_description}
        
        Evaluate and return a JSON object with:
        - "tailoredSummary" (rewritten professional summary string)
        - "tailoredSkills" (list of skills that match the JD)
        - "tailoredProjects" (list of projects with rewritten description fields emphasizing matched capabilities)
        
        Return ONLY the valid JSON object.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in tailoring: {e}")
        return tailor_resume(resume_data, "")

def change_resume_tone(text: str, tone: str) -> str:
    if IS_MOCK_MODE:
        if tone.lower() == "bold":
            return f"Championed engineering excellence: {text} (Delivered with high impact and measurable success metrics)."
        elif tone.lower() == "executive":
            return f"Strategized and directed: {text} (Focused on cross-functional alignment and bottom-line scaling)."
        elif tone.lower() == "minimalist":
            return f"{text} (Refactored for concise impact)."
        return text

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Rewrite the following text to have a "{tone}" tone (e.g. Bold, Executive, Minimalist, or Professional).
        Text: "{text}"
        Return ONLY the rewritten string text. Do not include quotes or formatting.
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini tone change error: {e}")
        return text

def correct_grammar(text: str) -> dict:
    if IS_MOCK_MODE:
        return {
            "correctedText": text,
            "errorsFound": [],
            "suggestions": ["Grammar check passed (Mock Mode)."]
        }
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Perform a thorough proofreading of the following text. Look for grammatical errors, typos, and style issues.
        Text: "{text}"
        
        Return a JSON object containing:
        - "correctedText" (string)
        - "errorsFound" (array of strings showing error descriptions)
        - "suggestions" (array of strings with enhancement recommendations)
        
        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini grammar check error: {e}")
        return {"correctedText": text, "errorsFound": [], "suggestions": ["Check failed: API unavailable"]}

def enhance_achievements(bullet: str) -> list:
    if IS_MOCK_MODE:
        return [
            f"{bullet} - resulting in a 25% decrease in page render times and a 15% uptick in client satisfaction.",
            f"Spearheaded {bullet} which increased code deployment velocity by 40% using automated workflows.",
            f"Drove the development of {bullet}, optimizing backend database queries to reduce API latency by 35ms."
        ]
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Take this task or accomplishment description: "{bullet}"
        Rewrite it to focus on metric-driven achievements using action verbs (STAR methodology). Provide 3 distinct variants.
        Return your answer as a JSON array of strings:
        ["Variant 1", "Variant 2", "Variant 3"]
        Return ONLY the JSON array.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini enhance achievements error: {e}")
        return [f"Successfully completed: {bullet}"]

def generate_career_roadmap(target_role: str, current_skills: list) -> dict:
    if IS_MOCK_MODE:
        return {
            "role": target_role,
            "milestones": [
                {"step": 1, "title": "Master Advanced Architecture", "duration": "1-2 Months", "details": f"Focus on core concepts related to {target_role} and scale caching strategies."},
                {"step": 2, "title": "Portfolio Construction & Open Source", "duration": "2-3 Months", "details": "Build complex visual projects showing end-to-end design configurations."},
                {"step": 3, "title": "System Design Prep & Application", "duration": "3-4 Months", "details": "Practice distributed systems, caching hierarchies, and apply to relevant positions."}
            ],
            "recommendedSkills": ["Next.js 14", "Docker", "FastAPI", "System Design"]
        }
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Generate a step-by-step career transition roadmap for a user targeting the role of: "{target_role}" with these current skills: {current_skills}.
        
        Return a JSON object containing:
        - "role" (string)
        - "milestones" (an array of objects, each with: "step" [int], "title" [string], "duration" [string], "details" [string])
        - "recommendedSkills" (an array of strings showing missing key technologies they should study)
        
        Ensure valid JSON format. Return ONLY the JSON object.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini career roadmap error: {e}")
        return generate_career_roadmap(target_role, [])

def generate_learning_plan(skill_gap: list) -> dict:
    if IS_MOCK_MODE:
        return {
            "planTitle": f"Learning Curricular for Gaps",
            "modules": [
                {"title": f"Module 1: Deep dive in {s}", "duration": "2 weeks", "topics": ["Foundational concepts", "Practical implementations", "Best practices"], "resources": ["Official Documentation", "GitHub repositories"]}
                for s in skill_gap
            ]
        }
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Create a detailed educational learning curriculum for a software engineer to fill these specific skill gaps: {skill_gap}.
        
        Return a JSON object containing:
        - "planTitle" (string)
        - "modules" (an array of objects, each with: "title" [string], "duration" [string], "topics" [array of strings], "resources" [array of strings])
        
        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini learning plan error: {e}")
        return {"planTitle": "Learning Plan", "modules": []}

def generate_job_outreach(company: str, role: str, context: str) -> str:
    if IS_MOCK_MODE:
        return f"""Subject: Inquiring about {role} opportunities at {company}

Dear Hiring Team,

I hope this message finds you well. I am writing to express my interest in the {role} role at {company}.

Based on {context or 'my technical background in full-stack engineering'}, I am excited to apply my skills to build high-performance products for your team.

Attached is my resume. I look forward to connecting soon!

Best regards,
[Your Name]"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Write a professional outreach/follow-up email from a job seeker to a recruiter or hiring manager.
        Company: {company}
        Role: {role}
        Additional Context: {context}
        
        Output ONLY the plain text email. Do not add markdown style elements.
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini outreach error: {e}")
        return "Dear Hiring Manager,\n\nI am following up on my application for the role."

def generate_negotiation_script(role: str, offer_details: str) -> dict:
    if IS_MOCK_MODE:
        return {
            "strategy": "Emphasize market data and technical capabilities. Keep tone collaborative and polite.",
            "talkingPoints": [
                "Express enthusiasm about the team and alignment with company goals.",
                f"Reference market averages for a {role} matching similar scope.",
                "Inquire if there is flexibility in base salary or performance bonuses."
            ],
            "scripts": [
                {"scenario": "Base Salary Discussion", "dialogue": "Thank you so much for the offer. I'm excited about the team. Given my experience scaling React applications and node microservices, I was hoping we could explore a base salary closer to market averages..."}
            ]
        }
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Draft a salary negotiation guidance sheet and script for a candidate who received an offer for the role: "{role}" with these details: "{offer_details}".
        
        Return a JSON object containing:
        - "strategy" (string summarizing the approach)
        - "talkingPoints" (array of strings with tips)
        - "scripts" (array of objects with fields: "scenario" [string] and "dialogue" [string])
        
        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini negotiation script error: {e}")
        return {"strategy": "Polite inquiry", "talkingPoints": [], "scripts": []}

def generate_linkedin_bio(role: str, key_skills: list) -> list:
    if IS_MOCK_MODE:
        skills_str = ", ".join(key_skills)
        return [
            f"Software Engineer specializing in {role}. Experienced in developing fast APIs and responsive visual systems using {skills_str}.",
            f"Passionate builder & architect | Creating premium user interfaces and backend applications for {role} roles. Skilled in {skills_str}.",
            f"Driving innovation in software development. Tech-focused engineering professional specializing in {role} and {skills_str} deployments."
        ]
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Generate 3 high-impact LinkedIn headlines/bios for a professional aiming for a "{role}" role, incorporating these skills: {key_skills}.
        Return as a JSON array of strings:
        ["Bio 1", "Bio 2", "Bio 3"]
        Return ONLY valid JSON.
        """
        response = model.generate_content(prompt)
        return clean_json_response(response.text)
    except Exception as e:
        print(f"Gemini LinkedIn bio error: {e}")
        return [f"Professional Software Engineer specialized in {role}"]

