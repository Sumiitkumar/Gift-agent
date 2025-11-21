import json
import vertexai
from vertexai.generative_models import GenerativeModel
from app.storage import Storage

class Agent:
    def __init__(self):
        vertexai.init(project="gift-list-agent", location="us-central1")
        self.model = GenerativeModel("gemini-2.0-flash")   # FAST + CHEAP
        self.storage = Storage("gift-list-data")

    def ai_parse(self, text: str):
        prompt = f"""
        You are a strict JSON parser.

        Extract these fields:
        - action: add | remove | show
        - item: gift name or null
        - person: person's name or null

        Always respond ONLY as JSON.

        Example:
        "add watch for Sumit" → {{"action":"add","item":"watch","person":"sumit"}}
        "show list for amit" → {{"action":"show","person":"amit"}}
        "remove bag from rahul" → {{"action":"remove","item":"bag","person":"rahul"}}

        USER MESSAGE: "{text}"
        """

        resp = self.model.generate_content(prompt)
        out = resp.text.strip()

        out = out.replace("```json", "").replace("```", "").strip()
        return json.loads(out)

    async def handle(self, text, user):
        parsed = self.ai_parse(text)

        action = parsed.get("action")
        person = parsed.get("person", user)
        item = parsed.get("item")

        if action == "add":
            return self.storage.add_item(person, item)

        if action == "remove":
            return self.storage.remove_item(person, item)

        if action == "show" and person:
            return self.storage.show_person(person)

        if action == "show":
            return self.storage.show_all()

        return []
