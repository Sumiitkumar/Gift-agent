from google.cloud import storage
import json


class Storage:
    def __init__(self, bucket_name: str):
        """Initialize with Cloud Storage bucket name."""
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)

    def _path(self, user_id: str) -> str:
        """Path where each user's JSON file is stored."""
        return f"{user_id}/list.json"

    def get_list(self, user_id: str):
        """Retrieve user's list as Python list."""
        blob = self.bucket.blob(self._path(user_id))
        if not blob.exists():
            return []
        try:
            return json.loads(blob.download_as_text())
        except Exception:
            return []

    def add_gift(self, user_id: str, item: str, recipient: str):
        """Add a new gift to the user's list."""
        lst = self.get_list(user_id)
        lst.append({"item": item, "recipient": recipient})
        blob = self.bucket.blob(self._path(user_id))
        blob.upload_from_string(json.dumps(lst), content_type="application/json")
        return lst

    def remove_gift(self, user_id: str, item: str):
        """Remove a gift item from the user's list."""
        lst = self.get_list(user_id)
        updated = [g for g in lst if g.get("item") != item]
        blob = self.bucket.blob(self._path(user_id))
        blob.upload_from_string(json.dumps(updated), content_type="application/json")
        return updated
