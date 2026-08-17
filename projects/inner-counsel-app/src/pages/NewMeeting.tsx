import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion } from "framer-motion";
import { ArrowLeft, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function NewMeeting() {
  const navigate = useNavigate();
  const { advisors, addSession } = useAdvisorStore();
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleAdvisor = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectRandom = () => {
    const count = Math.min(3, advisors.length);
    const shuffled = [...advisors].sort(() => Math.random() - 0.5);
    setSelected(shuffled.slice(0, count).map((a) => a.id));
  };

  const begin = () => {
    if (!question.trim()) {
      toast.error("Please enter your question");
      return;
    }
    if (selected.length === 0) {
      toast.error("Select at least one advisor");
      return;
    }
    const session = addSession({
      question: question.trim(),
      participants: selected,
      responses: [],
    });
    navigate(`/meeting/${session.id}`);
  };

  if (advisors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4">
        <div className="text-6xl">🏛️</div>
        <h1 className="font-serif text-2xl font-bold">No Advisors Available</h1>
        <p className="text-muted-foreground">Create advisors first before convening a meeting.</p>
        <Button onClick={() => navigate("/advisors/new")}>Create an Advisor</Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-3xl font-bold mb-2">New Council Meeting</h1>
        <p className="text-muted-foreground mb-8">Present your dilemma to the council.</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Your Question or Dilemma</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What decision are you facing? What would you like counsel on?"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Select Advisors</Label>
              <Button variant="ghost" size="sm" onClick={selectRandom}>
                <Shuffle className="mr-2 h-4 w-4" /> Random
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advisors.map((advisor) => (
                <label
                  key={advisor.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selected.includes(advisor.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Checkbox
                    checked={selected.includes(advisor.id)}
                    onCheckedChange={() => toggleAdvisor(advisor.id)}
                  />
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: advisor.color + "22" }}
                  >
                    {advisor.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{advisor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{advisor.title}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={begin} size="lg" className="w-full" disabled={!question.trim() || selected.length === 0}>
            Begin Council Meeting
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
