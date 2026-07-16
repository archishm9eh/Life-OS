import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import httpx

# 1. Load Environment Variables
load_dotenv()

app = FastAPI(title="Life-OS Secure Core Backend")

# 2. Configure CORS (Allows React to communicate with FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React port (e.g., ["http://localhost:5173"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB Client
MONGO_DETAILS = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client["life_os_db"]

# Grab Gemini API Key safely from the environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# --- PYDANTIC BLUEPRINTS (Data Models) ---

class GoalItem(BaseModel):
    id: str
    text: str
    completed: bool

class GoalsPayload(BaseModel):
    goals: List[GoalItem]

class JournalEntry(BaseModel):
    date: str
    content: str
    mood: Optional[str] = "neutral"

class GeminiPrompt(BaseModel):
    prompt: str


# --- ENDPOINTS ---

# 1. Base Ping Route (Test connection)
@app.get("/")
async def root():
    try:
        await client.admin.command('ping')
        return {"status": "Online", "database": "Connected successfully! 🎉"}
    except Exception as e:
        return {"status": "Online", "database": f"Offline. Error: {str(e)}"}


# 2. GOALS ENDPOINTS (Upgraded to support today vs tomorrow)
@app.get("/api/goals")
async def get_goals(type: str = "today"):  # Defaults to "today" if not specified
    goals_doc = await db.goals.find_one({"_id": f"user_goals_{type}"})
    if not goals_doc:
        return {"goals": []}
    return {"goals": goals_doc.get("goals", [])}

@app.post("/api/goals")
async def save_goals(payload: GoalsPayload, type: str = "today"):
    await db.goals.update_one(
        {"_id": f"user_goals_{type}"},
        {"$set": {"goals": [goal.model_dump() for goal in payload.goals]}},
        upsert=True
    )
    return {"status": "success", "message": f"{type.capitalize()} goals synced to cloud!"}

@app.post("/api/goals")
async def save_goals(payload: GoalsPayload):
    # Upsert: Save or update the goals document in the database
    await db.goals.update_one(
        {"_id": "user_goals"},
        {"$set": {"goals": [goal.model_dump() for goal in payload.goals]}},
        upsert=True
    )
    return {"status": "success", "message": "Goals synced to cloud!"}


# 3. JOURNAL ENDPOINTS
@app.get("/api/journal")
async def get_journals():
    # Fetch all journal entries, sorted by date descending
    cursor = db.journals.find({}, {"_id": 0})
    journals = await cursor.to_list(length=100)
    return {"journals": journals}

@app.post("/api/journal")
async def save_journal(entry: JournalEntry):
    # Upsert a journal entry for a specific date
    await db.journals.update_one(
        {"date": entry.date},
        {"$set": entry.model_dump()},
        upsert=True
    )
    return {"status": "success", "message": "Journal saved to cloud!"}


# 4. SECURE GEMINI AI ENDPOINT (Proxy)
@app.post("/api/ai/chat")
async def ask_gemini(payload: GeminiPrompt):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing on the server.")

    # We call the official Google Gemini API safely from the backend
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{"text": payload.prompt}]
        }]
    }

    async with httpx.AsyncClient() as client_http:
        try:
            response = await client_http.post(gemini_url, json=data, headers=headers)
            response.raise_for_status()
            result = response.json()
            
            # Extract the text response from Gemini's JSON structure
            ai_response_text = result['candidates'][0]['content']['parts'][0]['text']
            return {"response": ai_response_text}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")