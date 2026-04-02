"""
EMBEDDING ENGINE

Creates:
• Text embeddings
• Semantic similarity
• Vector representations

Used by:
• persona_service
• simulation_service
• similarity detection
"""

import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer


class EmbeddingEngine:

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):

        """
        Default model:
        all-MiniLM-L6-v2

        • 384 dimensional embeddings
        • fast
        • good semantic similarity
        """

        self.model = SentenceTransformer(model_name)

        self.embedding_dimension = self.model.get_sentence_embedding_dimension()

    # SINGLE TEXT EMBEDDING
   
    def embed_text(self, text: str):

        if not text:
            return None

        embedding = self.model.encode(
            text,
            normalize_embeddings=True
        )

        return embedding.tolist()

    # BATCH EMBEDDINGS
    
    def embed_documents(self, documents: List[str]):

        if not documents:
            return []

        embeddings = self.model.encode(
            documents,
            normalize_embeddings=True
        )

        return embeddings.tolist()

    # COSINE SIMILARITY
    
    def cosine_similarity(self, vec1, vec2):

        v1 = np.array(vec1)
        v2 = np.array(vec2)

        if v1.shape != v2.shape:
            raise ValueError("Embedding dimensions mismatch")

        dot = np.dot(v1, v2)

        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        similarity = dot / (norm1 * norm2)

        return float(similarity)

    # FIND MOST SIMILAR
    
    def find_similar(self, query_embedding, embeddings):

        """
        Returns similarity scores
        """

        scores = []

        for emb in embeddings:

            score = self.cosine_similarity(query_embedding, emb)

            scores.append(score)

        return scores

    # TOP-K SIMILAR SEARCH

    def top_k_similar(self, query_embedding, embeddings, k=5):

        """
        Returns top K most similar vectors
        """

        scores = self.find_similar(query_embedding, embeddings)

        indexed_scores = list(enumerate(scores))

        indexed_scores.sort(
            key=lambda x: x[1],
            reverse=True
        )

        return indexed_scores[:k]

    # PERSONA EMBEDDING HELPER

    def embed_persona_profile(self, persona_data):

        """
        Convert persona profile into embedding
        """

        text = str(persona_data)

        return self.embed_text(text)