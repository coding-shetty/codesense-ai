import re

def calculate_cyclomatic_complexity(source_code: str) -> dict:
    """
    Calculates code execution paths deterministically.
    Counts structural control keywords + 1 default entrance path.
    """
    decision_points = [
        r'\bif\b', r'\belif\b', r'\bwhile\b', r'\bfor\b', 
        r'\bcatch\b', r'\band\b', r'\bor\b', r'\bcase\b'
    ]
    combined_regex = re.compile('|'.join(decision_points))
    matches = combined_regex.findall(source_code)
    complexity_score = len(matches) + 1
    
    # Categorize risk levels based on cyclomatic boundaries
    if complexity_score <= 5:
        risk = "Low Risk (Highly Maintainable)"
    elif complexity_score <= 10:
        risk = "Moderate Risk (Consider Refactoring)"
    else:
        risk = "High Risk / Critical Complexity Bottleneck"
        
    return {
        "cyclomatic_complexity": complexity_score,
        "rating": risk,
        "lines_evaluated": len(source_code.splitlines())
    }