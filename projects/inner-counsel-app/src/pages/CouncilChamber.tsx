import { useNavigate } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion } from "framer-motion";
import { Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Advisor } from "@/types";

function AdvisorSeat({ advisor, index, total }: { advisor: Advisor; index: number; total: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: advisor.id });
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radius = 38;
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    left: `${x}%`,
    top: `${y}%`,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl border-2 shadow-lg transition-shadow ${isDragging ? "shadow-xl ring-2 ring-primary" : ""}`}
        style={{
          backgroundColor: advisor.color + "22",
          borderColor: advisor.color,
        }}
      >
        {advisor.avatar}
      </div>
      <p className="text-xs text-center mt-1 font-medium max-w-[80px] truncate">
        {advisor.name}
      </p>
    </motion.div>
  );
}

export default function CouncilChamber() {
  const navigate = useNavigate();
  const { advisors, reorderAdvisors } = useAdvisorStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const ids = advisors.map((a) => a.id);
      const oldIdx = ids.indexOf(active.id as string);
      const newIdx = ids.indexOf(over.id as string);
      const newIds = [...ids];
      newIds.splice(oldIdx, 1);
      newIds.splice(newIdx, 0, active.id as string);
      reorderAdvisors(newIds);
    }
  };

  if (advisors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-7xl mb-4">🏛️</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            The Council Chamber Awaits
          </h1>
          <p className="text-muted-foreground max-w-md">
            Your round table is empty. Assemble your council by creating advisors who will guide your decisions.
          </p>
        </motion.div>
        <Button size="lg" onClick={() => navigate("/advisors/new")}>
          <Plus className="mr-2 h-5 w-5" /> Create Your First Advisor
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Council Chamber</h1>
        <p className="text-muted-foreground mb-8">
          Drag advisors to reorder by influence. Summon the council when you're ready.
        </p>
      </motion.div>

      <div className="relative w-full aspect-square max-w-lg mx-auto">
        {/* Table */}
        <div className="absolute inset-[15%] rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="absolute inset-[25%] rounded-full border border-primary/10" />

        {/* Center button */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button
            size="lg"
            className="rounded-full w-28 h-28 md:w-32 md:h-32 flex flex-col gap-1 shadow-lg"
            onClick={() => navigate("/meeting/new")}
          >
            <Compass className="h-8 w-8" />
            <span className="text-xs font-semibold">Summon Council</span>
          </Button>
        </div>

        {/* Advisor seats */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={advisors.map((a) => a.id)} strategy={rectSortingStrategy}>
            {advisors.map((advisor, i) => (
              <AdvisorSeat key={advisor.id} advisor={advisor} index={i} total={advisors.length} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
