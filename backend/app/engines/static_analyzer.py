import re
from typing import List, Dict

SECURITY_PATTERNS: Dict[str, str] = {
    "Hardcoded Secret / API Token": (
        r"""(?i)(?:password|secret|api_key|apikey|passwd|token|private_key|auth_token)"""
        r"""\s*=\s*['"][A-Za-z0-9_\-+/=]{8,}['"]"""
    ),
    "Potential SQL Injection Point": (
        r"""\.execute\s*\(\s*['"].*%[sd]|"""
        r"""\.execute\s*\(\s*f['"].*\{|"""
        r"""\.execute\s*\(\s*['"].*\+\s*\w+"""
    ),
    "Command Injection Vulnerability": (
        r"""\bos\.system\s*\(|"""
        r"""\bsubprocess\.(?:Popen|call|run)\s*\(|"""
        r"""\bexec\s*\(|"""
        r"""\beval\s*\("""
    ),
    "Weak / Insecure Cryptography": (
        r"""\b(?:md5|sha1)\s*\(|"""
        r"""\bPyCrypto\b|"""
        r"""\bDES\b"""
    ),
    "Hardcoded IP / URL": (
        r"""https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"""
    ),
}


def scan_security_and_smells(source_code: str) -> List[Dict]:
    """Scans code text against regex patterns to identify security vulnerabilities and design smells."""
    findings: List[Dict] = []
    seen: set = set()  # deduplicate by (line, type)
    lines = source_code.splitlines()

    for issue_type, pattern in SECURITY_PATTERNS.items():
        regex = re.compile(pattern)
        for idx, line in enumerate(lines):
            # Skip comments and docstrings to reduce false positives
            stripped = line.lstrip()
            if stripped.startswith('#') or stripped.startswith('//') or stripped.startswith('*'):
                continue
            if regex.search(line):
                key = (idx + 1, issue_type)
                if key in seen:
                    continue
                seen.add(key)
                findings.append({
                    "line": idx + 1,
                    "type": issue_type,
                    "severity": "CRITICAL" if "Secret" in issue_type or "Injection" in issue_type else "WARNING",
                    "snippet": line.strip()[:120],
                })

    # Detect structural code smells
    for idx, line in enumerate(lines):
        if len(line) > 120:
            findings.append({
                "line": idx + 1,
                "type": "Code Smell: Excessively Long Code Line",
                "severity": "LOW",
                "snippet": line.strip()[:60] + "...",
            })

    return findings
