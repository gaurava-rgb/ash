export default {
  validDate: (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + "T00:00:00Z").getTime())),
  save: async () => {
    if (!(RequestTitleInput.text || "").trim()) return showAlert("Enter a title.", "warning");
    if (!Flow.validDate(RequestDueInput.text) || !Flow.validDate(RequestSubmittedInput.text)) return showAlert("Dates must look like 2026-09-15.", "warning");
    try { await updateRequest.run(); } catch (e) { return showAlert("Save failed: " + (e.message || e), "error"); }
    showAlert("Request saved", "success");
    navigateTo("Request", {id: appsmith.URL.queryParams.id}, "SAME_WINDOW");
  }
}
