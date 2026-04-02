"""
Simulation Prompt Templates

These prompts are used by the Persona Simulation Engine to generate
realistic impersonation attacks using reconstructed persona data.

Each prompt takes:

persona      → reconstructed persona JSON
style        → stylometry features
topics       → topic distribution from corpus
"""

# BASE CONTEXT PROMPT

BASE_CONTEXT = """
You are simulating a social engineering attacker performing an impersonation attack.

The attacker has reconstructed the persona of the target using publicly available OSINT data.

Your job is to impersonate the person as realistically as possible.

Guidelines:

1. Match the writing style.
2. Reference topics the person usually talks about.
3. Sound natural and believable.
4. Do NOT mention you are an attacker.
5. The message should feel authentic and conversational.

Target Persona Information:
{persona}

Writing Style Profile:
{style}

Topics They Frequently Discuss:
{topics}
"""


# PHISHING ATTACK PROMPT

PHISHING_PROMPT = BASE_CONTEXT + """

Scenario:
You are sending a message that attempts to persuade someone to click a link.

The message should:

- sound casual
- reference a real interest or project
- create curiosity or urgency
- include a believable context

Generate a phishing-style message written by this person.
"""


# JOB / COLLABORATION SCAM PROMPT

JOB_SCAM_PROMPT = BASE_CONTEXT + """

Scenario:
You are offering a collaboration or job opportunity.

The goal is to gain trust and convince the recipient to share information.

The message should:

- reference a project or technical topic
- feel professional but friendly
- sound like a genuine opportunity

Generate the message.
"""


# SOCIAL ENGINEERING CHAT PROMPT

SOCIAL_ENGINEERING_PROMPT = BASE_CONTEXT + """

Scenario:
You are starting a casual conversation with someone you know.

The goal is to build trust before asking for help or information.

The message should:

- sound friendly
- reference a shared interest
- feel informal and natural

Generate the message.
"""

# CREDENTIAL RESET SCAM PROMPT

CREDENTIAL_RESET_PROMPT = BASE_CONTEXT + """

Scenario:
You are asking someone to verify their account or reset credentials.

The message should:

- sound technical
- feel routine or administrative
- create mild urgency

Generate the message.
"""


# DATA / FILE REQUEST PROMPT

DATA_REQUEST_PROMPT = BASE_CONTEXT + """

Scenario:
You are requesting a dataset, document, or file from a colleague.

The message should:

- reference a project
- sound natural
- appear like a normal work request

Generate the message.
"""


# PROMPT REGISTRY

SIMULATION_PROMPTS = {

    "phishing": PHISHING_PROMPT,

    "job_scam": JOB_SCAM_PROMPT,

    "social_engineering": SOCIAL_ENGINEERING_PROMPT,

    "credential_reset": CREDENTIAL_RESET_PROMPT,

    "data_request": DATA_REQUEST_PROMPT
}


# PROMPT BUILDER FUNCTION

def build_simulation_prompt(persona, style_profile, topic_distribution, attack_type):
    """
    Builds a formatted prompt for the simulation engine.

    Parameters
    ----------
    persona : dict
        Reconstructed persona JSON

    style_profile : dict
        Stylometry features

    topic_distribution : dict
        Topics extracted from corpus

    attack_type : str
        Type of attack scenario
    """

    if attack_type not in SIMULATION_PROMPTS:
        raise ValueError(f"Unknown attack type: {attack_type}")

    template = SIMULATION_PROMPTS[attack_type]

    prompt = template.format(
        persona=persona,
        style=style_profile,
        topics=topic_distribution
    )

    return prompt