export default {
  save: async () => {
    if (!(StaffNameInput.text || "").trim()) return showAlert("Enter a name.", "warning");
    const id = appsmith.URL.queryParams.id;
    try {
      if (id) { await updateStaff.run(); showAlert("Saved", "success"); }
      else { const r = await addStaff.run(); showAlert(r[0].code + " added", "success"); }
      navigateTo("Staff", {}, "SAME_WINDOW");
    } catch (e) { showAlert("Save failed: " + (e.message || e), "error"); }
  }
}
