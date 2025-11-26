from vertexai.generative_models import GenerativeModel
from app.storage import Storage

class Agent:
    def __init__(self):
        self.model = GenerativeModel("gemini-2.0-flash")
        self.storage = Storage("gift-agent-bucket-v1")

    # -----------------------------
    # AI PARSER 
    # -----------------------------
    def ai_parse(self, text: str):
        prompt = f"""
You are a command parser. Extract ONLY structured JSON.
User input: "{text}"

Rules:
- Always output JSON in this exact format:
  {{ "action": "add/remove/edit/show", "item": "", "person": "" }}
- "edit" means update old item to a new item. Detect both.
- If user wants to show list, return: {{ "action": "show", "item": "", "person": "" }}

Examples:
Input: "Add xbox for sumit"
Output: {{ "action": "add", "item": "xbox", "person": "sumit" }}

Input: "Remove ps5 for arjun"
Output: {{ "action": "remove", "item": "ps5", "person": "arjun" }}

Input: "Edit xbox to ps6 for arjun"
Output: {{ "action": "edit", "item": "xbox|ps6", "person": "arjun" }}

Input: "Show list"
Output: {{ "action": "show", "item": "", "person": "" }}
"""

        resp = self.model.generate_content(prompt)
        raw = resp.text.strip()

        import json
        try:
            return json.loads(raw)
        except:
            return {"action": "unknown", "item": "", "person": ""}

    # -----------------------------
    # MAIN HANDLER (FIXED LOGIC)
    # -----------------------------
    async def handle(self, text: str, user: str):
        parsed = self.ai_parse(text)
        action = parsed.get("action", "")
        item = parsed.get("item", "")
        person = parsed.get("person", "")

        # Normalize
        if item:
            item = item.lower().strip()
        if person:
            person = person.lower().strip()

        # -----------------------------
        # ADD (FIXED: Now returns show_all)
        # -----------------------------
        if action == "add":
            self.storage.add_item(person, item)
            # FIX: After adding, return the COMPLETE list
            return self.storage.show_all()

        # -----------------------------
        # REMOVE (FIXED: Now returns show_all)
        # -----------------------------
        if action == "remove":
            self.storage.remove_item(person, item)
            # FIX: After removing, return the COMPLETE list
            return self.storage.show_all()

        # -----------------------------
        # EDIT (FIXED: Now returns show_all)
        # -----------------------------
        if action == "edit":
            try:
                old_item, new_item = item.split("|")
                old_item = old_item.strip()
                new_item = new_item.strip()
            except:
                return [{"error": "Could not understand edit command"}]

            # 1. Perform the edit
            self.storage.edit_item(person, old_item, new_item)
            # 2. Return the COMPLETE list
            return self.storage.show_all()

        # -----------------------------
        # SHOW LIST 
        # -----------------------------
        if action == "show":
            if person:
                # User asked for "Show list for [Person]"
                return self.storage.show_person(person)
            else:
                # User asked for "Show list" or initial load
                return self.storage.show_all()

        return [{"error": "Unknown command"}]