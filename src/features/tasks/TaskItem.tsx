import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types/task';
import { useTaskStore } from '../../stores/useTaskStore';
import { GripVertical, Trash2, CheckCircle, Circle, Target } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { currentTaskId, toggleTask, deleteTask, setCurrentTask } = useTaskStore();
  const isCurrent = currentTaskId === task.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
        isCurrent
          ? 'bg-violet-950/40 border-violet-500/40 shadow-lg shadow-violet-900/10'
          : task.completed
          ? 'bg-neutral-900/40 border-white/5 opacity-60'
          : 'bg-neutral-900/60 border-white/10 hover:border-white/20 hover:bg-neutral-900/80'
      }`}
    >
      {/* Left: Drag Handle + Checkbox */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing p-0.5 rounded touch-none"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          onClick={() => toggleTask(task.id)}
          className="text-white/40 hover:text-white transition-colors"
          title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
          ) : (
            <Circle className="w-5 h-5 hover:text-violet-400 transition-colors" />
          )}
        </button>

        <span className="text-base select-none">{task.emoji || '✨'}</span>

        <div className="flex-1 min-w-0">
          <span
            className={`text-sm block truncate ${
              task.completed ? 'line-through text-white/40' : 'text-white/90 font-medium'
            }`}
          >
            {task.title}
          </span>

          {/* Time and Priority Meta */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50">
            <span className="font-mono">
              {task.elapsedMinutes}m / {task.estimatedMinutes}m
            </span>
            <span>·</span>
            <span
              className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Set as Current Focus + Delete */}
      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        {!task.completed && (
          <button
            onClick={() => setCurrentTask(isCurrent ? null : task.id)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isCurrent
                ? 'bg-violet-600 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            title={isCurrent ? 'Currently focused' : 'Set as Current Focus'}
          >
            <Target className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => deleteTask(task.id)}
          className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
