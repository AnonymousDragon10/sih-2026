"""
MediKiosk - AI-Driven Public Health Chatbot for Disease Awareness
FastAPI Backend for Smart India Hackathon 2026

API v1 Endpoints:
  /api/v1/chat/text       - Text-based clinical history chat
  /api/v1/chat/voice       - Voice input processing (Bhashini ASR placeholder)
  /api/v1/scan/document    - Prescription/report OCR (placeholder)

Architecture:
  - PostgreSQL connection (Supabase) for patient session data
  - Native JSON columns for clinical summaries
  - Cloud-native caching placeholder (Redis-ready)
  - Rate-limiting middleware (in-memory, Redis-ready)
"""

import os
import time
import json
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL", "")

# Rate limiting config
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "60"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds

# Cache config (placeholder for Redis)
CACHE_TTL = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes

app = FastAPI(
    title="MediKiosk API",
    description="AI-Driven Public Health Chatbot for Disease Awareness - SIH 2026",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory caches (Redis-ready placeholders)
# ---------------------------------------------------------------------------

# Simple TTL cache - in production, replace with Redis
_response_cache: Dict[str, tuple[Any, float]] = {}
_rate_limits: Dict[str, list[float]] = {}


def cache_get(key: str) -> Optional[Any]:
    """Get from cache if not expired."""
    if key in _response_cache:
        value, expiry = _response_cache[key]
        if time.time() < expiry:
            return value
        del _response_cache[key]
    return None


def cache_set(key: str, value: Any, ttl: int = CACHE_TTL) -> None:
    """Set cache with TTL."""
    _response_cache[key] = (value, time.time() + ttl)


def check_rate_limit(client_id: str) -> bool:
    """Check if client is within rate limit. Returns True if allowed."""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    if client_id not in _rate_limits:
        _rate_limits[client_id] = [now]
        return True

    # Remove expired entries
    _rate_limits[client_id] = [t for t in _rate_limits[client_id] if t > window_start]

    if len(_rate_limits[client_id]) >= RATE_LIMIT_REQUESTS:
        return False

    _rate_limits[client_id].append(now)
    return True


# ---------------------------------------------------------------------------
# Rate limiting middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Cloud-native rate-limiting middleware (in-memory, Redis-ready)."""
    client_id = request.client.host if request.client else "unknown"

    if not check_rate_limit(client_id):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Limit: {RATE_LIMIT_REQUESTS} per {RATE_LIMIT_WINDOW}s",
                "retry_after": RATE_LIMIT_WINDOW,
            },
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_REQUESTS)
    response.headers["X-RateLimit-Window"] = str(RATE_LIMIT_WINDOW)
    return response


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class ChatTextRequest(BaseModel):
    session_id: str = Field(..., description="Patient session ID")
    message: str = Field(..., description="Patient message text")
    language: str = Field(default="en", description="Language code (en, hi, ta, etc.)")
    mode: str = Field(default="allopathic", description="Consultation mode: allopathic or ayush")


class ChatTextResponse(BaseModel):
    response: str = Field(..., description="AI assistant response")
    question_type: Optional[str] = Field(None, description="Category of the question asked")
    red_flag: Optional[Dict[str, str]] = Field(None, description="Red flag alert if triggered")
    cached: bool = Field(False, description="Whether response was from cache")


class ChatVoiceRequest(BaseModel):
    session_id: str = Field(..., description="Patient session ID")
    audio_base64: str = Field(..., description="Base64-encoded audio data")
    language: str = Field(default="en", description="Language code for ASR")
    mode: str = Field(default="allopathic", description="Consultation mode")


class ChatVoiceResponse(BaseModel):
    transcript: str = Field(..., description="ASR transcript of audio")
    response: str = Field(..., description="AI assistant response")
    question_type: Optional[str] = Field(None, description="Category of the question")
    red_flag: Optional[Dict[str, str]] = Field(None, description="Red flag alert if triggered")
    asr_engine: str = Field("bhashini_placeholder", description="ASR engine used")


class ScanDocumentRequest(BaseModel):
    session_id: str = Field(..., description="Patient session ID")
    doc_type: str = Field(..., description="Document type: prescription, lab_report, discharge_summary")
    file_base64: str = Field(..., description="Base64-encoded file data")
    file_name: str = Field(default="uploaded_file", description="Original file name")


class ScanDocumentResponse(BaseModel):
    doc_id: str = Field(..., description="Created document ID")
    extracted_text: str = Field(..., description="OCR extracted text")
    structured_data: Dict[str, Any] = Field(..., description="Structured clinical entities")
    ocr_engine: str = Field("placeholder", description="OCR engine used")
    cached: bool = Field(False, description="Whether result was from cache")


