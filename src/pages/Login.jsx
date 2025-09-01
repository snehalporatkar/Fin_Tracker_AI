import React from 'react';
import { useAuth } from '../state/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginWithFakeGoogle } = useAuth();
  const nav = useNavigate();

  const go = async () => {
    await loginWithFakeGoogle();
    nav('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Welcome Back 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sign in to continue tracking your finances
        </p>

        <button
          onClick={go}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-4 py-3 rounded-xl shadow hover:shadow-lg transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span className="font-medium">Continue with Google</span>
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          No server needed — all data is securely stored in your browser.
        </p>
      </div>
    </div>
  );
}
