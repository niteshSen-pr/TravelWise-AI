from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "TravelWise AI API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    
   
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://travel-wise-8y489b374-niteshsen018-8935s-projects.vercel.app"
    ]

    
    # Generative AI Provider settings
    AI_PROVIDER: str = "demo"  # "demo", "openai", "gemini", "anthropic"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"
    
    # Supabase settings
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Operating mode
    DEMO_MODE: bool = True
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False
    }

    @property
    def is_ai_configured(self) -> bool:
        return bool(self.AI_API_KEY and self.AI_PROVIDER != "demo")
        
    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and (self.SUPABASE_SERVICE_ROLE_KEY or self.SUPABASE_ANON_KEY))

settings = Settings()
