export default {
  validDate: (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + "T00:00:00Z").getTime())),
  create: async () => {
    if (!(NewTitleInput.text || "").trim()) return showAlert("A title is required.", "warning");
    if (!Flow.validDate(NewDueInput.text) || !Flow.validDate(NewSubmittedInput.text)) return showAlert("Dates must look like 2026-09-15.", "warning");
    let created;
    try { created = await createRequest.run(); } catch (e) { return showAlert("Could not create: " + (e.message || e), "error"); }
    showAlert("Request " + created[0].code + " created", "success");
    navigateTo("Request", {id: created[0].id}, "SAME_WINDOW");
  }
}
