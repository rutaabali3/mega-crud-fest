import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Swords, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export default function MeetingRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSession, addResponse, getAdvisor, updateSession } = useAdvisorStore();
  const session = getSession(id || "");

  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [debateMode, setDebateMode] = useState(false);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Session not found.</p>
      </div>
    );
  }

  const participants = session.participants.map((pid) => getAdvisor(pid)).filter(Boolean);

  const handleSendResponse = () => {
    if (!activeAdvisor || !responseText.trim()) return;
    addResponse(session.id, activeAdvisor, responseText.trim());
    setResponseText("");
    toast.success("Response recorded");
  };

  const suggestStarter = () => {
    const advisor = getAdvisor(activeAdvisor || "");
    if (!advisor) return;
    const starters = [
      `As someone who values ${advisor.traits[0] || "wisdom"}, I would say...`,
      `From my perspective as ${advisor.title}, consider this...`,
      `In my ${advisor.voiceStyle.toLowerCase()} manner, let me offer...`,
      `Drawing from my experience, here's what I see...`,
    ];
    setResponseText(starters[Math.floor(Math.random() * starters.length)]);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Council Meeting Transcript", 20, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date(session.date).toLocaleDateString()}`, 20, 30);
    doc.setFontSize(12);
    doc.text("Question:", 20, 45);
    const questionLines = doc.splitTextToSize(session.question, 170);
    doc.setFontSize(10);
    doc.text(questionLines, 20, 52);

    let y = 52 + questionLines.length * 5 + 10;
    session.responses.forEach((r) => {
      const advisor = getAdvisor(r.advisorId);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.text(`${advisor?.name || "Unknown"} (${advisor?.title || ""})`, 20, y);
      y += 6;
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(r.responseText, 170);
      doc.text(lines, 20, y);
      y += lines.length * 4 + 8;
    });

    doc.save(`council-meeting-${session.id.slice(0, 8)}.pdf`);
    toast.success("PDF exported");
  };

  const leftSide = participants.slice(0, Math.ceil(participants.length / 2));
  const rightSide = participants.slice(Math.ceil(participants.length / 2));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant={debateMode ? "default" : "outline"}
            size="sm"
            onClick={() => setDebateMode(!debateMode)}
          >
            <Swords className="mr-2 h-4 w-4" /> Debate
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <FileDown className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">The Question Before the Council</p>
            <p className="font-serif text-lg font-semibold">{session.question}</p>
          </CardContent>
        </Card>

        {/* Advisor selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {participants.map((advisor) => advisor && (
            <button
              key={advisor.id}
              onClick={() => setActiveAdvisor(advisor.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                activeAdvisor === advisor.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <span className="text-lg">{advisor.avatar}</span>
              <span className="text-sm font-medium">{advisor.name}</span>
            </button>
          ))}
        </div>

        {/* Responses */}
        {debateMode && participants.length >= 2 ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[leftSide, rightSide].map((side, si) => (
              <div key={si} className="space-y-3">
                <p className="text-xs text-muted-foreground text-center font-semibold uppercase tracking-wider">
                  {si === 0 ? "Position A" : "Position B"}
                </p>
                {session.responses
                  .filter((r) => side.some((a) => a?.id === r.advisorId))
                  .map((r, i) => {
                    const adv = getAdvisor(r.advisorId);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: si === 0 ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}>
                        <Card style={{ borderLeftColor: adv?.color, borderLeftWidth: 3 }}>
                          <CardContent className="p-3">
                            <p className="text-xs font-semibold mb-1">{adv?.avatar} {adv?.name}</p>
                            <p className="text-sm">{r.responseText}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {session.responses.map((r, i) => {
                const adv = getAdvisor(r.advisorId);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card style={{ borderLeftColor: adv?.color, borderLeftWidth: 3 }}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{adv?.avatar}</span>
                          <span className="font-semibold text-sm">{adv?.name}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">{adv?.voiceStyle}</Badge>
                        </div>
                        <p className="text-sm leading-relaxed">{r.responseText}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Input */}
        {activeAdvisor && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getAdvisor(activeAdvisor)?.avatar}</span>
              <span className="font-semibold text-sm">
                Speaking as {getAdvisor(activeAdvisor)?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={suggestStarter} className="ml-auto text-xs">
                Suggest starter
              </Button>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder={`What would ${getAdvisor(activeAdvisor)?.name} say?`}
                rows={3}
                className="flex-1"
              />
              <Button onClick={handleSendResponse} disabled={!responseText.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {!activeAdvisor && (
          <p className="text-center text-muted-foreground py-4">
            Select an advisor above to begin speaking on their behalf.
          </p>
        )}
      </motion.div>
    </div>
  );
}
