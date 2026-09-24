export default {
  addTip: async () => {
    if (!(TipTitleInput.text || "").trim()) return showAlert("Enter a tip title.", "warning");
    try { await addTip.run(); } catch (e) { return showAlert("Could not add: " + (e.message || e), "error"); }
    await resetWidget("TipTitleInput", true); await resetWidget("TipDetailInput", true); await getTips.run(); showAlert("Tip added", "success");
  },
  addMaintenance: async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(MaintDateInput.text || "")) return showAlert("Date must look like 2026-09-15.", "warning");
    try { await addMaintenance.run(); } catch (e) { return showAlert("Could not add: " + (e.message || e), "error"); }
    await resetWidget("MaintNoteInput", true); await getMaintenance.run(); showAlert("Maintenance entry added", "success");
  }
}
