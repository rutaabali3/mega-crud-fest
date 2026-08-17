import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useStats } from '@/hooks/useStats';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { UpcomingRenewals } from '@/components/dashboard/UpcomingRenewals';
import { ForgottenAlert } from '@/components/dashboard/ForgottenAlert';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { CATEGORY_CONFIG } from '@/utils/categoryConfig';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { useState } from 'react';
import { Subscription } from '@/types/subscription';
import { X } from 'lucide-react';

const Dashboard = () => {
  const { subscriptions, isFirstLoad, addSubscription, updateSubscription, dismissFirstLoad } = useSubscriptions();
  const stats = useStats(subscriptions);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const pieData = Object.entries(stats.categoryBreakdown).map(([cat, data]) => ({
    name: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].label,
    value: Math.round(data.monthly * 100) / 100,
    color: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].color,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {isFirstLoad && (
        <div className="glass-card p-4 flex items-center justify-between border-primary/30 bg-primary/10">
          <p className="text-sm">👋 Welcome! Sample data has been loaded to get you started.</p>
          <button onClick={dismissFirstLoad} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your subscription overview at a glance</p>
      </div>

      <StatsRow
        monthlyTotal={stats.monthlyTotal}
        annualProjection={stats.annualProjection}
        activeCount={stats.activeCount}
        pausedCount={stats.pausedCount}
        hasMixedCurrencies={stats.hasMixedCurrencies}
      />

      <ForgottenAlert forgotten={stats.forgotten} onReview={(s) => { setEditing(s); setFormOpen(true); }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={pieData} />
        <UpcomingRenewals upcoming={stats.upcoming} />
      </div>

      <SubscriptionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={addSubscription}
        onUpdate={updateSubscription}
        editing={editing}
      />
    </div>
  );
};

export default Dashboard;
