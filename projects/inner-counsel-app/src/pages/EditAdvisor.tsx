import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion } from "framer-motion";
import { ArrowLeft, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["🧙", "👩‍💼", "🦉", "🎭", "⚔️", "🌿", "🔮", "🧠", "🦊", "👑", "🌊", "🔥", "💎", "🛡️", "🎯", "🌙"];
const COLOR_OPTIONS = ["#C8A96E", "#6E8FC8", "#C86E6E", "#6EC896", "#9B6EC8", "#C8996E", "#6EC8C8", "#C86EB5"];

export default function EditAdvisor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getAdvisor, updateAdvisor, deleteAdvisor } = useAdvisorStore();
  const advisor = getAdvisor(id || "");

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [avatar, setAvatar] = useState("🧙");
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [backstory, setBackstory] = useState("");
  const [influence, setInfluence] = useState(5);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (advisor) {
      setName(advisor.name);
      setTitle(advisor.title);
      setAvatar(advisor.avatar);
      setTraits(advisor.traits);
      setVoiceStyle(advisor.voiceStyle);
      setBackstory(advisor.backstory);
      setInfluence(advisor.influence);
      setColor(advisor.color);
    }
  }, [advisor]);

  if (!advisor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Advisor not found.</p>
      </div>
    );
  }

  const addTrait = () => {
    const t = traitInput.trim();
    if (t && traits.length < 6 && !traits.includes(t)) {
      setTraits([...traits, t]);
      setTraitInput("");
    }
  };

  const handleSave = () => {
    if (!name.trim() || !title.trim()) {
      toast.error("Name and title are required");
      return;
    }
    updateAdvisor(advisor.id, { name, title, avatar, traits, voiceStyle, backstory, influence, color });
    toast.success("Advisor updated");
    navigate("/advisors");
  };

  const handleDelete = () => {
    deleteAdvisor(advisor.id);
    toast.success(`${advisor.name} has left the council`);
    navigate("/advisors");
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold">Edit Advisor</h1>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-card border border-border">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2"
            style={{ backgroundColor: color + "22", borderColor: color }}>
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-lg">{name || "Advisor Name"}</p>
            <p className="text-sm text-muted-foreground">{title || "Title"}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Avatar</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} onClick={() => setAvatar(e)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 transition-all ${avatar === e ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voiceStyle">Voice Style</Label>
            <Input id="voiceStyle" value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Traits (max 6)</Label>
            <div className="flex gap-2">
              <Input value={traitInput} onChange={(e) => setTraitInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTrait())}
                placeholder="Add a trait..." disabled={traits.length >= 6} />
              <Button variant="secondary" onClick={addTrait} disabled={traits.length >= 6}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {traits.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground">
                  {t}
                  <button onClick={() => setTraits(traits.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory">Backstory</Label>
            <Textarea id="backstory" value={backstory} onChange={(e) => setBackstory(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Influence: {influence}</Label>
            <Slider value={[influence]} onValueChange={(v) => setInfluence(v[0])} min={1} max={10} step={1} />
          </div>

          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-2">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <Button onClick={handleSave} size="lg" className="w-full">Save Changes</Button>
        </div>
      </motion.div>
    </div>
  );
}
