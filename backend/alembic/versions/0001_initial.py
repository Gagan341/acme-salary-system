"""initial employees table

Revision ID: 0001_initial
Revises:
Create Date: 2026-01-01 00:00:00
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("employee_id", sa.String(20), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("department", sa.String(50), nullable=False),
        sa.Column("designation", sa.String(100), nullable=False),
        sa.Column("country", sa.String(50), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("salary", sa.Numeric(14, 2), nullable=False),
        sa.Column("joining_date", sa.Date(), nullable=False),
        sa.Column("employment_status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("manager_name", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_employees_employee_id", "employees", ["employee_id"], unique=True)
    op.create_index("ix_employees_email", "employees", ["email"], unique=True)
    op.create_index("ix_employees_department", "employees", ["department"])
    op.create_index("ix_employees_country", "employees", ["country"])
    op.create_index("ix_employees_salary", "employees", ["salary"])
    op.create_index("ix_employees_employment_status", "employees", ["employment_status"])
    op.create_index("ix_emp_dept_country", "employees", ["department", "country"])


def downgrade() -> None:
    op.drop_table("employees")
