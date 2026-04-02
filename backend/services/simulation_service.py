"""
SIMULATION ENGINE

Simulates:

• Phishing messages
• Fake job offers
• Social engineering chats
• Credential reset scams
• Data request attacks

Uses:

• Prompt templates
• LLM engine
• Stylometry engine
• Persona consistency engine
• Embedding engine
"""

from typing import Dict
from sqlalchemy.orm import Session

from AI.llm_engine import LLMEngine
from AI.stylometry_engine import StylometryEngine
from AI.consistency_engine import PersonaConsistencyEngine
from AI.embedding_engine import EmbeddingEngine


class SimulationEngine:

    def __init__(self):

        self.llm_engine = LLMEngine()
        self.consistency_engine = PersonaConsistencyEngine()
        self.embedding_engine = EmbeddingEngine()

    # SINGLE ATTACK SIMULATION

    def simulate_attack(
        self,
        db: Session,
        user_id: int,
        persona_json: Dict,
        topic_distribution: Dict,
        attack_type: str
    ) -> Dict:
        """
        Runs a persona-based attack simulation.

        Returns:
        • generated message
        • style realism score
        • semantic realism score
        """

        # FETCH USER STYLE VECTOR

        style_vector = StylometryEngine.style_signature(db, user_id)

        if not style_vector:
            raise ValueError("Stylometry data not available for user")

        # GENERATE ATTACK MESSAGE USING LLM

        attack_message = self.llm_engine.simulate_attack(
            persona=persona_json,
            style_profile=style_vector,
            topic_distribution=topic_distribution,
            attack_type=attack_type
        )

        # STYLE CONSISTENCY CHECK

        style_result = self.consistency_engine.evaluate_impersonation(
            real_style_vector=style_vector,
            generated_text=attack_message
        )

        # SEMANTIC REALISM CHECK

        semantic_score = self.semantic_similarity_check(
            persona_json,
            attack_message
        )

        # FINAL REALISM SCORE

        final_score = (
            0.6 * style_result["similarity"]
            + 0.4 * semantic_score
        )

        return {

            "attack_type": attack_type,

            "generated_message": attack_message,

            "style_similarity": style_result["similarity"],

            "style_classification": style_result["classification"],

            "semantic_similarity": semantic_score,

            "overall_realism_score": final_score
        }

    # SEMANTIC SIMILARITY CHECK

    def semantic_similarity_check(
        self,
        persona_json: Dict,
        generated_text: str
    ) -> float:
        """
        Measures semantic realism between persona and attack message.
        """

        persona_text = str(persona_json)

        persona_embedding = self.embedding_engine.embed_text(persona_text)

        attack_embedding = self.embedding_engine.embed_text(generated_text)

        similarity = self.embedding_engine.cosine_similarity(
            persona_embedding,
            attack_embedding
        )

        return similarity

    # MULTIPLE ATTACK SIMULATION

    def simulate_multiple_attacks(
        self,
        db: Session,
        user_id: int,
        persona_json: Dict,
        topic_distribution: Dict
    ) -> Dict:
        """
        Generates multiple attack scenarios.
        """

        attack_types = [
            "phishing",
            "job_scam",
            "credential_reset",
            "data_request",
            "social_engineering"
        ]

        simulations = []

        for attack in attack_types:

            result = self.simulate_attack(
                db=db,
                user_id=user_id,
                persona_json=persona_json,
                topic_distribution=topic_distribution,
                attack_type=attack
            )

            simulations.append(result)

        return {
            "user_id": user_id,
            "total_simulations": len(simulations),
            "simulations": simulations
        }