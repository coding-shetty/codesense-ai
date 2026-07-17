import re

SECURITY_PATTERNS = {
    "Hardcoded Secret / API Token": r"""(?i)(password|secret|api_key|passwd|token|private_key)\s*=\s*[\'"][A-Za-z0-9_\-]{16,}[\'"]""",
    "Potential SQL Injection Point": r"""\.execute\(['"].*%\s*\(.*\)['"]|\.execute\(['"].*\+\s*\w+.*['"]""",
    "Command Injection Vulnerability": r"""\bos\.system\(|\bsubprocess\.Popen\(|\bexec\(|\beval\(""",
    "Weak / Insecure Cryptography": r"""\bmd5\(|\bsha1\(|\bPyCrypto\b"""
}

def scan_security_and_smells(source_code: str) -> list[dict]:
    """Scans code text against regex patterns to identify security vulnerabilities and design smells."""
    findings = []
    lines = source_code.splitlines()
    
    for issue_type, pattern in SECURITY_PATTERNS.items():
        regex = re.compile(pattern)
        for idx, line in enumerate(lines):
            if regex.search(line):
                findings.append({
                    "line": idx + 1,
                    "type": issue_type,
                    "severity": "CRITICAL" if "Secret" in issue_type or "Injection" in issue_type else "WARNING",
                    "snippet": line.strip()
                })
                
    # Detect structural code smells cleanly
    for idx, line in enumerate(lines):
        if len(line) > 120:
            findings.append({
                "line": idx + 1,
                "type": "Code Smell: Excessively Long Code Line",
                "severity": "LOW",
                "snippet": line.strip()[:60] + "..."
            })
            
    return findings