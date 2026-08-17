import { useGoals } from "@/hooks/useGoals";
import SettingsPage from "@/pages/SettingsPage";

export default function SettingsWrapper() {
  const { exportGoals, importGoals, clearAll } = useGoals();
  return <SettingsPage onExport={exportGoals} onImport={importGoals} onClearAll={clearAll} />;
}
