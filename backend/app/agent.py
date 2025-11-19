import json
import vertexai
from vertexai.generative_models import GenerativeModel
from app.storage import Storage

class Agent:
    def __init__(self):
        # Initialize Vertex AI
        vertexai.init(
            project="gift-list-agent",
            location="us-central1"
        )

        # Use Gemini 2.5 Pro Model
        self.model = GenerativeModel("gemini-2.5-pro")

        # Storage bucket
        self.storage = Storage("gift-list-data")

    def ai_parse(self, text: str):
        prompt = f"""
        You are a JSON-only parser for a Gift List Agent.
        User input: "{text}"

        Return ONLY valid JSON with:
        - action: "add" | "remove" | "show"
        - item: string or null
        - recipient: string or null

        Examples:
        "add watch for dad" → {{"action":"add","item":"watch","recipient":"dad"}}
        "show list" → {{"action":"show"}}
        """

        response = self.model.generate_content(prompt)
        result = response.text.strip()

        try:
            return json.loads(result)
        except:
            # fallback wrapper if model returns text with backticks or explanation
            cleaned = result.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)

    async def handle(self, text, user_id):
        parsed = self.ai_parse(text)

        action = parsed.get("action")
        item = parsed.get("item")
        recipient = parsed.get("recipient")

        if action == "add":
            return self.storage.add_gift(user_id, item, recipient)

        if action == "remove":
            return self.storage.remove_gift(user_id, item)

        if action == "show":
            return self.storage.get_list(user_id)

        return {"error": "Unknown action"}
