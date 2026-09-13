import re


def parse_ast_structural_signatures(source_code: str) -> dict:
    """
    Parses structural elements from code strings.
    Extracts function/class declarations, control structures, and nesting depth.

    Note: This is a regex-based heuristic, not a true AST parser.  It will
    produce false positives on comments/strings that contain keywords.
    For production accuracy, swap to tree-sitter grammars per language.
    """
    lines = source_code.splitlines()
    total_lines = len(lines)

    # ── Keyword counting (improved patterns) ──────────────────────────────────
    # Exclude lines that are purely comments to reduce false positives
    code_lines = [
        line for line in lines
        if line.strip() and not line.strip().startswith(('#', '//', '/*', '*', '--'))
    ]
    code_text = '\n'.join(code_lines)

    metrics = {
        "function_declarations": len(re.findall(
            r'(?m)^\s*(?:def|function|fn|func|pub\s+fn|async\s+def|async\s+function|public\s+(?:static\s+)?(?:void|int|string|bool)\s+\w+)\b',
            code_text,
        )),
        "class_declarations": len(re.findall(
            r'\b(?:class|struct|interface|enum|trait)\s+\w+',
            code_text,
        )),
        "loops_count": len(re.findall(
            r'\b(?:for|while|foreach|do)\b',
            code_text,
        )),
        "conditional_branches": len(re.findall(
            r'\b(?:if|elif|else\s+if|switch|case|match)\b',
            code_text,
        )),
        "max_indentation_depth": 0,
        "raw_lines": total_lines,
    }

    # ── Calculate depth profiles via character counting ────────────────────────
    for line in lines:
        if not line.strip():
            continue
        leading_spaces = len(line) - len(line.lstrip(' '))
        leading_tabs = len(line) - len(line.lstrip('\t'))
        # Normalize: 1 tab = 4 spaces equivalent
        current_depth = leading_spaces // 4 + leading_tabs
        if current_depth > metrics["max_indentation_depth"]:
            metrics["max_indentation_depth"] = current_depth

    return metrics


# ── Language detection ─────────────────────────────────────────────────────────
_EXTENSION_MAP = {
    'py': 'python', 'pyw': 'python',
    'js': 'javascript', 'mjs': 'javascript', 'cjs': 'javascript',
    'ts': 'typescript', 'mts': 'typescript', 'cts': 'typescript',
    'jsx': 'javascript', 'tsx': 'typescript',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c', 'h': 'c',
    'cpp': 'cpp', 'cxx': 'cpp', 'cc': 'cpp', 'hpp': 'cpp',
    'cs': 'csharp',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin', 'kts': 'kotlin',
    'scala': 'scala',
    'lua': 'lua',
    'r': 'r', 'R': 'r',
    'sql': 'sql',
    'sh': 'shell', 'bash': 'shell', 'zsh': 'shell',
    'html': 'html', 'htm': 'html',
    'css': 'css', 'scss': 'css', 'less': 'css',
    'json': 'json',
    'yaml': 'yaml', 'yml': 'yaml',
    'xml': 'xml',
    'md': 'markdown',
    'toml': 'toml',
    'dart': 'dart',
    'ex': 'elixir', 'exs': 'elixir',
    'erl': 'erlang',
    'hs': 'haskell',
    'ml': 'ocaml', 'mli': 'ocaml',
    'clj': 'clojure',
    'tf': 'terraform',
    'dockerfile': 'dockerfile',
}


def detect_language_with_confidence(source_code: str, file_name: str) -> dict:
    """Determines language by reading file extensions and code structure patterns."""
    # Handle files like "Dockerfile" (no extension) or "Makefile"
    basename = file_name.rsplit('/', 1)[-1].rsplit('\\', 1)[-1].lower()
    ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else ''

    # Direct extension match
    if ext in _EXTENSION_MAP:
        return {"language": _EXTENSION_MAP[ext], "confidence": 0.98}

    # Special filenames
    if basename in ('dockerfile', 'containerfile'):
        return {"language": "dockerfile", "confidence": 0.95}
    if basename == 'makefile':
        return {"language": "makefile", "confidence": 0.90}

    # ── Heuristic fallback via signature recognition ──────────────────────────
    heuristics = [
        (r'\bdef\s+\w+\s*\(|^\s*import\s+(?:os|sys|re|json)\b|^from\s+\w+\s+import\b', "python", 0.75),
        (r'\bfunc\s+\w+|fmt\.Println|package\s+main\b', "go", 0.85),
        (r'\bfn\s+\w+|let\s+mut\s+|use\s+std::', "rust", 0.80),
        (r'\bconsole\.log|const\s+\w+\s*=\s*require\(|=>\s*{', "javascript", 0.65),
        (r'\binterface\s+\w+|:\s*(?:string|number|boolean)\b|<\w+>\s*\(', "typescript", 0.60),
        (r'\bpublic\s+static\s+void\s+main|System\.out\.print', "java", 0.80),
        (r'#include\s*<|printf\s*\(|malloc\s*\(', "c", 0.75),
        (r'\bstd::|cout\s*<<|#include\s*<iostream>', "cpp", 0.75),
    ]
    for pattern, language, confidence in heuristics:
        if re.search(pattern, source_code):
            return {"language": language, "confidence": confidence}

    return {"language": "plaintext", "confidence": 0.50}
