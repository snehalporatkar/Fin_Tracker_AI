import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAuth } from "../state/AuthContext";

const STORAGE_TX = "rfa_transactions_v1";
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#0088FE",
  "#FFBB28",
  "#FF8042",
];

function loadTx() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_TX) || "[]");
  } catch {
    return [];
  }
}
function saveTx(list) {
  localStorage.setItem(STORAGE_TX, JSON.stringify(list));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ income: 0, expenses: 0, savings: 0 });
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [list, setList] = useState(() => loadTx());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [useAI, setUseAI] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => computeAll(), [list]);

  function computeAll() {
    const income = list
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    const expenses = list
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    setSummary({ income, expenses, savings: income - expenses });

    // Pie chart
    const map = {};
    for (const t of list) {
      if (t.type !== "expense") continue;
      map[t.category] = (map[t.category] || 0) + Number(t.amount || 0);
    }
    setCategories(Object.entries(map).map(([name, value]) => ({ name, value })));

    // Line chart
    const byMonth = {};
    for (const t of list) {
      const d = new Date(t.date || Date.now());
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[k] = byMonth[k] || { month: k, income: 0, expense: 0 };
      byMonth[k][t.type] += Number(t.amount || 0);
    }
    setTrends(
      Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
    );
  }

  const filtered = useMemo(() => {
    return list.filter(
      (tx) =>
        (!q || tx.description?.toLowerCase().includes(q.toLowerCase())) &&
        (!category || tx.category === category)
    );
  }, [list, q, category]);

  const baselineParse = (text) => {
    const amountMatch = text.match(/(?:\$|₹)?\s*(\d+[\d,]*(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;
    let type = "expense";
    if (/(salary|paid|income|credit|received|got)/i.test(text)) type = "income";
    let category = "Other";
    if (/food|lunch|dinner|starbucks|restaurant|coffee|tea/i.test(text))
      category = "Food";
    else if (/gas|shell|petrol|fuel/i.test(text)) category = "Gas";
    else if (/uber|ride|bus|train|metro/i.test(text)) category = "Transport";
    else if (/grocery|groceries|market/i.test(text)) category = "Groceries";
    else if (/netflix|subscription|prime|spotify/i.test(text))
      category = "Entertainment";
    else if (/electronics|phone|laptop/i.test(text)) category = "Electronics";
    else if (/bill|electricity|water|rent/i.test(text)) category = "Bills";
    else if (/amazon|shopping|mall|store/i.test(text)) category = "Shopping";
    else if (/salary|income|pay/i.test(text)) category = "Income";
    return {
      amount,
      category,
      description: text,
      type,
      date: new Date().toISOString(),
    };
  };

  async function parseInput() {
    if (!input) return;
    setPreview(baselineParse(input));
  }

  const confirmSave = () => {
    if (!preview) return;
    const finalTx = {
      ...preview,
      type: preview.type || "expense",
      category: preview.category || "Other",
      description: preview.description || "",
      amount: Number(preview.amount || 0),
      date: preview.date || new Date().toISOString(),
    };

    if (editing) {
      const tx = { ...editing, ...finalTx };
      const next = list.map((t) => (t._id === editing._id ? tx : t));
      setList(next);
      saveTx(next);
      setEditing(null);
    } else {
      const tx = {
        _id: "local-" + Math.random().toString(36).slice(2, 9),
        userId: user?.id || "local-uid",
        ...finalTx,
      };
      const next = [tx, ...list];
      setList(next);
      saveTx(next);
    }
    setPreview(null);
    setInput("");
  };

  const remove = (id) => {
    const next = list.filter((t) => t._id !== id);
    setList(next);
    saveTx(next);
  };

  const startEdit = (tx) => {
    setEditing(tx);
    setPreview({ ...tx });
    setUseAI(false);
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["Description,Amount,Category,Type,Date"];
    const rows = list.map(
      (t) =>
        `"${t.description}",${t.amount},"${t.category}",${t.type},"${t.date}"`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").slice(1); // skip header
      const imported = lines
        .map((line) => line.split(","))
        .filter((cols) => cols.length >= 5)
        .map((cols) => ({
          _id: "local-" + Math.random().toString(36).slice(2, 9),
          description: cols[0].replace(/"/g, ""),
          amount: Number(cols[1]),
          category: cols[2].replace(/"/g, ""),
          type: cols[3],
          date: cols[4].replace(/"/g, ""),
        }));
      const next = [...imported, ...list];
      setList(next);
      saveTx(next);
    };
    reader.readAsText(file);
  };

  return (
    <div className="py-4 space-y-8 text-gray-900 dark:text-gray-100">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard title="Income" value={summary.income} />
        <SummaryCard title="Expenses" value={summary.expenses} />
        <SummaryCard title="Savings" value={summary.savings} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card h-80">
          <h4 className="font-semibold mb-2">Expenses by Category</h4>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" label>
                {categories.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-80">
          <h4 className="font-semibold mb-2">Income vs Expense Trend</h4>
          <ResponsiveContainer>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            paddingTop: "10px",
            textAlign: "center",
          }}
        />
              <Line type="monotone" dataKey="income" stroke="#00C49F" />
              <Line type="monotone" dataKey="expense" stroke="#FF8042" />
              <Line type="monotone" dataKey="saving" stroke="#1da8ffff"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Transaction Section */}
      <div className="card">
        <h3 className="font-semibold mb-3">Add Transaction</h3>

        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
            Use AI Parser
          </label>
          {useAI && (
            <>
              <input
                className="flex-1 border rounded px-2 py-1 text-black"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Coffee at Starbucks $6.50 - Food"
              />
              <button
                onClick={parseInput}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                Parse
              </button>
            </>
          )}
        </div>

        {!useAI && (
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input
              className="border rounded px-2 py-1 text-black"
              placeholder="Description"
              value={preview?.description || ""}
              onChange={(e) =>
                setPreview({ ...(preview || {}), description: e.target.value })
              }
            />
            <input
              type="number"
              className="border rounded px-2 py-1 text-black"
              placeholder="Amount"
              value={preview?.amount || ""}
              onChange={(e) =>
                setPreview({ ...(preview || {}), amount: e.target.value })
              }
            />
            <select
              className="border rounded px-2 py-1 text-black"
              value={preview?.category || "Other"}
              onChange={(e) =>
                setPreview({ ...(preview || {}), category: e.target.value })
              }
            >
              <option>Other</option>
              <option>Food</option>
              <option>Transport</option>
              <option>Groceries</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Bills</option>
              <option>Electronics</option>
              <option>Income</option>
            </select>
            <select
              className="border rounded px-2 py-1 text-black"
              value={preview?.type || "expense"}
              onChange={(e) =>
                setPreview({ ...(preview || {}), type: e.target.value })
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 text-black"
              value={
                preview?.date
                  ? new Date(preview.date).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setPreview({
                  ...(preview || {}),
                  date: new Date(e.target.value).toISOString(),
                })
              }
            />
          </div>
        )}

        {preview && (
          <div className="mt-3 p-2 border rounded bg-gray-50 dark:bg-gray-800">
            <p>
              <strong>Desc:</strong> {preview.description}
            </p>
            <p>
              <strong>Amount:</strong> {preview.amount}
            </p>
            <p>
              <strong>Category:</strong> {preview.category}
            </p>
            <p>
              <strong>Type:</strong> {preview.type}
            </p>
            <p>
              <strong>Date:</strong> {new Date(preview.date).toLocaleString()}
            </p>
            <button
              onClick={confirmSave}
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
            >
              Save
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setPreview(null);
                  setInput("");
                }}
                className="ml-2 px-3 py-1 bg-gray-600 text-white rounded"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card">
        <h3 className="font-semibold mb-3">Transactions</h3>
        <div className="flex items-center gap-2 mb-2">
          <input
            className="border px-2 py-1 text-black rounded"
            placeholder="Search description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border px-2 py-1 text-black rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Groceries</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Bills</option>
            <option>Electronics</option>
            <option>Income</option>
            <option>Other</option>
          </select>
          <button
            onClick={exportCSV}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Export CSV
          </button>
          <label className="px-3 py-1 bg-gray-600 text-white rounded cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={importCSV} hidden />
          </label>
        </div>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-2 py-1 text-left">Description</th>
              <th className="border px-2 py-1 text-left">Amount</th>
              <th className="border px-2 py-1 text-left">Category</th>
              <th className="border px-2 py-1 text-left">Type</th>
              <th className="border px-2 py-1 text-left">Date</th>
              <th className="border px-2 py-1 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx._id}>
                <td className="border px-2 py-1">{tx.description}</td>
                <td className="border px-2 py-1">{tx.amount}</td>
                <td className="border px-2 py-1">{tx.category}</td>
                <td className="border px-2 py-1">{tx.type}</td>
                <td className="border px-2 py-1">
                  {new Date(tx.date).toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => startEdit(tx)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(tx._id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="card text-center">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
