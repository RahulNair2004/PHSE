"""sync models

Revision ID: d80591c4b0e0
Revises: 
Create Date: 2026-02-27

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = 'd80591c4b0e0'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define ENUM type
risk_level_enum = sa.Enum(
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
    name='risk_level_enum'
)


def upgrade() -> None:
    # Create ENUM type
    risk_level_enum.create(op.get_bind(), checkfirst=True)

    # ---- mitigation_reports ----
    op.create_table(
        'mitigation_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recommendations', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('priority_actions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('expected_risk_reduction', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_mitigation_reports_user_id',
                    'mitigation_reports',
                    ['user_id'])

    # ---- risk_history ----
    op.create_table(
        'risk_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_risk', sa.Float(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_risk_history_user_id',
                    'risk_history',
                    ['user_id'])

    # ---- stylometry_analysis ----
    op.create_table(
        'stylometry_analysis',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('avg_sentence_length', sa.Float(), nullable=True),
        sa.Column('vocabulary_richness', sa.Float(), nullable=True),
        sa.Column('punctuation_density', sa.Float(), nullable=True),
        sa.Column('sentiment_score', sa.Float(), nullable=True),
        sa.Column('entropy_score', sa.Float(), nullable=True),
        sa.Column('stylometry_risk', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_stylometry_analysis_user_id',
                    'stylometry_analysis',
                    ['user_id'])

    # ---- osint_data additions ----
    op.add_column('osint_data', sa.Column('email_exposure_score', sa.Float(), nullable=True))
    op.add_column('osint_data', sa.Column('social_exposure_score', sa.Float(), nullable=True))
    op.add_column('osint_data', sa.Column('domain_exposure_score', sa.Float(), nullable=True))
    op.add_column('osint_data', sa.Column('breach_count', sa.Integer(), nullable=True))
    op.add_column('osint_data', sa.Column('normalized_risk', sa.Float(), nullable=True))

    # ---- persona_profiles additions ----
    op.add_column('persona_profiles', sa.Column('confidence_score', sa.Float(), nullable=True))
    op.add_column('persona_profiles', sa.Column('persona_embedding', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('persona_profiles', sa.Column('source_hash', sa.String(), nullable=True))

    # ---- risk_scores refactor ----
    op.add_column('risk_scores', sa.Column('osint_component', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('persona_component', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('stylometry_component', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('simulation_component', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('weighted_total', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('risk_level', risk_level_enum, nullable=True))
    op.add_column('risk_scores', sa.Column('risk_percentile', sa.Float(), nullable=True))

    op.drop_column('risk_scores', 'style_score')
    op.drop_column('risk_scores', 'exposure_score')
    op.drop_column('risk_scores', 'final_score')

    # ---- simulations additions ----
    op.add_column('simulations', sa.Column('psychological_score', sa.Float(), nullable=True))
    op.add_column('simulations', sa.Column('persuasion_index', sa.Float(), nullable=True))
    op.add_column('simulations', sa.Column('contextual_risk_weight', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('simulations', 'contextual_risk_weight')
    op.drop_column('simulations', 'persuasion_index')
    op.drop_column('simulations', 'psychological_score')

    op.add_column('risk_scores', sa.Column('final_score', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('exposure_score', sa.Float(), nullable=True))
    op.add_column('risk_scores', sa.Column('style_score', sa.Float(), nullable=True))

    op.drop_column('risk_scores', 'risk_percentile')
    op.drop_column('risk_scores', 'risk_level')
    op.drop_column('risk_scores', 'weighted_total')
    op.drop_column('risk_scores', 'simulation_component')
    op.drop_column('risk_scores', 'stylometry_component')
    op.drop_column('risk_scores', 'persona_component')
    op.drop_column('risk_scores', 'osint_component')

    op.drop_column('persona_profiles', 'source_hash')
    op.drop_column('persona_profiles', 'persona_embedding')
    op.drop_column('persona_profiles', 'confidence_score')

    op.drop_column('osint_data', 'normalized_risk')
    op.drop_column('osint_data', 'breach_count')
    op.drop_column('osint_data', 'domain_exposure_score')
    op.drop_column('osint_data', 'social_exposure_score')
    op.drop_column('osint_data', 'email_exposure_score')

    op.drop_index('ix_stylometry_analysis_user_id', table_name='stylometry_analysis')
    op.drop_index('ix_risk_history_user_id', table_name='risk_history')
    op.drop_index('ix_mitigation_reports_user_id', table_name='mitigation_reports')

    op.drop_table('stylometry_analysis')
    op.drop_table('risk_history')
    op.drop_table('mitigation_reports')

    risk_level_enum.drop(op.get_bind(), checkfirst=True)