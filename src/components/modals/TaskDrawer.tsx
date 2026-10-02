import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '../../stores/useTaskStore';
import { useAppStore } from '../../stores/useAppStore';
import { TaskItem } from '../../features/tasks/TaskItem';
import { TaskPriority } from '../../types/task';
import { X, Plus, CheckSquare, Sparkles, Trash } from 'lucide-react';

export const TaskDrawer: React.FC = () => {
  const { taskDrawerOpen, setTaskDrawerOpen } = useAppStore();
  const { tasks, addTask, reorderTasks, clearCompleted } = useTaskStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEst, setNewEst] = useState(25);
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newEmoji, setNewEmoji] = useState('🎯');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      reorderTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      estimatedMinutes: Number(newEst) || 25,
      priority: newPriority,
      emoji: newEmoji,
    });

    setNewTitle('');
    setIsAdding(false);
  };

  if (!taskDrawerOpen) return null;

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none">
      {/* Click outside backdrop to close */}
      <div className="flex-1" onClick={() => setTaskDrawerOpen(false)} />

      {/* Slide-out Drawer */}
      <div className="w-full max-w-md h-full bg-neutral-950/95 border-l border-white/10 p-6 flex flex-col shadow-2xl backdrop-blur-2xl overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Focus Tasks</h2>
            <span className="text-xs text-white/50 font-mono">({incompleteTasks.length} remaining)</span>
          </div>
          <button
            onClick={() => setTaskDrawerOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Button or Form */}
        <div className="my-4">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-sm font-medium text-white/80 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              <span>Add New Focus Task</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What task are you working on?"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
                autoFocus
              />

              <div className="flex items-center gap-2 text-xs">
                {/* Emoji choices */}
                <select
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                >
                  <option value="🎯">🎯 Focus</option>
                  <option value="📝">📝 Note</option>
                  <option value="💻">💻 Code</option>
                  <option value="📚">📚 Study</option>
                  <option value="🌱">🌱 Habit</option>
                </select>

                {/* Priority */}
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>

                {/* Est time */}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-white/50">Est:</span>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={newEst}
                    onChange={(e) => setNewEst(Number(e.target.value))}
                    className="w-14 px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-center font-mono focus:outline-none"
                  />
                  <span className="text-white/50">m</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Task List with Drag-and-Drop */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-white/40 text-sm">
              <Sparkles className="w-8 h-8 text-violet-400/40 mx-auto mb-2" />
              <p>No tasks yet.</p>
              <p className="text-xs text-white/30 mt-1">Add one thing you want to focus on.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {incompleteTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}

                {completedTasks.length > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                      <span>Completed ({completedTasks.length})</span>
                      <button
                        onClick={clearCompleted}
                        className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                      >
                        <Trash className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};
