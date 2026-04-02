from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a9348719382e'
down_revision = 'fa7397748d9e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add persona_json column to persona_profiles."""
    op.add_column(
        'persona_profiles',
        sa.Column('persona_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )


def downgrade() -> None:
    """Remove persona_json column from persona_profiles."""
    op.drop_column('persona_profiles', 'persona_json')