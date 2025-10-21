"use client";

import { supabase } from "@/supabase-client";
import React, { useState, useEffect } from "react";

export default function TaskManager({session}: {session: any}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<{ id: number; title: string; description: string }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ Fetch tasks from Supabase on mount
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("id", { ascending: false });
      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }
    };
    fetchTasks();
  }, []);

  // ✅ Add or Update Task
  const handleAddOrUpdateTask = async () => {
    if (!title.trim() || !description.trim()) return;

    if (editingId) {
      // Update existing task
      const { data, error } = await supabase
        .from("tasks")
        .update({ title, description })
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        console.error("Error updating task:", error);
        return;
      }

      setTasks(tasks.map((task) => (task.id === editingId ? data : task)));
      setEditingId(null);
    } else {
      // Add new task
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title,
          description,
          email: session.user?.email || "",
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding task:", error);
        return;
      }

      setTasks([data, ...tasks]);
    }

    setTitle("");
    setDescription("");
  };

  // ✅ Edit task
  const handleEdit = (id: number) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (!taskToEdit) return;
    setTitle(taskToEdit.title);
    setDescription(taskToEdit.description);
    setEditingId(id);
  };

  // ✅ Delete task
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting task:", error);
      return;
    }
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center p-6 gap-6">
      {/* Form Card */}
      <div className="w-full max-w-md bg-gray-800 shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-200 mb-4 text-center">📝 Task Manager</h1>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddOrUpdateTask}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {editingId ? "Update Task" : "Add Task"}
          </button>
        </div>
        <button
          className="bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
          onClick={async () => {
            await supabase.auth.signOut();
          }}
        >
          Logout
        </button>
      </div>

      {/* Task List */}
      <div className="w-full max-w-md mt-6 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks added yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800 shadow-sm rounded-xl p-4 flex justify-between items-start border border-gray-700"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-200">{task.title}</h2>
                <p className="text-gray-400 mt-1">{task.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(task.id)}
                  className="text-sm text-blue-500 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-500 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
