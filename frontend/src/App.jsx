import { useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const emptyTaskForm = { title: "", description: "" };

function App() {
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [auth, setAuth] = useState({ token: "", user: null });
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState("");

  const authHeaders = useMemo(
    () => (auth.token ? { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }),
    [auth.token]
  );
  const isAdmin = auth.user?.role === "ADMIN";

  async function callApi(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, options);
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Request failed");
    return body;
  }

  async function fetchTasks() {
    const body = await callApi("/tasks", { headers: authHeaders });
    setTasks(body.data || []);
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const payload = mode === "register" ? authForm : { email: authForm.email, password: authForm.password };
    const body = await callApi(mode === "register" ? "/register" : "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      setMessage(err.message);
      return null;
    });

    if (!body) return;
    setAuth({ token: body.data.token, user: body.data.user });
    const freshHeaders = { Authorization: `Bearer ${body.data.token}`, "Content-Type": "application/json" };
    const taskBody = await callApi("/tasks", { headers: freshHeaders }).catch(() => ({ data: [] }));
    setTasks(taskBody.data || []);
    setMessage(mode === "register" ? "Registered successfully." : "Logged in successfully.");
  };

  const submitTask = async (event) => {
    event.preventDefault();
    if (!isAdmin) {
      setMessage("Only ADMIN can create or edit tasks.");
      return;
    }
    setMessage("");
    const path = editingTaskId ? `/tasks/${editingTaskId}` : "/tasks";
    const method = editingTaskId ? "PATCH" : "POST";
    const body = await callApi(path, { method, headers: authHeaders, body: JSON.stringify(taskForm) }).catch((err) => {
      setMessage(err.message);
      return null;
    });
    if (!body) return;
    setTaskForm(emptyTaskForm);
    setEditingTaskId("");
    setMessage(editingTaskId ? "Task updated." : "Task created.");
    fetchTasks();
  };

  const startEdit = (task) => {
    if (!isAdmin) return;
    setTaskForm({ title: task.title, description: task.description || "" });
    setEditingTaskId(task.id);
  };

  const toggleStatus = async (task) => {
    if (!isAdmin) {
      setMessage("Only ADMIN can update tasks.");
      return;
    }
    await callApi(`/tasks/${task.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ completed: !task.completed }),
    }).catch((err) => setMessage(err.message));
    fetchTasks();
  };

  const deleteTask = async (taskId) => {
    if (!isAdmin) {
      setMessage("Only ADMIN can delete tasks.");
      return;
    }
    await callApi(`/tasks/${taskId}`, { method: "DELETE", headers: authHeaders }).catch((err) => setMessage(err.message));
    fetchTasks();
  };

  const logout = () => {
    setAuth({ token: "", user: null });
    setTasks([]);
    setTaskForm(emptyTaskForm);
    setEditingTaskId("");
    setMessage("Logged out.");
  };

  if (!auth.token) {
    return (
      <main className="container">
        <h1>TradeAI Assessment UI</h1>
        <p>{mode === "register" ? "Create account" : "Sign in to continue"}</p>
        <form onSubmit={handleAuthSubmit} className="card">
          {mode === "register" ? <input placeholder="Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} /> : null}
          <input placeholder="Email" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
          <button type="submit">{mode === "register" ? "Register" : "Login"}</button>
        </form>
        <button className="link" onClick={() => setMode(mode === "register" ? "login" : "register")}>
          {mode === "register" ? "Have an account? Login" : "Need an account? Register"}
        </button>
        {message ? <p className="message">{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Dashboard</h1>
        <div>
          <strong>{auth.user?.name}</strong> ({auth.user?.role})
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {isAdmin ? (
        <form onSubmit={submitTask} className="card">
          <h3>{editingTaskId ? "Edit Task" : "Create Task"}</h3>
          <input placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          <textarea placeholder="Description (optional)" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
          <button type="submit">{editingTaskId ? "Update Task" : "Add Task"}</button>
        </form>
      ) : (
        <section className="card">
          <h3>Read-only Mode</h3>
          <p>You are logged in as USER. You can only view tasks.</p>
        </section>
      )}

      <section className="card">
        <h3>Tasks</h3>
        {tasks.length === 0 ? <p>No tasks yet.</p> : null}
        {tasks.map((task) => (
          <article key={task.id} className="task">
            <div>
              <h4>{task.title}</h4>
              <p>{task.description || "No description"}</p>
              <small>Owner: {task.userId}</small>
            </div>
            {isAdmin ? (
              <div className="taskActions">
                <button onClick={() => toggleStatus(task)}>{task.completed ? "Mark Pending" : "Mark Done"}</button>
                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            ) : null}
          </article>
        ))}
      </section>
      {message ? <p className="message">{message}</p> : null}
    </main>
  );
}

export default App;
