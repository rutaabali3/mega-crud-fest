import { useEffect, useRef } from "react";
import { getStorage } from "@/utils/storage";
import { generateSeedMedications, generateSeedLogs, generateSeedSymptoms } from "@/utils/seedData";
import { setStorage } from "@/utils/storage";
import { Medication, DoseLog, SymptomEntry } from "@/types";

const MEDS_KEY = "medilog_medications";
const LOGS_KEY = "medilog_logs";
const SYMPTOMS_KEY = "medilog_symptoms";
const SEEDED_KEY = "medilog_seeded";

export function useSeedData() {
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    const alreadySeeded = getStorage<boolean>(SEEDED_KEY, false);
    if (alreadySeeded) return;

    const existingMeds = getStorage<Medication[]>(MEDS_KEY, []);
    if (existingMeds.length > 0) {
      setStorage(SEEDED_KEY, true);
      return;
    }

    const meds = generateSeedMedications();
    const logs = generateSeedLogs(meds);
    const symptoms = generateSeedSymptoms(meds);

    setStorage(MEDS_KEY, meds);
    setStorage(LOGS_KEY, logs);
    setStorage(SYMPTOMS_KEY, symptoms);
    setStorage(SEEDED_KEY, true);

    // Force reload to pick up seeded data
    window.location.reload();
  }, []);
}
