import { useCraft } from "@/context/CraftContext";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MaterialsInventory() {
  const { projects } = useCraft();

  const activeProjects = projects.filter((p) => p.status === "wip");

  type MaterialRow = { name: string; project: string; quantity: string; unit: string; cost: number };
  const allMaterials: MaterialRow[] = [];
  activeProjects.forEach((p) => {
    p.materials.forEach((m) => {
      allMaterials.push({ name: m.name, project: p.title, quantity: m.quantity, unit: m.unit, cost: m.costPaid });
    });
  });

  const totalCost = allMaterials.reduce((s, m) => s + m.cost, 0);

  // Group by material name
  const grouped = allMaterials.reduce<Record<string, MaterialRow[]>>((acc, m) => {
    const key = m.name.toLowerCase().trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  if (allMaterials.length === 0) {
    return (
      <EmptyState
        emoji="📦"
        title="No materials tracked yet"
        description="Add materials to your projects and they'll appear here."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">Materials Inventory</h1>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold text-sm">
          Total: ${totalCost.toFixed(2)}
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Used In</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(grouped).map(([key, items]) => (
              items.map((m, idx) => (
                <TableRow key={`${key}-${idx}`}>
                  <TableCell className={idx === 0 ? "font-medium" : "pl-8 text-muted-foreground"}>
                    {idx === 0 ? m.name : "↳"}
                  </TableCell>
                  <TableCell>{m.project}</TableCell>
                  <TableCell>{m.quantity}</TableCell>
                  <TableCell>{m.unit}</TableCell>
                  <TableCell className="text-right">${m.cost.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
