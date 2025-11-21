import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResponse([]);

    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          user_id: "sumit",
        }),
      });

      if (!res.ok) {
        setError("Backend unreachable");
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data.result)) {
        setError("Unexpected response format");
        return;
      }

      setResponse(data.result);
      setText("");
    } catch (err) {
      setError("Backend unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-200 p-4">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 p-8">
        <h1 className="text-4xl font-extrabold text-blue-600 text-center mb-6">
          🎁 Gift List Agent
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Add laptop for Sumit"
            className="flex-grow p-4 border rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Loading..." : "Send"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        {response.length > 0 && !error && (
          <div className="mt-6 p-4 bg-gray-100 border rounded-lg whitespace-pre-wrap">
            {response.map((r, i) => (
              <div key={i}>
                {i + 1}. {r.item} for {r.person}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
