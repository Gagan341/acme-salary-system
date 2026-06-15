"""AI Insights rule-based parser tests."""
from app.tests.conftest import sample_payload


def _seed(client):
    client.post("/api/employees", json=sample_payload(
        email="e1@acme.com", department="Engineering", country="India",
        currency="INR", salary=8300000))
    client.post("/api/employees", json=sample_payload(
        email="e2@acme.com", department="Engineering", country="India",
        currency="INR", salary=4150000))
    client.post("/api/employees", json=sample_payload(
        email="h1@acme.com", department="HR", country="USA",
        currency="USD", salary=60000))


def test_highest_avg_department(client):
    _seed(client)
    r = client.post("/api/insights/query",
                    json={"question": "Which department has the highest average salary?"})
    body = r.json()
    assert body["result_type"] == "table"
    assert body["rows"][0][0] in {"Engineering", "HR"}


def test_total_payroll_in_country(client):
    _seed(client)
    r = client.post("/api/insights/query",
                    json={"question": "What is total payroll cost in India?"})
    body = r.json()
    assert body["result_type"] == "scalar"
    assert body["rows"][0][0] > 0


def test_top_paid_in_department(client):
    _seed(client)
    r = client.post("/api/insights/query",
                    json={"question": "Show top 2 paid employees in Engineering"})
    body = r.json()
    assert body["result_type"] == "table"
    assert len(body["rows"]) == 2


def test_headcount(client):
    _seed(client)
    r = client.post("/api/insights/query",
                    json={"question": "How many employees are in Engineering?"})
    assert r.json()["rows"][0][0] == 2


def test_unknown_question_fallback(client):
    r = client.post("/api/insights/query",
                    json={"question": "What is the meaning of life?"})
    assert r.json()["result_type"] == "message"
