import json
from google.cloud import storage

class Storage:
    def __init__(self, bucket_name):
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)
        self.file = "gift_data.json"   # One file only

    def _blob(self):
        return self.bucket.blob(self.file)

    def load_all(self):
        blob = self._blob()
        if not blob.exists():
            return {}

        return json.loads(blob.download_as_text())

    def save_all(self, data):
        blob = self._blob()
        blob.upload_from_string(json.dumps(data, indent=2))

    def add_item(self, person, item):
        person = person.lower().strip()
        item = item.lower().strip()

        data = self.load_all()
        data.setdefault(person, [])

        data[person].append({"item": item, "person": person})
        self.save_all(data)

        return data[person]

    def remove_item(self, person, item):
        person = person.lower().strip()
        item = item.lower().strip()

        data = self.load_all()

        if person not in data:
            return []

        data[person] = [
            i for i in data[person] if i["item"] != item
        ]
        self.save_all(data)
        return data[person]

    def show_person(self, person):
        person = person.lower().strip()
        return self.load_all().get(person, [])

    def show_all(self):
        final = []
        data = self.load_all()
        for person, items in data.items():
            final.extend(items)
        return final
