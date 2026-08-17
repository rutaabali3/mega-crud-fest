import React, { useState } from "react";
import { Trip, Page, DetailTab } from "@/types/trip";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plane } from "lucide-react";
import MyTrips from "@/components/tripcraft/MyTrips";
import TripDetail from "@/components/tripcraft/TripDetail";
import ToolsPage from "@/components/tripcraft/ToolsPage";

const App = () => {
  const [trips, setTrips] = useLocalStorage<Trip[]>("tripcraft_trips", []);
  const [page, setPage] = useState<Page>("trips");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;

  const updateTrip = (updated: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (selectedTripId === id) {
      setPage("trips");
      setSelectedTripId(null);
    }
  };

  const openTrip = (id: string, tab: DetailTab = "overview") => {
    setSelectedTripId(id);
    setDetailTab(tab);
    setPage("detail");
  };

  const navItems = [
    { key: "trips" as Page, label: "My Trips" },
    { key: "tools" as Page, label: "Tools" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg no-print">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <button
            onClick={() => { setPage("trips"); setSelectedTripId(null); }}
            className="flex items-center gap-2 text-lg font-bold text-primary transition-colors hover:text-secondary"
          >
            <Plane className="h-5 w-5 text-coral" />
            TripCraft
          </button>
          <div className="flex gap-1">
            {navItems.map((n) => (
              <button
                key={n.key}
                onClick={() => { setPage(n.key); if (n.key !== "detail") setSelectedTripId(null); }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  page === n.key
                    ? "bg-secondary/15 text-secondary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {n.label}
              </button>
            ))}
            {page === "detail" && selectedTrip && (
              <>
                {(["overview", "itinerary", "packing", "notes"] as DetailTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      detailTab === tab
                        ? "bg-secondary/15 text-secondary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {page === "trips" && (
          <MyTrips
            trips={trips}
            setTrips={setTrips}
            onOpenTrip={openTrip}
            onDeleteTrip={deleteTrip}
          />
        )}
        {page === "detail" && selectedTrip && (
          <TripDetail
            trip={selectedTrip}
            updateTrip={updateTrip}
            deleteTrip={deleteTrip}
            tab={detailTab}
            setTab={setDetailTab}
            goBack={() => setPage("trips")}
          />
        )}
        {page === "tools" && <ToolsPage trips={trips} />}
      </main>
    </div>
  );
};

export default App;
