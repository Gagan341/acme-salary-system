"""Employee CRUD + pagination/filter tests."""
from app.tests.conftest import sample_payload


def test_create_employee(client):
    r = client.post("/api/employees", json=sample_payload())
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "ada@acme.com"
    assert body["employee_id"].startswith("ACME-")


def test_duplicate_email_conflicts(client):
    client.post("/api/employees", json=sample_payload())
    r = client.post("/api/employees", json=sample_payload())
    assert r.status_code == 409


def test_get_employee(client):
    created = client.post("/api/employees", json=sample_payload()).json()
    r = client.get(f"/api/employees/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


def test_get_missing_employee_404(client):
    assert client.get("/api/employees/9999").status_code == 404


def test_update_employee(client):
    created = client.post("/api/employees", json=sample_payload()).json()
    r = client.put(f"/api/employees/{created['id']}", json={"salary": 120000})
    assert r.status_code == 200
    assert float(r.json()["salary"]) == 120000


def test_delete_employee(client):
    created = client.post("/api/employees", json=sample_payload()).json()
    assert client.delete(f"/api/employees/{created['id']}").status_code == 204
    assert client.get(f"/api/employees/{created['id']}").status_code == 404


def test_list_pagination_and_filter(client):
    for i in range(5):
        client.post("/api/employees", json=sample_payload(
            email=f"e{i}@acme.com", country="India" if i % 2 else "USA",
            currency="INR" if i % 2 else "USD",
        ))
    r = client.get("/api/employees?page=1&page_size=2")
    body = r.json()
    assert body["total"] == 5
    assert len(body["items"]) == 2
    assert body["total_pages"] == 3

    r2 = client.get("/api/employees?country=USA")
    assert all(e["country"] == "USA" for e in r2.json()["items"])


def test_search(client):
    client.post("/api/employees", json=sample_payload(first_name="Grace", email="grace@acme.com"))
    r = client.get("/api/employees?search=Grace")
    assert r.json()["total"] == 1
