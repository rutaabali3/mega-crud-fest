import React from "react";
import { Trip, DetailTab } from "@/types/trip";
import { ArrowLeft } from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import ItineraryTab from "./tabs/ItineraryTab";
import PackingTab from "./tabs/PackingTab";
import NotesTab from "./tabs/NotesTab";

interface Props {
  trip: Trip;
  updateTrip: (t: Trip) => void;
  deleteTrip: (id: string) => void;
  tab: DetailTab;
  setTab: (t: DetailTab) => void;
  goBack: () => void;
}

export default function TripDetail({ trip, updateTrip, deleteTrip, tab, setTab, goBack }: Props) {
  return (
    <div className="animate-fade-in">
      <button onClick={goBack} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-print">
        <ArrowLeft className="h-4 w-4" /> Back to trips
      </button>

      {/* Mobile tab bar */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 sm:hidden no-print">
        {(["overview", "itinerary", "packing", "notes"] as DetailTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab trip={trip} updateTrip={updateTrip} deleteTrip={deleteTrip} />}
      {tab === "itinerary" && <ItineraryTab trip={trip} updateTrip={updateTrip} />}
      {tab === "packing" && <PackingTab trip={trip} updateTrip={updateTrip} />}
      {tab === "notes" && <NotesTab trip={trip} updateTrip={updateTrip} />}
    </div>
  );
}
