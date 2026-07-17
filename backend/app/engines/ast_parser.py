import re

def parse_ast_structural_signatures(source_code: str) -> dict:
    """
    Parses structural elements from code strings.
    Extracts deep blocks, control structures, and semantic densities.
    """
    lines = source_code.splitlines()
    total_lines = len(lines)
    
    # Structural density checks
    metrics = {
        "function_declarations": len(re.findall(r'\b(def|function|fn|public\s+void|func)\b', source_code)),
        "class_declarations": len(re.findall(r'\b(class|struct|interface)\b', source_code)),
        "loops_count": len(re.findall(r'\b(for|while|foreach)\b', source_code)),
        "conditional_branches": len(re.findall(r'\b(if|elif|else\s+if|switch|case)\b', source_code)),
        "max_indentation_depth": 0,
        "raw_lines": total_lines
    }
    
    # Calculate depth profiles via character counting
    for line in lines:
        if not line.strip():
            continue
        leading_spaces = len(line) - len(line.lstrip(' '))
        leading_tabs = len(line) - len(line.lstrip('\t'))
        current_depth = leading_spaces // 4 + leading_tabs
        if current_depth > metrics["max_indentation_depth"]:
            metrics["max_indentation_depth"] = current_depth
            
    return metrics

def detect_language_with_confidence(source_code: str, file_name: str) -> dict:
    """Determines language by reading file extensions and code structure patterns."""
    ext = file_name.split('.')[-1].lower() if '.' in file_name else ''
    
    extension_maps = {
        'py': 'python', 'js': 'javascript', 'ts': 'typescript',
        'go': 'go', 'rs': 'rust', 'java': 'java', 'cpp': 'cpp', 'cs': 'csharp'
    }
    
    if ext in extension_maps:
        return {"language": extension_maps[ext], "confidence": 0.98}
        
    # Heuristic fallback via signature recognition profiles
    if "def " in source_code or "import os" in source_code:
        return {"language": "python", "confidence": 0.75}
    if "fmt.Println" in source_code or "package main" in source_code:
        return {"language": "go", "confidence": 0.85}
    if "const " in source_code or "console.log" in source_code:
        return {"language": "javascript", "confidence": 0.60}
        
    return {"language": "plaintext", "confidence": 0.50}