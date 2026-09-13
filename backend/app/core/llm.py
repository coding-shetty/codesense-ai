import httpx
import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from app.core.security import decrypt_api_keys


async def get_llm_client_and_route(
    db_encrypted_settings: str,
    requested_provider: str | None = None,
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
    elif keys.get("gemini"):
        provider = "gemini"
    elif keys.get("openrouter"):
        provider = "openrouter"
    else:
        provider = "ollama"

    # Configure client settings based on resolved selection
    if provider == "openai":
        return "openai", keys["openai"], {"base_url": "https://api.openai.com/v1"}
    elif provider == "openrouter":
        return "openrouter", keys["openrouter"], {"base_url": "https://openrouter.ai/api/v1"}
    elif provider == "gemini":
        return "gemini", keys["gemini"], {"base_url": "https://generativelanguage.googleapis.com/v1beta/openai/"}
    else:
        return "ollama", "local-token-bypass", {"base_url": "http://localhost:11434/v1"}


async def stream_ai_reasoning(
    prompt: str,
    system_prompt: str,
    provider: str,
    api_key: str,
    config_meta: dict,
    model_choice: str = "qwen2.5-coder",
) -> AsyncGenerator[str, None]:
    """Generates an asynchronous stream of AI reasoning tokens."""
    if provider == "gemini":
        # Gemini uses the OpenAI-compatible endpoint provided by Google
        target_model = model_choice
        if not (model_choice.startswith("gemini-") or "gemini" in model_choice.lower()):
            target_model = "gemini-1.5-flash"
    elif provider == "ollama":
        target_model = "qwen2.5-coder"
    else:
        target_model = model_choice

    async with AsyncOpenAI(api_key=api_key, base_url=config_meta["base_url"]) as client:
        response_stream = await client.chat.completions.create(
            model=target_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            stream=True,
        )

        async for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
