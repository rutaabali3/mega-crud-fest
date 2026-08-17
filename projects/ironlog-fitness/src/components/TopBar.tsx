import { format } from "date-fns";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between py-4 px-2 sm:px-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEE, MMM d yyyy")}
          </p>
        </div>
      </div>
      <Button
        onClick={() => navigate("/log")}
        className="rounded-full px-5 font-bold gap-2"
      >
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Start Workout</span>
      </Button>
    </header>
  );
}
