"use client";

import { supabase } from "@/supabase-client";
import React, { useState, useEffect } from "react";

export default function TaskManager({ session }: { session: any }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tasks, setTasks] = useState<
    { id: number; title: string; description: string; image_url?: string }[]
  >([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("id", { ascending: false });
      if (error) console.error("Error fetching tasks:", error);
      else setTasks(data || []);
    };
    fetchTasks();
  }, []);

  // ✅ Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setTasks((prev) => [payload.new as any, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setTasks((prev) =>
            prev.map((task) => (task.id === (payload.new as any).id ? (payload.new as any) : task))
          );
        } else if (payload.eventType === "DELETE") {
          setTasks((prev) => prev.filter((task) => task.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ Upload image to Supabase Storage
  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("tasks-images").upload(fileName, file);

    if (error) {
      console.error("Image upload error:", error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from("tasks-images").getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  // ✅ Add or Update Task
  const handleAddOrUpdateTask = async () => {
    if (!title.trim() || !description.trim()) return;

    let image_url = null;
    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    if (editingId) {
      // Find the current task
      const currentTask = tasks.find((t) => t.id === editingId);
      if (!currentTask) return;

      // If no new image uploaded, keep the old one
      const image_url = imageFile ? await uploadImage(imageFile) : currentTask.image_url;

      const { data, error } = await supabase
        .from("tasks")
        .update({ title, description, image_url })
        .eq("id", editingId)
        .select()
        .single();

      if (error) return console.error("Error updating task:", error);
      setTasks(tasks.map((t) => (t.id === editingId ? data : t)));
      setEditingId(null);
    } else {
      // Insert
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title,
          description,
          image_url,
          email: session.user?.email || "",
        })
        .select()
        .single();

      if (error) return console.error("Error adding task:", error);
      // setTasks([data, ...tasks]);
    }

    setTitle("");
    setDescription("");
    setImageFile(null);
  };

  // ✅ Edit task
  const handleEdit = (id: number) => {
    const t = tasks.find((task) => task.id === id);
    if (!t) return;
    setTitle(t.title);
    setDescription(t.description);
    setEditingId(id);
  };

  // ✅ Delete task
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return console.error("Error deleting task:", error);
    setTasks(tasks.filter((t) => t.id !== id));
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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-200 file:bg-gray-700 file:border-none file:rounded-lg file:text-sm file:text-white hover:file:bg-gray-600"
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
          tasks.map((task, index) => (
            <div
              key={index}
              className="bg-gray-800 shadow-sm rounded-xl p-4 flex justify-between items-start border border-gray-700"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-200">{task.title}</h2>
                <p className="text-gray-400 mt-1">{task.description}</p>
                {task.image_url && (
                  <img
                    src={task.image_url}
                    alt="Task"
                    className="w-24 h-24 mt-2 rounded-lg object-cover border border-gray-700"
                  />
                )}
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
