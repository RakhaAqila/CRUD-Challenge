"use client";

import { use, useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "COMPLETE" | "INCOMPLETE";
  createdAt: string;
};

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "date">("priority");


  // Fetch data Tasks
  const fetchTasks = async () => {
    let url = "/api/tasks";
    const params = new URLSearchParams();
    if (filterStatus !== "ALL") params.append("status", filterStatus);
    if (filterPriority !== "ALL") params.append("priority", filterPriority);
    if (params.toString()) url += `?${params.toString()}`;

    // Sorting logic
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data: Task[] = await res.json();

      let sortedData = [...data];

      if (sortBy === "priority") {
        const order: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        sortedData.sort((a, b) => order[b.priority] - order[a.priority]);
      } else if (sortBy === "date") {
        sortedData.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      setTasks(sortedData);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority, sortBy]);

  // Memanmbah Tasks
  const addTask = async () => {
    if (!title.trim()) return alert("Judul task tidak boleh kosong!");
    
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ title, priority }),
    });

    setTitle("");
    setPriority("MEDIUM");
    fetchTasks();
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "COMPLETE" ? "INCOMPLETE" : "COMPLETE";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  };

  //Menghapus Task
  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  //Menghitung jumlah task
  const completedCount = tasks.filter((t) => t.status === "COMPLETE").length;  

  //Tampilan web
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Task Manager</h1>

      {/* Form Input Task */}
      <h1 className="text-2xl font-thin mt-12 mb-6 text-center">Tambah Task Baru</h1>
      <div className="flex gap-2 mb-6">
        <input type="text" placeholder="Masukkan judul task" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 border p-2 rounded" />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border p-2 rounded" >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Tambah</button>
      </div>

      {/* Filter Task */}
      <h1 className="text-2xl font-thin mt-12 mb-6 text-center">Tambah Task Baru</h1>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-2">Status: </label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded">
            <option value="ALL">All</option>
            <option value="COMPLETE">Complete</option>
            <option value="INCOMPLETE">Incomplete</option>
          </select>
        </div>

        <div>
          <label className="mr-2"> Prioritas: </label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border p-2 rounded">
            <option value="ALL">All</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="mr-2"> Urutkan: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "priority" | "date")} className="border p-2 rounded">
            <option value="priority">Sort by Priority</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Task Counter*/}
      <p className="mb-4 text-sm text-gray-600">
        {completedCount} of {tasks.length} tasks completed
      </p>

      {/* Task List */}
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex justify-between items-center border p-2 rounded">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={task.status === "COMPLETE"} onChange={() => toggleStatus(task)} />
              <span className={task.status === "COMPLETE" ? "line-through" : ""}>{task.title}</span>
              <span className={task.priority === "HIGH" ? "text-red-600" : "text-sm text-gray-600"}>{task.priority}</span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700">Hapus</button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && <p className="mt-4 text-sm text-gray-600">Tidak ada task sekarang</p>}
    </div>
  )
}

