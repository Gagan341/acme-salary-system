"""Analytics calculation tests (USD normalization, summary, groupings)."""
from app.tests.conftest import sample_payload


def _seed_three(client):
    # USA $100k, India 8.3M INR (~$100k), UK 50k GBP (~$63.5k)
    client.post("/api/employees", json=sample_payload(
        email="us@acme.com", country="USA", currency="USD", salary=100000))
    client.post("/api/employees", json=sample_payload(
        email="in@acme.com", country="India", currency="INR", salary=8300000))
    client.post("/api/employees", json=sample_payload(
        email="uk@acme.com", country="UK", currency="GBP", salary=50000))


def test_summary(client):
    _seed_three(client)
    s = client.get("/api/analytics/summary").json()
    assert s["total_employees"] == 3
    # USA 100k + India ~100k + UK ~63.5k
    assert 250000 < s["total_payroll_usd"] < 280000
    assert s["highest_salary_usd"] >= s["lowest_salary_usd"]


def test_by_country(client):
    _seed_three(client)
    rows = client.get("/api/analytics/countries").json()
    names = {r["name"] for r in rows}
    assert {"USA", "India", "UK"} <= names
    for r in rows:
        assert r["headcount"] == 1


def test_distribution_buckets(client):
    _seed_three(client)
    buckets = client.get("/api/analytics/distribution?buckets=4").json()
    assert len(buckets) == 4
    assert sum(b["count"] for b in buckets) == 3


def test_top_paid_order(client):
    _seed_three(client)
    top = client.get("/api/analytics/top?limit=3&order=desc").json()
    usd = [e["salary_usd"] for e in top]
    assert usd == sorted(usd, reverse=True)
