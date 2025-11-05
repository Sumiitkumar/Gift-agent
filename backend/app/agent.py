from vertexai import init
from vertexai.generative_models import GenerativeModel
import json
from app.storage import Storage

from vertexai import init
from vertexai.generative_models import GenerativeModel
import json
from app.storage import Storage


class Agent:
    def __init__(self):
        # ✅ Vertex AI in supported region
        init(project="gift-list-agent", location="us-central1")

        # ✅ Correct model name
        self.model = GenerativeModel("gemini-2.5-pro")

        # ✅ Your existing GCS bucket (region doesn't matter for storage)
        self.storage = Storage("gift-list-data")


    async def handle(self, text, user_id):
        """
        Interpret user text via Gemini and perform a storage action.
        """
        prompt = f"""
        You are a structured AI assistant that manages a user's gift list.
        The user said: "{text}"

        Respond ONLY in JSON format like this:
        {{
            "action": "add" | "remove" | "show",
            "item": "<gift item or empty string>",
            "recipient": "<person name or empty string>"
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            raw_text = response.text.strip()

            # Clean JSON if Gemini adds extra words
            json_str = raw_text[raw_text.find("{"): raw_text.rfind("}") + 1]
            parsed = json.loads(json_str)
        except Exception as e:
            return {
                "error": f"Failed to parse model response: {str(e)}",
                "raw_response": raw_text if "raw_text" in locals() else None,
            }

        action = parsed.get("action", "").lower().strip()
        item = parsed.get("item", "").strip()
        recipient = parsed.get("recipient", "").strip()

        if action == "add":
            return self.storage.add_gift(user_id, item, recipient)
        elif action == "remove":
            return self.storage.remove_gift(user_id, item)
        elif action == "show":
            return self.storage.get_list(user_id)
        else:
            return {"error": f"Unknown action: {action}", "parsed": parsed}
