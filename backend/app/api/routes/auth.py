from fastapi import APIRouter
from ...core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/status")
async def get_auth_status():
    """
    Returns authentication configuration status.
    """
    return {
        "supabase_auth_enabled": settings.is_supabase_configured,
        "demo_mode": settings.DEMO_MODE,
        "supported_modes": ["supabase_auth"] if settings.is_supabase_configured else ["demo_local"]
    }

@router.post("/demo-login")
async def demo_login():
    """
    Provides a standardized mock user profile for local demo testing.
    """
    return {
        "user": {
            "id": "demo-user-123",
            "email": "demo.traveler@travelwise.ai",
            "display_name": "Alex Vance (Demo Traveler)",
            "role": "authenticated",
            "is_demo": True
        },
        "token": "demo-mock-jwt-token"
    }
