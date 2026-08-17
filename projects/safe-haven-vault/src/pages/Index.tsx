import { useVault } from "@/contexts/VaultContext";
import LockScreen from "@/components/LockScreen";
import VaultDashboard from "@/components/VaultDashboard";

const Index = () => {
  const { isLocked, isPinConfigured } = useVault();

  if (isLocked || !isPinConfigured) {
    return <LockScreen />;
  }

  return <VaultDashboard />;
};

export default Index;
