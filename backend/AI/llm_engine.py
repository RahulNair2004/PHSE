"""
LLM ENGINE

Groq LLM Wrapper for PHSE

Handles:
• Prompt execution
• Token limits
• Temperature
• Retry logic
• System prompts
• Structured outputs
• Persona generation
• Persona-based attack simulations
• AI mitigation intelligence
"""

import os
import time
import json
import re
from typing import Optional
from groq import Groq

from AI.prompt_templates import build_simulation_prompt


class LLMEngine:

    def __init__(
        self,
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.3,
        max_tokens: int = 1000
    ):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set")

        self.client = Groq(api_key=api_key)
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens


    # BASIC GENERATION

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        retries: int = 3
    ) -> str:

        temperature = temperature or self.temperature
        max_tokens = max_tokens or self.max_tokens
        system_prompt = system_prompt or "You are a cybersecurity intelligence analyst."

        for attempt in range(retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens
                )

                return response.choices[0].message.content

            except Exception as e:
                if attempt == retries - 1:
                    raise e

                time.sleep(2 ** attempt)

        return ""


    # SAFE JSON PARSING

    @staticmethod
    def safe_json_parse(text: str) -> dict:

        match = re.search(r"\{.*\}", text, re.DOTALL)

        if match:
            try:
                return json.loads(match.group())
            except Exception:
                return {}

        return {}


    # STRUCTURED JSON GENERATION

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> dict:

        json_prompt = f"""
{prompt}

Return ONLY a JSON object.
No explanation.
No markdown.
No extra text.
"""

        result = self.generate(json_prompt, system_prompt=system_prompt)

        return self.safe_json_parse(result)


    # PERSONA GENERATION

    def generate_persona(self, text_corpus: str, style_vector: dict) -> dict:

        prompt = f"""
Analyze the following OSINT data.

TEXT CORPUS:
{text_corpus}

WRITING STYLE FEATURES:
{json.dumps(style_vector, indent=2)}

Infer ONLY the following fields:

1. personality_traits
2. interests
3. behavioral_patterns

Return JSON only.
"""

        persona = self.generate_json(prompt)

        return {
            "personality_traits": persona.get("personality_traits", []),
            "interests": persona.get("interests", []),
            "behavior_patterns": persona.get("behavior_patterns", [])
        }


    # PHISHING MESSAGE GENERATION

    def generate_phishing_message(
        self,
        persona: dict,
        style_profile: dict,
        topic_distribution: dict
    ) -> str:

        prompt = build_simulation_prompt(
            persona=persona,
            style_profile=style_profile,
            topic_distribution=topic_distribution,
            attack_type="phishing"
        )

        return self.generate(prompt)


    # GENERIC ATTACK SIMULATION

    def simulate_attack(
        self,
        persona: dict,
        style_profile: dict,
        topic_distribution: dict,
        attack_type: str
    ) -> str:

        prompt = build_simulation_prompt(
            persona=persona,
            style_profile=style_profile,
            topic_distribution=topic_distribution,
            attack_type=attack_type
        )

        return self.generate(prompt)


    # AI MITIGATION GENERATION (NEW)

    def generate_mitigation(
        self,
        risk_data: dict,
        persona_data: Optional[dict] = None
    ) -> dict:
        """
        Generates AI-driven mitigation strategies.

        Output structure:
        {
            summary: str
            recommendations: []
            priority_actions: []
            expected_risk_reduction: float
        }
        """

        prompt = f"""
You are a senior cybersecurity analyst.

Based on the following cyber intelligence signals, generate a mitigation strategy.

RISK DATA:
{json.dumps(risk_data, indent=2)}

PERSONA DATA:
{json.dumps(persona_data, indent=2)}

Generate mitigation guidance including:

1. security summary
2. exposure reduction strategies
3. account lockdown actions
4. priority security actions
5. expected risk reduction percentage

Return JSON with fields:

summary
recommendations
priority_actions
expected_risk_reduction
"""

        result = self.generate_json(prompt)

        return {
            "summary": result.get("summary", ""),
            "recommendations": result.get("recommendations", []),
            "priority_actions": result.get("priority_actions", []),
            "expected_risk_reduction": result.get("expected_risk_reduction", 0.2)
        }
