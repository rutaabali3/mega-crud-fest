import { useNavigate } from "react-router-dom";
import { useAdvisorStore } from "@/store/useAdvisorStore";
import { motion } from "framer-motion";
import { Compass, Users, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { advisors, sessions } = useAdvisorStore();

  const topAdvisors = useMemo(
    () => [...advisors].sort((a, b) => b.influence - a.influence).slice(0, 4),
    [advisors]
  );

  const randomAdvisor = useMemo(() => {
    if (advisors.length === 0) return null;
    return advisors[Math.floor(Math.random() * advisors.length)];
  }, [advisors]);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-lg">
          Your council awaits your guidance.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Advisors", value: advisors.length, icon: Users },
          { label: "Sessions", value: sessions.length, icon: MessageCircle },
          {
            label: "Responses",
            value: sessions.reduce((sum, s) => sum + s.responses.length, 0),
            icon: Sparkles,
          },
          {
            label: "Avg Influence",
            value: advisors.length
              ? (advisors.reduce((s, a) => s + a.influence, 0) / advisors.length).toFixed(1)
              : "—",
            icon: Compass,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <stat.icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-serif font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ask the Council CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold">
              Ask the Council
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Present your question to your assembled advisors and gain multifaceted wisdom.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/meeting/new")}
              className="font-semibold"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Begin a New Meeting
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Pulse */}
      {randomAdvisor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="font-serif text-lg font-semibold mb-3 text-muted-foreground">
                Daily Council Pulse
              </h3>
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: randomAdvisor.color + "22" }}
                >
                  {randomAdvisor.avatar}
                </div>
                <div>
                  <p className="font-semibold">{randomAdvisor.name}</p>
                  <p className="text-sm text-muted-foreground italic">
                    "{randomAdvisor.title}" — {randomAdvisor.voiceStyle}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Consider what {randomAdvisor.name.split(" ")[0]} would say about the challenges before you today.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Advisors */}
      {topAdvisors.length > 0 && (
        <div>
          <h3 className="font-serif text-xl font-semibold mb-4">Most Influential</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topAdvisors.map((advisor) => (
              <Card
                key={advisor.id}
                className="cursor-pointer hover:border-primary/40 transition-colors border-border"
                onClick={() => navigate(`/advisors/${advisor.id}/edit`)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-2"
                    style={{ backgroundColor: advisor.color + "22" }}
                  >
                    {advisor.avatar}
                  </div>
                  <p className="font-semibold text-sm">{advisor.name}</p>
                  <p className="text-xs text-muted-foreground">{advisor.title}</p>
                  <div
                    className="mt-2 h-1 rounded-full mx-auto"
                    style={{
                      width: `${advisor.influence * 10}%`,
                      backgroundColor: advisor.color,
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {advisors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <div className="text-6xl mx-auto">🏛️</div>
          <h3 className="font-serif text-2xl font-semibold">Your council is empty</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Begin by creating your first advisor — a mentor, your future self, or any voice you wish to consult.
          </p>
          <Button onClick={() => navigate("/advisors/new")}>
            <Users className="mr-2 h-4 w-4" />
            Create Your First Advisor
          </Button>
        </motion.div>
      )}
    </div>
  );
}
