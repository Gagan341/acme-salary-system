"""Seed the database with 10,000 realistic employees.

Run:  python seed.py            (uses DATABASE_URL or the SQLite default)
      python seed.py --count 5000

Salaries are generated as realistic USD bands per department/seniority, then
converted into each employee's LOCAL currency (the spec requires storing local
currency). Cross-currency analytics later normalize back to USD via services/fx.

Uses bulk_save_objects so inserting 10k rows is a handful of round-trips, not
10k individual INSERTs.
"""
import argparse
import random
from datetime import date, timedelta

from faker import Faker

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.employee import Employee
from app.schemas.employee import COUNTRIES, DEPARTMENTS, STATUSES
from app.services.fx import COUNTRY_CURRENCY, USD_PER_UNIT

fake = Faker()
Faker.seed(42)
random.seed(42)

# Designations per department, ordered junior -> senior, with a salary multiplier.
DESIGNATIONS = {
    "Engineering": [("Junior Engineer", 0.7), ("Software Engineer", 1.0),
                    ("Senior Engineer", 1.5), ("Staff Engineer", 2.1),
                    ("Engineering Manager", 2.4)],
    "Product": [("Associate PM", 0.8), ("Product Manager", 1.3),
                ("Senior PM", 1.8), ("Director of Product", 2.5)],
    "HR": [("HR Associate", 0.6), ("HR Specialist", 0.9),
           ("HR Manager", 1.4), ("Head of HR", 2.0)],
    "Finance": [("Analyst", 0.8), ("Senior Analyst", 1.2),
                ("Finance Manager", 1.7), ("Finance Director", 2.4)],
    "Marketing": [("Marketing Associate", 0.7), ("Marketing Manager", 1.2),
                  ("Senior Marketing Manager", 1.6), ("CMO", 2.6)],
    "Sales": [("Sales Rep", 0.7), ("Account Executive", 1.1),
              ("Sales Manager", 1.6), ("VP Sales", 2.5)],
    "Operations": [("Ops Associate", 0.6), ("Ops Specialist", 0.9),
                   ("Ops Manager", 1.4), ("Head of Ops", 2.0)],
}

# Base annual salary in USD (median band) per department.
DEPT_BASE_USD = {
    "Engineering": 95000, "Product": 105000, "HR": 65000, "Finance": 85000,
    "Marketing": 72000, "Sales": 78000, "Operations": 62000,
}

# Cost-of-labor multiplier per country (USA = 1.0 baseline).
COUNTRY_MULT = {"USA": 1.0, "UK": 0.85, "Germany": 0.82, "Singapore": 0.78, "India": 0.35}


def make_employee(i: int, managers: list[str]) -> Employee:
    dept = random.choice(DEPARTMENTS)
    country = random.choices(COUNTRIES, weights=[40, 25, 12, 12, 11])[0]
    currency = COUNTRY_CURRENCY[country]

    designation, mult = random.choice(DESIGNATIONS[dept])

    # USD salary with department base * seniority * country * noise.
    usd = DEPT_BASE_USD[dept] * mult * COUNTRY_MULT[country]
    usd *= random.uniform(0.9, 1.15)

    # Convert USD -> local currency:  local = usd / (usd_per_unit_of_local)
    local = usd / USD_PER_UNIT[currency]
    salary = round(local, -2)  # round to nearest 100 local units

    first = fake.first_name()
    last = fake.last_name()
    emp_id = f"ACME-{i:06d}"
    email = f"{first.lower()}.{last.lower()}{i}@acme.com"

    joining = date.today() - timedelta(days=random.randint(30, 365 * 12))
    status = random.choices(STATUSES, weights=[88, 7, 5])[0]
    manager = random.choice(managers) if managers else "—"

    return Employee(
        employee_id=emp_id, first_name=first, last_name=last, email=email,
        department=dept, designation=designation, country=country,
        currency=currency, salary=salary, joining_date=joining,
        employment_status=status, manager_name=manager,
    )


def seed(count: int = 10000) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Employee).count()
        if existing > 0:
            print(f"DB already has {existing} employees. Skipping seed.")
            print("Drop the table / delete the SQLite file to re-seed.")
            return

        managers = [f"{fake.first_name()} {fake.last_name()}" for _ in range(40)]
        batch: list[Employee] = []
        for i in range(1, count + 1):
            batch.append(make_employee(i, managers))
            if len(batch) >= 1000:
                db.bulk_save_objects(batch)
                db.commit()
                batch.clear()
                print(f"  inserted {i}/{count}")
        if batch:
            db.bulk_save_objects(batch)
            db.commit()
        print(f"Done. Seeded {count} employees.")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed ACME employees")
    parser.add_argument("--count", type=int, default=10000)
    args = parser.parse_args()
    seed(args.count)
