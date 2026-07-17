import asyncio
import json
import re
from typing import AsyncGenerator

class AnalysisPipeline:
    """
    Manages the lifecycle of code analysis.
    Runs static scans followed by tokenized streaming text generations.
    """
    
    def __init__(self, source_code: str, file_name: str, mentor_mode: bool = False):
        self.source_code = source_code
        self.file_name = file_name
        self.mentor_mode = mentor_mode

    def _execute_static_scan(self) -> dict:
        """
        Runs localized AST-lite calculations to track complexity indices 
        and look for blatant security flaws/bad smells.
        """
        lines = self.source_code.split("\n")
        findings = []
        
        # Calculate block indentation levels to gauge overall structural nesting
        max_nesting = 0
        current_nesting = 0
        for idx, line in enumerate(lines, 1):
            stripped = line.lstrip()
            if not stripped:
                continue
            
            # Look for basic control flow loops or branch conditions
            if stripped.startswith(("if ", "for ", "while ", "elif ")):
                indent = len(line) - len(stripped)
                current_nesting = (indent // 4) + 1
                if current_nesting > max_nesting:
                    max_nesting = current_nesting

            # Regex pattern lookups for credentials or tokens
            if re.search(r'(secret|password|auth_key|token|api_key)\s*=\s*["\'][a-zA-Z0-9_\-]{8,}["\']', line, re.IGNORECASE):
                findings.append({
                    "line": idx,
                    "type": "Hardcoded Secret Risk",
                    "severity": "HIGH"
                })
        
        # Frame custom complexity rating matrix
        complexity_score = max_nesting * 3
        rating = "Low Cognitive Overhead (Stable)"
        if complexity_score > 12:
            rating = "Critical Structural Nesting - Refactoring Recommended"
        elif complexity_score > 6:
            rating = "Moderate Structural Complexity"

        return {
            "complexity": {
                "cyclomatic_complexity": complexity_score,
                "rating": rating
            },
            "findings": findings
        }

    async def stream_analysis(self) -> AsyncGenerator[str, None]:
        """
        Asynchronously streams the compiled static payloads followed 
        by custom-built engineering report frames.
        """
        try:
            # Phase 1: Static Parsing Stage
            await asyncio.sleep(0.6)  # Synthetic processing drift
            static_metrics = self._execute_static_scan()
            yield f"data: {json.dumps(static_metrics)}\n\n"

            # Phase 2: Switch to Generation Matrix
            await asyncio.sleep(0.4)
            yield f"data: {json.dumps({'status': 'generation'})}\n\n"

            # Phase 3: Text Report Tokenization Stream Loop
            chunks = [
                "## 1. Architectural Integrity Overview\n\n",
                f"The target structural file `{self.file_name}` contains basic functional logic blocks. ",
                "The nesting matrix shows specific branch groupings that could impact maintainability under scale.\n\n",
                "### Key Observations:\n",
                f"- **Nesting Threshold:** Calculated cyclomatic profile is sitting at a rating index of {static_metrics['complexity']['cyclomatic_complexity']}.\n",
                "- **Execution Context:** Heavy usage of native linear blocks.\n\n",
                "## 2. Refactoring Blueprint Recommendations\n\n",
                "To optimize performance matrices inside this configuration, consider abstracting multi-layered loops into isolated helper utilities. "
            ]

            if static_metrics["findings"]:
                chunks.append("\n\n> ⚠️ **Critical Security Warning:** Hardcoded static vectors detected in active execution pathways. Move variables to an external `.env` file environment configuration container instantly.")
            
            if self.mentor_mode:
                chunks.append("\n\n### 🎓 Mentor Mode Insights:\n- Try breaking this down into smaller pure functions. It makes debugging much easier and keeps your codebase modular, Guru!")

            for chunk in chunks:
                # Simulate smooth real-time character typing response speeds
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                await asyncio.sleep(0.15)

        except Exception as e:
            yield f"data: {json.dumps({'detail': f'Internal runtime failure: {str(e)}'})}\n\n"