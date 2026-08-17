import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Menu, Download, Orbit } from "lucide-react";
import { CosmicScene } from "@/components/three/CosmicScene";
import { AddBodyModal } from "@/components/ui/AddBodyModal";
import { BodySidebar } from "@/components/ui/BodySidebar";
import { InfoCard } from "@/components/ui/InfoCard";
import { useCelestialBodies } from "@/hooks/useCelestialBodies";
import type { CelestialBody } from "@/types/celestial";

const Index = () => {
  const { bodies, addBody, updateBody, removeBody } = useCelestialBodies();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBody, setEditBody] = useState<CelestialBody | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const selectedBody = bodies.find((b) => b.id === selectedId) ?? null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `orbit-mandala-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  const handleEdit = useCallback((body: CelestialBody) => {
    setEditBody(body);
    setShowAddModal(true);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* 3D Scene */}
      <CosmicScene
        bodies={bodies}
        selectedId={selectedId}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        canvasRef={canvasRef}
      />

      {/* Top-left title */}
      <motion.div
        className="fixed left-6 top-6 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-primary tracking-wide flex items-center gap-2">
          <Orbit className="h-6 w-6 md:h-7 md:w-7" />
          Orbit Mandala
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">{today}</p>
      </motion.div>

      {/* Top-right controls */}
      <motion.div
        className="fixed right-6 top-6 z-30 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleExport}
          className="glass rounded-full p-2.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Export as PNG"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowSidebar(true)}
          className="glass rounded-full p-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>
      </motion.div>

      {/* Bottom center: Add button + counter */}
      <motion.div
        className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Empty state */}
        <AnimatePresence>
          {bodies.length === 0 && (
            <motion.p
              className="mb-4 text-center text-sm text-muted-foreground max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              Your life is empty space… add your first memory
            </motion.p>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setEditBody(null); setShowAddModal(true); }}
          className="glass glow-gold rounded-full px-6 py-3 flex items-center gap-2 text-primary font-medium hover:scale-105 transition-transform"
        >
          <Plus className="h-5 w-5" />
          Add Body
        </button>
        <p className="text-xs text-muted-foreground">
          {bodies.length} {bodies.length === 1 ? "body" : "bodies"} in orbit
        </p>
      </motion.div>

      {/* Info card for selected body */}
      <InfoCard body={selectedBody} onClose={handleDeselect} />

      {/* Sidebar */}
      <BodySidebar
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        bodies={bodies}
        selectedId={selectedId}
        onSelect={(id) => { handleSelect(id); setShowSidebar(false); }}
        onDelete={removeBody}
        onEdit={handleEdit}
      />

      {/* Add/Edit modal */}
      <AddBodyModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditBody(null); }}
        onAdd={addBody}
        editBody={editBody}
        onUpdate={updateBody}
      />
    </div>
  );
};

export default Index;
