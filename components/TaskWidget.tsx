"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { ListTodo, Plus, Trash2, Check } from "lucide-react";
import { Task, EnergyLevel } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TaskWidget() {
  const { data, error } = useSWR<{ tasks: Task[] }>(
    "/api/tasks",
    fetcher
  );

  const [newTask, setNewTask] = useState("");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("Medium");
  const [isAdding, setIsAdding] = useState(false);

  const addTask = async () => {
    if (!newTask.trim()) return;

    setIsAdding(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask,
          energyLevel,
        }),
      });
      setNewTask("");
      mutate("/api/tasks");
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          completed: !task.completed,
        }),
      });
      mutate("/api/tasks");
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks?id=${taskId}`, {
        method: "DELETE",
      });
      mutate("/api/tasks");
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const getEnergyBadgeClass = (level: EnergyLevel) => {
    switch (level) {
      case "Low":
        return "energy-badge energy-low";
      case "Medium":
        return "energy-badge energy-medium";
      case "High":
        return "energy-badge energy-high";
    }
  };

  if (error) {
    return (
      <div className="widget">
        <h3 className="widget-title flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-accent-purple" />
          Focus Tasks
        </h3>
        <p className="text-white/50 text-sm">Sign in to manage your tasks</p>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3 className="widget-title flex items-center gap-2">
        <ListTodo className="w-5 h-5 text-accent-purple" />
        Focus Tasks
      </h3>

      {/* Add Task Form */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-accent-purple/50 text-sm"
            disabled={isAdding}
          />
          <button
            onClick={addTask}
            disabled={isAdding || !newTask.trim()}
            className="px-4 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          {(["Low", "Medium", "High"] as EnergyLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setEnergyLevel(level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                energyLevel === level
                  ? getEnergyBadgeClass(level)
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {data?.tasks && data.tasks.length > 0 ? (
          data.tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-primary border-primary"
                      : "border-white/30 hover:border-primary"
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      task.completed ? "line-through text-white/40" : "text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  <span className={`${getEnergyBadgeClass(task.energyLevel as EnergyLevel)} inline-block mt-1`}>
                    {task.energyLevel}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <ListTodo className="w-12 h-12 text-white/20 mx-auto mb-2" />
            <p className="text-white/50 text-sm">No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
