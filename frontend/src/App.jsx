import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-authenticated-user-id": "accounts.google.com:testuser@gmail.com",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (Array.isArray(data.result)) {
        setResponse(
          data.result
            .map((g, i) => `${i + 1}. ${g.item} 🎁 for ${g.recipient}`)
            .join("\n")
        );
      } else {
        setResponse(JSON.stringify(data.result, null, 2));
      }

      setText("");
    } catch (err) {
      setResponse("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🎁 Gift List Agent
          </h1>
          <p className="text-gray-500 mt-2">Ask or manage your gift list</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 'Add watch for Dad'"
            className="flex-grow p-4 text-gray-700 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-white font-medium shadow-md transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:shadow-lg"
            }`}
          >
            {loading ? "⏳" : "Send"}
          </button>
        </form>

        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 font-mono text-sm text-gray-800 whitespace-pre-wrap shadow-inner"
            >
              {response}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-6 text-sm text-gray-500">
        
      </p>
    </div>
  );
}

export default App;
