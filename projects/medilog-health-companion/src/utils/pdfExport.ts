import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Medication, DoseLog, SymptomEntry, SEVERITY_LABELS } from "@/types";
import { format, parseISO, subDays, isBefore } from "date-fns";

const FREQ_LABELS: Record<string, string> = {
  daily: "Daily",
  twice_daily: "Twice Daily",
  three_times: "3× Daily",
  weekly: "Weekly",
  as_needed: "As Needed",
  custom: "Custom",
};

export function generatePdf(medications: Medication[], logs: DoseLog[], symptoms: SymptomEntry[]) {
  const doc = new jsPDF();
  const now = new Date();
  const cutoff = subDays(now, 30);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("MediLog Health Report", 14, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Generated ${format(now, "MMMM d, yyyy 'at' h:mm a")}`, 14, 30);
  doc.text("💊 MediLog", pageWidth - 40, 15);
  doc.setTextColor(0);

  // Section 1 — Medication List
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. Medication List", 14, 44);

  autoTable(doc, {
    startY: 48,
    head: [["Name", "Dosage", "Frequency", "Prescriber", "Start Date", "End Date", "Status"]],
    body: medications.map((m) => [
      m.name,
      m.dosage,
      FREQ_LABELS[m.frequency] || m.frequency,
      m.prescriber,
      format(parseISO(m.startDate), "MMM d, yyyy"),
      m.endDate ? format(parseISO(m.endDate), "MMM d, yyyy") : "Ongoing",
      m.isActive ? "Active" : "Inactive",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] },
    alternateRowStyles: { fillColor: [240, 245, 250] },
  });

  // Section 2 — Adherence Summary
  const lastY = (doc as unknown as Record<string, unknown> & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. Adherence Summary (Last 30 Days)", 14, lastY + 14);

  const periodLogs = logs.filter((l) => {
    const d = parseISO(l.scheduledTime);
    return isBefore(cutoff, d) && l.status !== "pending";
  });
  const taken = periodLogs.filter((l) => l.status === "taken").length;
  const overall = periodLogs.length > 0 ? Math.round((taken / periodLogs.length) * 100) : 0;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Overall Adherence: ${overall}% (${taken}/${periodLogs.length} doses taken)`, 14, lastY + 22);

  const medAdherence = medications.filter((m) => m.isActive).map((m) => {
    const mLogs = periodLogs.filter((l) => l.medicationId === m.id);
    const mTaken = mLogs.filter((l) => l.status === "taken").length;
    const rate = mLogs.length > 0 ? Math.round((mTaken / mLogs.length) * 100) : 0;
    return [m.name, `${rate}%`, `${mTaken}/${mLogs.length}`];
  });

  autoTable(doc, {
    startY: lastY + 26,
    head: [["Medication", "Adherence", "Taken/Total"]],
    body: medAdherence,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 148, 136] },
    alternateRowStyles: { fillColor: [240, 245, 250] },
  });

  // Section 3 — Dose Log
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. Dose Log (Last 30 Days)", 14, 20);

  const sortedLogs = [...periodLogs].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  autoTable(doc, {
    startY: 26,
    head: [["Date", "Medication", "Scheduled Time", "Status", "Notes"]],
    body: sortedLogs.map((l) => {
      const med = medications.find((m) => m.id === l.medicationId);
      return [
        format(parseISO(l.scheduledTime), "MMM d"),
        med?.name || "Unknown",
        format(parseISO(l.scheduledTime), "h:mm a"),
        l.status,
        l.notes || "",
      ];
    }),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [13, 148, 136] },
    alternateRowStyles: { fillColor: [240, 245, 250] },
  });

  // Section 4 — Symptom Journal
  const lastY3 = (doc as unknown as Record<string, unknown> & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100;
  const needNewPage = lastY3 > 200;
  if (needNewPage) doc.addPage();

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("4. Symptom Journal", 14, needNewPage ? 20 : lastY3 + 14);

  const periodSymptoms = symptoms.filter((s) => isBefore(cutoff, parseISO(s.date)));

  autoTable(doc, {
    startY: needNewPage ? 26 : lastY3 + 18,
    head: [["Date", "Symptom", "Severity", "Linked Medications", "Notes"]],
    body: periodSymptoms.map((s) => [
      format(parseISO(s.date), "MMM d"),
      s.symptom,
      `${s.severity}/5 (${SEVERITY_LABELS[s.severity]})`,
      s.linkedMedicationIds.map((id) => medications.find((m) => m.id === id)?.name || "").filter(Boolean).join(", "),
      s.notes || "",
    ]),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [13, 148, 136] },
    alternateRowStyles: { fillColor: [240, 245, 250] },
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("For personal use only. Bring this report to your healthcare provider.", 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`MediLog-Report-${format(now, "yyyy-MM-dd")}.pdf`);
}
