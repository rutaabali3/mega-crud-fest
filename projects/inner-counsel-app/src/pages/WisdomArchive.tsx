import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion } from "framer-motion";
import { Search, Calendar, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function WisdomArchive() {
  const navigate = useNavigate();
  const { sessions, getAdvisor, deleteSession } = useAdvisorStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return [...sessions]
      .filter((s) => s.question.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, search]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-6xl mb-4">📜</div>
          <h1 className="font-serif text-3xl font-bold mb-2">No Wisdom Yet</h1>
          <p className="text-muted-foreground max-w-md">
            Your archive of council meetings will appear here after your first session.
          </p>
        </motion.div>
        <Button onClick={() => navigate("/meeting/new")}>Start a Meeting</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-2">Wisdom Archive</h1>
      <p className="text-muted-foreground mb-6">{sessions.length} session{sessions.length !== 1 && "s"} recorded</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              className="cursor-pointer hover:border-primary/30 transition-all border-border"
              onClick={() => navigate(`/meeting/${session.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold line-clamp-2 mb-1">{session.question}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span>{session.responses.length} response{session.responses.length !== 1 && "s"}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {session.participants.slice(0, 5).map((pid) => {
                        const a = getAdvisor(pid);
                        return a ? (
                          <span key={pid} className="text-lg" title={a.name}>{a.avatar}</span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