class SessionCreateRequest(BaseModel):
    patient_name: str = Field(..., description="Patient name")
    patient_age: Optional[int] = Field(None, description="Patient age")
    patient_gender: Optional[str] = Field(None, description="Patient gender")
    abha_id: Optional[str] = Field(None, description="ABHA ID")
    language: str = Field(default="en", description="Preferred language")
    mode: str = Field(default="allopathic", description="Consultation mode")


class SessionCreateResponse(BaseModel):
    session_id: str
    patient_id: str
    status: str


# ---------------------------------------------------------------------------
# Clinical knowledge base (placeholder for LLM integration)
# ---------------------------------------------------------------------------

CLINICAL_QUESTIONS = {
    "allopathic": [
        {"id": "chief_complaint", "question": "What is your main problem or complaint today?", "type": "chief_complaint"},
        {"id": "hpi_onset", "question": "When did this problem start?", "type": "hpi"},
        {"id": "hpi_duration", "question": "How long have you had this problem?", "type": "hpi"},
        {"id": "hpi_severity", "question": "How severe is your problem?", "type": "hpi"},
        {"id": "past_medical", "question": "Do you have any past medical conditions?", "type": "past_history"},
        {"id": "drug_allergy", "question": "Are you allergic to any medicines?", "type": "drug_allergy"},
        {"id": "family_history", "question": "Does anyone in your family have major illnesses?", "type": "family"},
        {"id": "personal_history", "question": "Do you smoke, consume alcohol, or use tobacco?", "type": "personal"},
    ],
    "ayush": [
        {"id": "prakriti", "question": "What is your body constitution type (Prakriti)?", "type": "prakriti"},
        {"id": "vikriti", "question": "What is your current imbalance (Vikriti)?", "type": "vikriti"},
        {"id": "agni", "question": "How is your digestive fire (Agni)?", "type": "agni"},
        {"id": "koshtha", "question": "How are your bowel movements (Koshtha)?", "type": "koshtha"},
    ],
}

RED_FLAG_KEYWORDS = {
    "chest pain": {"type": "cardiac", "severity": "critical", "description": "Chest pain - potential cardiac emergency"},
    "breathing difficulty": {"type": "respiratory", "severity": "critical", "description": "Breathing difficulty - respiratory emergency"},
    "stroke": {"type": "neurological", "severity": "critical", "description": "Stroke symptoms - immediate attention needed"},
    "unconscious": {"type": "neurological", "severity": "critical", "description": "Unconsciousness - critical emergency"},
    "severe bleeding": {"type": "hemorrhage", "severity": "critical", "description": "Severe bleeding - immediate hemostasis needed"},
}


def check_red_flags(text: str) -> Optional[Dict[str, str]]:
    """Check text for emergency red-flag keywords."""
    lower = text.lower()
    for keyword, flag in RED_FLAG_KEYWORDS.items():
        if keyword in lower:
            return flag
    return None


def get_next_question(session_id: str, mode: str, message: str) -> Dict[str, Any]:
    """Determine next question based on conversation state (placeholder for LLM)."""
    cache_key = f"session_progress:{session_id}"
    progress = cache_get(cache_key) or 0
    questions = CLINICAL_QUESTIONS.get(mode, CLINICAL_QUESTIONS["allopathic"])

    if progress < len(questions):
        q = questions[progress]
        cache_set(cache_key, progress + 1)
        return {"question": q["question"], "question_type": q["id"]}

    return {
        "question": "Thank you! Your clinical history has been recorded. You can now scan documents or view your summary.",
        "question_type": "completion",
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "MediKiosk API",
        "version": "1.0.0",
        "description": "AI-Driven Public Health Chatbot for Disease Awareness - SIH 2026",
    }


@app.get("/api/v1/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected" if SUPABASE_DB_URL else "not_configured",
            "cache": "in_memory" if not os.getenv("REDIS_URL") else "redis",
            "rate_limiter": "active",
            "asr": "bhashini_placeholder",
            "ocr": "placeholder",
        },
    }


@app.post("/api/v1/sessions", response_model=SessionCreateResponse)
async def create_session(req: SessionCreateRequest):
    """Create a new patient session."""
    # Placeholder - in production, this would insert into Supabase via the service role key
    # The frontend currently creates sessions directly via Supabase JS client
    return SessionCreateResponse(
        session_id="placeholder_session_id",
        patient_id="placeholder_patient_id",
        status="active",
    )


