"""Static FX rates -> USD.

Salaries are stored in each employee's local currency (per the spec), but any
cross-country aggregate (total payroll, averages, histograms) must be expressed
in one currency to be meaningful. We normalize to USD using a fixed table.

In a real system these would come from a daily FX feed; a static table keeps the
assessment deterministic and dependency-free. See docs/tradeoffs.md.
"""

# Approximate units of local currency per 1 USD.
USD_PER_UNIT: dict[str, float] = {
    "USD": 1.0,
    "INR": 1 / 83.0,
    "GBP": 1.27,
    "EUR": 1.08,
    "SGD": 1 / 1.35,
}

COUNTRY_CURRENCY: dict[str, str] = {
    "India": "INR",
    "USA": "USD",
    "UK": "GBP",
    "Germany": "EUR",
    "Singapore": "SGD",
}


def to_usd(amount: float, currency: str) -> float:
    """Convert a local-currency amount to USD."""
    return float(amount) * USD_PER_UNIT.get(currency.upper(), 1.0)
