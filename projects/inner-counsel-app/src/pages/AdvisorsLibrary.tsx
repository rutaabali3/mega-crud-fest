import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdvisorsLibrary() {
  const navigate = useNavigate();
  const { advisors } = useAdvisorStore();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "influence">("influence");

  const filtered = useMemo(() => {
    let list = advisors.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.title.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) =>
      sort === "influence" ? b.influence - a.influence : a.name.localeCompare(b.name)
    );
    return list;
  }, [advisors, search, sort]);

  if (advisors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-7xl mb-4">👥</div>
          <h1 className="font-serif text-3xl font-bold mb-2">No Advisors Yet</h1>
          <p className="text-muted-foreground max-w-md">
            Create mentors, future selves, or personality aspects to populate your inner council.
          </p>
        </motion.div>
        <Button size="lg" onClick={() => navigate("/advisors/new")}>
          <Plus className="mr-2 h-5 w-5" /> Create Your First Advisor
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Advisors</h1>
          <p className="text-muted-foreground">{advisors.length} advisor{advisors.length !== 1 && "s"} in your council</p>
        </div>
        <Button onClick={() => navigate("/advisors/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Advisor
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search advisors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as "name" | "influence")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="influence">By Influence</SelectItem>
            <SelectItem value="name">By Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((advisor, i) => (
          <motion.div
            key={advisor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="cursor-pointer hover:border-primary/40 transition-all border-border group"
              onClick={() => navigate(`/advisors/${advisor.id}/edit`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 border-2"
                    style={{
                      backgroundColor: advisor.color + "18",
                      borderColor: advisor.color,
                    }}
                  >
                    {advisor.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{advisor.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{advisor.title}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {advisor.traits.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                      {advisor.traits.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{advisor.traits.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className="mt-3 h-1.5 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${advisor.color}, ${advisor.color}00)`,
                    width: `${advisor.influence * 10}%`,
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
