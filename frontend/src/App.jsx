import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [text, setText] = useState("");
  const [giftList, setGiftList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null); 
  const [listTitle, setListTitle] = useState("All Gifts List"); 

  //const API_BASE = import.meta.env.VITE_API_URL || " =http://localhost:8000";
  const API_BASE = import.meta.env.VITE_API_URL || "http://34.93.132.123";

  // --- Notification Handler ---
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // 3 seconds is the current duration
  };
  
  // --- Universal Data Fetcher ---
  const fetchData = async (commandText) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commandText,
          user_id: "sumit",
        }),
      });

      if (!res.ok) {
        setError("Backend unreachable or server error.");
        return null;
      }

      const data = await res.json();
      
      if (!Array.isArray(data.result)) {
        if (data.result && data.result.error) {
            setError(data.result.error);
        } else {
            setError("Unexpected response format from the server.");
        }
        return null;
      }

      setGiftList(data.result);
      return data.result;

    } catch (err) {
      setError("Network error: Could not connect to the backend.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- Auto-load on Component Mount ---
  useEffect(() => {
    fetchData("Show list"); 
  }, []); 
  
  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentText = text.trim();
    if (!currentText) return;

    const result = await fetchData(currentText);
    setText("");
    
    // Logic for Notifications and Title
    if (result && !error) {
        const commandTextLower = currentText.toLowerCase();
        const actionMatch = commandTextLower.match(/(add|remove|edit)/);
        const parts = commandTextLower.split("for");
        const person = parts.length > 1 ? parts[1].trim() : 'a person';
        
        let msg = '';
        
        if (actionMatch) {
            const action = actionMatch[1];
            // Fix: Always show All Gifts List after a modifying action
            setListTitle("All Gifts List");

            if (action === 'add') {
                const item = parts[0].replace('add', '').trim();
                msg = `✅ Added item '${item.toUpperCase()}' for ${person}.`;
            } else if (action === 'remove') {
                const item = parts[0].replace('remove', '').trim();
                msg = `🗑️ Removed item '${item.toUpperCase()}' for ${person}.`;
            } else if (action === 'edit') {
                const itemChangePart = parts[0].replace('edit', '').trim(); 
                const editMatch = itemChangePart.match(/(.*)\s+to\s+(.*)/);
                
                if (editMatch) {
                    const oldItem = editMatch[1].trim().toUpperCase();
                    const newItem = editMatch[2].trim().toUpperCase();
                    msg = `✏️ Updated '${oldItem}' to '${newItem}' for ${person}.`;
                } else {
                    msg = `✏️ List updated for ${person}.`; 
                }
            }
            showNotification(msg, 'success');
        } else if (commandTextLower.includes("show list")) {
            // Logic for SHOW command
            if (person && person !== "list") {
                setListTitle(`Gifts List for ${person.toUpperCase()}`);
            } else {
                setListTitle("All Gifts List");
            }
        }
    } else if (error) {
         showNotification(error, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-200 p-4">
      
      {/* Notification Pop-up Component (UPDATED: Centered) */}
      <AnimatePresence>
        {notification && (
          // 1. Outer Container: Positions the notification near the top center
          <div 
            className={`fixed inset-0 flex items-start justify-center pt-20 z-50 pointer-events-none`}
          >
            {/* 2. Inner Motion Div: The actual animated pop-up */}
            <motion.div
               initial={{ opacity: 0, y: -50, scale: 0.8 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
               className={`p-4 rounded-lg shadow-xl text-white font-semibold transition-colors duration-300 pointer-events-auto
                 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
             >
               {notification.message}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            placeholder="e.g. Add laptop for Sumit or Edit bag to trolley for Sumit"
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
        
        {/* Dynamic List Title */}
        <h2 className="text-xl font-bold text-gray-700 mt-6 mb-3">{listTitle}</h2>

        {/* List Display (Scrollable) */}
        {giftList.length > 0 && !error ? (
          <div 
            className="p-4 bg-gray-100 border rounded-lg max-h-96 overflow-y-auto"
          >
            {giftList.map((r, i) => (
              <div key={i} className="py-1 border-b border-gray-200 last:border-b-0">
                {i + 1}. <span className="font-semibold capitalize">{r.item}</span> for <span className="text-blue-600 capitalize">{r.person}</span>
              </div>
            ))}
          </div>
        ) : (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-xl">
                {loading ? "Loading gifts..." : "No gifts found. Add an item!"}
            </div>
        )}
      </div>
    </div>
  );
}

export default App;