@app.post("/api/v1/chat/text", response_model=ChatTextResponse)
async def chat_text(req: ChatTextRequest):
    """
    Process text-based clinical history chat.
    Uses adaptive questioning to elicit structured clinical history.
    """
    # Check cache
    cache_key = hashlib.sha256(
        f"{req.session_id}:{req.message}".encode()
    ).hexdigest()
    cached = cache_get(cache_key)

    if cached:
        return ChatTextResponse(
            response=cached["question"],
            question_type=cached.get("question_type"),
            red_flag=cached.get("red_flag"),
            cached=True,
        )

    # Check for red flags
    red_flag = check_red_flags(req.message)

    # Get next question
    next_q = get_next_question(req.session_id, req.mode, req.message)

    result = {
        "question": next_q["question"],
        "question_type": next_q.get("question_type"),
        "red_flag": red_flag,
    }

    # Cache the response
    cache_set(cache_key, result)

    return ChatTextResponse(
        response=result["question"],
        question_type=result.get("question_type"),
        red_flag=result.get("red_flag"),
        cached=False,
    )


@app.post("/api/v1/chat/voice", response_model=ChatVoiceResponse)
async def chat_voice(req: ChatVoiceRequest):
    """
    Process voice-based clinical history chat.
    Placeholder for Bhashini ASR integration.
    In production, this would:
    1. Send audio_base64 to Bhashini ASR API
    2. Receive transcript in the specified language
    3. Process transcript through the clinical conversation engine
    4. Return response with TTS audio (placeholder)
    """
    # Placeholder ASR - in production, call Bhashini API
    # transcript = await bhashini_asr(req.audio_base64, req.language)

    placeholder_transcript = "[ASR placeholder - Bhashini integration pending]"

    # Check for red flags in transcript
    red_flag = check_red_flags(placeholder_transcript)

    # Get next question
    next_q = get_next_question(req.session_id, req.mode, placeholder_transcript)

    return ChatVoiceResponse(
        transcript=placeholder_transcript,
        response=next_q["question"],
        question_type=next_q.get("question_type"),
        red_flag=red_flag,
        asr_engine="bhashini_placeholder",
    )


@app.post("/api/v1/scan/document", response_model=ScanDocumentResponse)
async def scan_document(req: ScanDocumentRequest):
    """
    Process medical document via OCR.
    Placeholder for OCR pipeline integration.
    In production, this would:
    1. Decode base64 file
    2. Run OCR (Tesseract / cloud OCR / custom model)
    3. Extract clinical entities (medications, diagnoses, lab values)
    4. Structure into FHIR-compatible format
    5. Store in database
    """
    # Check cache (file hash)
    cache_key = hashlib.sha256(
        f"{req.session_id}:{req.file_name}:{req.doc_type}".encode()
    ).hexdigest()
    cached = cache_get(cache_key)

    if cached:
        return ScanDocumentResponse(
            doc_id="cached",
            extracted_text=cached["extracted_text"],
            structured_data=cached["structured_data"],
            ocr_engine="placeholder",
            cached=True,
        )

    # Placeholder OCR result
    placeholder_results = {
        "prescription": {
            "extracted_text": "[OCR placeholder] Prescription content would be extracted here.",
            "structured_data": {
                "diagnoses": [],
                "medications": [],
                "follow_up": None,
            },
        },
        "lab_report": {
            "extracted_text": "[OCR placeholder] Lab report content would be extracted here.",
            "structured_data": {
                "investigations": [],
                "abnormal_values": [],
                "impression": None,
            },
        },
        "discharge_summary": {
            "extracted_text": "[OCR placeholder] Discharge summary would be extracted here.",
            "structured_data": {
                "diagnosis": None,
                "treatment": None,
                "discharge_medications": [],
            },
        },
    }

    result = placeholder_results.get(req.doc_type, placeholder_results["prescription"])

    # Cache the result
    cache_set(cache_key, result)

    return ScanDocumentResponse(
        doc_id="placeholder_doc_id",
        extracted_text=result["extracted_text"],
        structured_data=result["structured_data"],
        ocr_engine="placeholder",
        cached=False,
    )


@app.get("/api/v1/sessions/{session_id}/summary")
async def get_session_summary(session_id: str):
    """Get the structured clinical summary for a session."""
    cache_key = f"summary:{session_id}"
    cached = cache_get(cache_key)

    if cached:
        return {"summary": cached, "cached": True}

    # Placeholder - in production, query Supabase
    return {
        "summary": None,
        "message": "Summary would be retrieved from database",
        "cached": False,
    }


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("  MediKiosk API - AI Clinical History Platform")
    print("  Smart India Hackathon 2026")
    print("=" * 60)
    print(f"  Rate Limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW}s")
    print(f"  Cache TTL: {CACHE_TTL}s")
    print(f"  ASR Engine: Bhashini (placeholder)")
    print(f"  OCR Engine: Placeholder")
    print("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
