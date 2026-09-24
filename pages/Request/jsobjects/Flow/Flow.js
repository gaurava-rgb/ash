export default {
  addSample: async () => {
    if (!(NewSampleInput.text || "").trim()) return showAlert("Enter a sample name.", "warning");
    try { await addSample.run(); } catch (e) { return showAlert("Could not add: " + (e.message || e), "error"); }
    await resetWidget("NewSampleInput", true); await getSamples.run(); await getChanges.run();
    showAlert("Sample added", "success");
  }
}
