import re


def calculate_cyclomatic_complexity(source_code: str) -> dict:
    """
    Calculates code execution paths deterministically.
    Counts structural control-flow keywords + 1 default entrance path.

    Standard McCabe complexity counts decision points:
    if, elif, else if, while, for, foreach, case, catch,
    ternary (?:), logical guards in some languages.
    We do NOT count boolean operators (and/or/&&/||) as separate decision
    points — that inflates the score beyond the standard definition.
    """
    decision_points = [
        r'\bif\b',
        r'\belif\b',
        r'\belse\s+if\b',
        r'\bwhile\b',
        r'\bfor\b',
        r'\bforeach\b',
        r'\bcatch\b',
        r'\bcase\b',
        r'\b\?\b',  # ternary operator
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
        "lines_evaluated": len(source_code.splitlines()),
    }
