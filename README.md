<<<<<<< HEAD
# Fin_Tracker_AI
=======
React-only version of the Finance AI Tracker (no backend).
- Run: npm install && npm run dev
- Sign in: Click Continue with Google (local mock)
- Transactions stored in localStorage (rfa_transactions_v1)
- Optional: To try OpenAI parsing, start input with `OPENAI:sk-...` followed by the text (may fail in browser due to CORS)



How to test features (step-by-step)
1) Sign in & open Dashboard

Click the demo/fake Google sign-in (or mock sign-in) and open Dashboard.

2) Add transaction (manual)

Uncheck Use AI Parser.

Fill Description, Amount, Category, Type (income/expense), Date.

Click Save.

Confirm transaction appears in the Transactions table and charts update.

3) Add with AI parser (single-line)

Check Use AI Parser.

In the single input type examples:

Coffee at Starbucks $6.50 - Food

Salary credited 75000

Uber ride 220

Click Parse → verify preview fields are populated (description, amount, category, type).

Click Save to commit transaction.

If the AI response is invalid or missing fields, the app will fallback to the baseline parser to extract numbers and categories.

4) Edit & Delete

Use Edit to load a transaction into the form, change fields and Save.

Use Delete to remove a transaction — charts, summary, and localStorage will update.

5) CSV Export & Import

Click Export CSV to download a CSV of your transactions.

Use Import CSV to upload a CSV file (header + rows). Example CSV format below.
>>>>>>> c8f0eb0 (sep25)
