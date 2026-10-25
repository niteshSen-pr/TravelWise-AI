from fastapi import APIRouter
from ...core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
async def get_health():
    """
    Returns API status, version, and integration availability flags.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "ai": {
            "provider": settings.AI_PROVIDER,
            "configured": settings.is_ai_configured,
            "model": settings.AI_MODEL if settings.is_ai_configured else "built-in-deterministic-engine"
        },
        "database": {
            "type": "supabase" if settings.is_supabase_configured else "in-memory-demo-store",
            "configured": settings.is_supabase_configured
        }
    }
