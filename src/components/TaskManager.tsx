"use client";

import React, { useState } from "react";

export default function TaskManager() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<
    { id: number; title: string; description: string }[]
  >([]);

  const handleAddTask = () => {
    if (!title.trim() || !description.trim()) return;
    const newTask = {
      id: Date.now(),
      title,
      description,
    };
    setTasks([newTask, ...tasks]);
    setTitle("");
    setDescription("");
  };

  const handleDelete = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEdit = (id: number) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (!taskToEdit) return;
    setTitle(taskToEdit.title);
    setDescription(taskToEdit.description);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-6">
      <div className="w-full max-w-md bg-gray-800 shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-200 mb-4 text-center">
          📝 Task Manager
        </h1>

        {/* Input Fields */}
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
            onClick={handleAddTask}
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="w-full max-w-md mt-6 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks added yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white shadow-sm rounded-xl p-4 flex justify-between items-start border border-gray-200"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {task.title}
                </h2>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(task.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-sm text-red-600 hover:text-red-800"
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
