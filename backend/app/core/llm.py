import httpx
from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.core.security import decrypt_api_keys

async def get_llm_client_and_route(
    db_encrypted_settings: str, 
    requested_provider: str | None = None
) -> tuple[str, str, dict]:
    """
    Evaluates key availability dynamically to resolve the runtime destination.
    Priority order: Explicit Provider Request -> User Vault Keys -> Local Ollama Service.
    """
    keys = decrypt_api_keys(db_encrypted_settings)
    
    # Cascade check sequence
    if requested_provider and keys.get(requested_provider):
        provider = requested_provider
    elif keys.get("openai"):
        provider = "openai"
    elif keys.get("openrouter"):
        provider = "openrouter"
    else:
        provider = "ollama"

    # Configure client settings based on resolving selection
    if provider == "openai":
        return "openai", keys["openai"], {"base_url": "https://api.openai.com/v1"}
    elif provider == "openrouter":
        return "openrouter", keys["openrouter"], {"base_url": "https://openrouter.ai/api/v1"}
    else:
        return "ollama", "local-token-bypass", {"base_url": "http://localhost:11434/v1"}

async def stream_ai_reasoning(
    prompt: str, 
    system_prompt: str, 
    provider: str, 
    api_key: str, 
    config_meta: dict,
    model_choice: str = "qwen2.5-coder"
) -> AsyncGenerator[str, None]:
    """Generates an asynchronous production-grade stream parsing chunk payloads directly."""
    async with AsyncOpenAI(api_key=api_key, base_url=config_meta["base_url"]) as client:
        # Normalize model selection mapping for fallback compliance
        target_model = model_choice if provider != "ollama" else "qwen2.5-coder"
        
        response_stream = await client.chat.completions.create(
            model=target_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            stream=True
        )
        
        async for chunk in response_stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content