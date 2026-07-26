import httpx
import json
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
    elif keys.get("anthropic"):
        provider = "anthropic"
    elif keys.get("gemini"):
        provider = "gemini"
    elif keys.get("openrouter"):
        provider = "openrouter"
    else:
        provider = "ollama"

    # Configure client settings based on resolving selection
    if provider == "openai":
        return "openai", keys["openai"], {"base_url": "https://api.openai.com/v1"}
    elif provider == "openrouter":
        return "openrouter", keys["openrouter"], {"base_url": "https://openrouter.ai/api/v1"}
    elif provider == "gemini":
        return "gemini", keys["gemini"], {"base_url": "https://generativelanguage.googleapis.com/v1beta/openai/"}
    elif provider == "anthropic":
        return "anthropic", keys["anthropic"], {"base_url": "https://api.anthropic.com/v1"}
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
    if provider == "anthropic":
        # Determine target model for Claude
        target_model = model_choice if (model_choice.startswith("claude-") or "claude" in model_choice.lower()) else "claude-3-5-sonnet-20241022"
        
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": target_model,
            "max_tokens": 4000,
            "system": system_prompt,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True
        }
        
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", f"{config_meta['base_url']}/messages", headers=headers, json=payload) as response:
                if response.status_code != 200:
                    error_detail = await response.aread()
                    raise Exception(f"Anthropic API error ({response.status_code}): {error_detail.decode()}")
                
                buffer = ""
                async for chunk in response.aiter_text():
                    buffer += chunk
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if line.startswith("data:"):
                            data_str = line[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                if data.get("type") == "content_block_delta":
                                    delta = data.get("delta", {})
                                    if delta.get("type") == "text_delta":
                                        yield delta.get("text", "")
                            except Exception:
                                pass
    else:
        async with AsyncOpenAI(api_key=api_key, base_url=config_meta["base_url"]) as client:
            # Normalize model selection mapping for fallback compliance
            target_model = model_choice
            if provider == "ollama":
                target_model = "qwen2.5-coder"
            elif provider == "gemini" and not (model_choice.startswith("gemini-") or "gemini" in model_choice.lower()):
                target_model = "gemini-1.5-flash"
            
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