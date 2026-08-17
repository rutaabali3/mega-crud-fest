import { Film, Tv, Star, Eye, Clock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardPageProps {
  stats: { total: number; watched: number; watching: number; toWatch: number; avgRating: number };
}

export function DashboardPage({ stats }: DashboardPageProps) {
  const cards = [
    { label: "Total Titles", value: stats.total, icon: Film, color: "text-primary" },
    { label: "Watched", value: stats.watched, icon: Eye, color: "text-emerald-400" },
    { label: "Watching", value: stats.watching, icon: Clock, color: "text-secondary" },
    { label: "To Watch", value: stats.toWatch, icon: Tv, color: "text-primary" },
    { label: "Avg Rating", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—", icon: Star, color: "text-secondary" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-4xl font-bold text-glow-purple">
          Cinema<span className="text-secondary">Vault</span>
        </h1>
        <p className="text-muted-foreground">Your personal movie & series watchlist</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-card p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {stats.total === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16 space-y-4"
        >
          <div className="text-6xl">🎬</div>
          <h2 className="text-xl font-semibold">Your vault is empty</h2>
          <p className="text-muted-foreground">Click "Add New Title" to start building your watchlist!</p>
        </motion.div>
      )}

      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Quick Stats</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {stats.total} titles • {stats.watched} watched • {stats.watching} watching •{" "}
            {stats.avgRating > 0 ? `Average rating ${stats.avgRating.toFixed(1)}/10` : "No ratings yet"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
