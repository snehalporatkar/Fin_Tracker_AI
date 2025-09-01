import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './state/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useDarkMode } from './state/DarkModeContext';

export default function App() {
  const { user, logout } = useAuth();
  const { dark, setDark } = useDarkMode();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-gray-950/70 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-xl">Finance AI Tracker</Link>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded-xl border dark:border-gray-700"
              onClick={() => setDark(!dark)}
            >
              {dark ? 'Light' : 'Dark'}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.picture} alt="pfp" className="w-8 h-8 rounded-full" />
                <span className="hidden md:inline">{user.name}</span>
                <button className="px-3 py-1 rounded-xl border dark:border-gray-700" onClick={logout}>Sign out</button>
                <Link to="/dashboard" className="btn">Open Dashboard</Link>
              </div>
            ) : (
              <Link to="/login" className="btn">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      {/* Routes */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Routes>
          <Route path="/" element={<><Hero /><Features /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

/* -------------------------
   EXTRA COMPONENTS BELOW
--------------------------*/

function Hero() {
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Track spending with natural language + beautiful insights
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Fake Google sign-in, smart AI parsing (client-side), and clean visualizations that make your money make sense.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/login" className="btn">Sign in</a>
          <a href="/dashboard" className="px-4 py-2 rounded-2xl border dark:border-gray-700">Try Demo</a>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card"
      >
        <img
          src="https://t3.ftcdn.net/jpg/03/93/37/24/360_F_393372407_u34qDqrJuvMZICQC0oKnKgEUi8XqVPJG.jpg"
          className="rounded-xl w-full"
          alt="Dashboard Preview"
        />
      </motion.div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: "📊", title: "Smart Categories", desc: "Automatic classification of transactions" },
    { icon: "💵", title: "Natural Language", desc: "Type: 'Coffee at Starbucks $6.50 - Food' and we parse it." },
    { icon: "📈", title: "Visual Insights", desc: "Pie for categories, line for trends, summary cards." }
  ];
  return (
    <section className="mt-16 grid md:grid-cols-3 gap-6">
      {items.map((it, i) => (
        <div key={i} className="card p-6 text-center">
          <div className="text-4xl">{it.icon}</div>
          <h3 className="font-semibold text-lg mt-3">{it.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{it.desc}</p>
        </div>
      ))}
    </section>
  );
}
