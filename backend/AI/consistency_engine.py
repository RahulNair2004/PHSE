"""
PERSONA CONSISTENCY ENGINE

Evaluates how realistic a simulated attack message is.

Compares:
• Real user stylometry
• Generated message stylometry

Outputs:
• similarity score
• impersonation realism
"""

from typing import Dict, Optional
import numpy as np

from AI.embedding_engine import EmbeddingEngine
from AI.stylometry_engine import StylometryEngine

# Import text stylometry function
from services.style_analysis_service import analyze_style


class PersonaConsistencyEngine:

    def __init__(self):

        self.embedding_engine = EmbeddingEngine()

    # COMPUTE STYLE VECTOR FOR GENERATED TEXT
    
    def compute_generated_style(self, text: str) -> Optional[list]:

        """
        Runs stylometry analysis on generated text.
        """

        features = analyze_style(text)

        if not features:
            return None

        vector = [

            float(features.get("avg_sentence_length", 0)),
            float(features.get("vocabulary_richness", 0)),
            float(features.get("punctuation_density", 0)),
            float(features.get("sentiment_score", 0)),
            float(features.get("entropy_score", 0))
        ]

        return vector

    # STYLE SIMILARITY
    
    def style_similarity(self, real_vector, generated_vector) -> float:

        v1 = np.array(real_vector)
        v2 = np.array(generated_vector)

        if v1.shape != v2.shape:
            return 0.0

        dot = np.dot(v1, v2)

        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot / (norm1 * norm2))

    # EVALUATE IMPERSONATION
    
    def evaluate_impersonation(
        self,
        real_style_vector,
        generated_text
    ) -> Dict:

        """
        Returns impersonation realism score.
        """

        generated_style = self.compute_generated_style(generated_text)

        if not generated_style:

            return {
                "similarity": 0,
                "classification": "unknown"
            }

        similarity = self.style_similarity(
            real_style_vector,
            generated_style
        )

        if similarity > 0.80:
            label = "highly realistic"

        elif similarity > 0.60:
            label = "moderately realistic"

        else:
            label = "weak impersonation"

        return {

            "similarity": similarity,
            "classification": label,
            "generated_style": generated_style
        }