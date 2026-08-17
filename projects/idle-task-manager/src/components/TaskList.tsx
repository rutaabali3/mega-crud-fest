import { useCallback, useState } from "react";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/types/task";

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onReorder: (from: number, to: number) => void;
}

export function TaskList({ tasks, onToggle, onEdit, onReorder }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== index) {
        onReorder(dragIndex, index);
        setDragIndex(index);
      }
    },
    [dragIndex, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  return (
    <div className="flex flex-col gap-2 px-4 pb-24 sm:px-6">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className="transition-transform"
        >
          <TaskCard
            task={task}
            onToggle={() => onToggle(task.id)}
            onClick={() => onEdit(task)}
            dragHandleProps={{
              onMouseDown: (e) => e.stopPropagation(),
            }}
          />
        </div>
      ))}
    </div>
  );
}
