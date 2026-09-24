export default {
  save: async () => {
    if (!(SampleNameInput.text || "").trim()) return showAlert("Enter a name.", "warning");
    try { await updateSample.run(); } catch (e) { return showAlert("Save failed: " + (e.message || e), "error"); }
    showAlert("Sample saved", "success");
    navigateTo("Request", {id: appsmith.URL.queryParams.rid}, "SAME_WINDOW");
  }
}
