export default {
  rows: () => {
    const q = (RequestSearch.text || "").trim().toLowerCase();
    const status = RequestStatusFilter.selectedOptionValue || "All";
    return (getRequests.data || []).filter(r => (status === "All" || r.status === status) &&
      [r.code, r.title, r.client, r.equipment, r.assignee, r.status].join(" ").toLowerCase().includes(q));
  },
  focusIndex: () => Math.max(0, Flow.rows().findIndex(r => r.code === appsmith.store.requestFocus)),
  selectRow: async () => {
    if (RequestsTable.selectedRow && RequestsTable.selectedRow.code) await storeValue("requestFocus", RequestsTable.selectedRow.code);
    await Flow.resetDetail();
    await getSamples.run();
  },
  resetDetail: async () => {
    for (const n of ["RequestTitleInput","RequestClientSelect","RequestEquipmentSelect","RequestStatusSelect","RequestAssigneeSelect","RequestSubmittedInput","RequestDueInput","RequestSaveInput","RequestNotesInput","SamplesTable"]) await resetWidget(n, true);
    await Flow.resetSample();
  },
  resetSample: async () => { for (const n of ["SampleScan","SampleExport","SampleEmail","SampleTimeInput"]) await resetWidget(n, true); },
  validDate: (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + "T00:00:00Z").getTime())),
  saveRequest: async () => {
    if (!RequestsTable.selectedRow || !RequestsTable.selectedRow.id) return showAlert("Select a request first.", "warning");
    if (!(RequestTitleInput.text || "").trim()) return showAlert("Enter a title.", "warning");
    if (!Flow.validDate(RequestDueInput.text) || !Flow.validDate(RequestSubmittedInput.text)) return showAlert("Dates must look like 2026-09-15.", "warning");
    try { await updateRequest.run(); } catch (e) { return showAlert("Save failed: " + (e.message || e), "error"); }
    await getRequests.run();
    showAlert("Request saved", "success");
  },
  saveSample: async () => {
    if (!SamplesTable.selectedRow || !SamplesTable.selectedRow.id) return showAlert("Select a sample first.", "warning");
    try { await updateSample.run(); } catch (e) { return showAlert("Save failed: " + (e.message || e), "error"); }
    await getSamples.run(); await getRequests.run();
    showAlert("Sample saved", "success");
  },
  addSample: async () => {
    if (!RequestsTable.selectedRow || !RequestsTable.selectedRow.id) return showAlert("Select a request first.", "warning");
    if (!(NewSampleInput.text || "").trim()) return showAlert("Enter a sample name.", "warning");
    try { await addSample.run(); } catch (e) { return showAlert("Could not add: " + (e.message || e), "error"); }
    await resetWidget("NewSampleInput", true); await getSamples.run(); await getRequests.run();
  },
  openNew: async () => { await nextCode.run(); await storeValue("showNew", true); for (const n of ["NewCodeInput","NewTitleInput","NewClientSelect","NewEquipmentSelect","NewAssigneeSelect","NewSubmittedInput","NewDueInput","NewNotesInput"]) await resetWidget(n, true); },
  closeNew: async () => storeValue("showNew", false),
  createRequest: async () => {
    if (!(NewCodeInput.text || "").trim() || !(NewTitleInput.text || "").trim()) return showAlert("ID and title are required.", "warning");
    if (!NewClientSelect.selectedOptionValue || !NewEquipmentSelect.selectedOptionValue) return showAlert("Choose a client and equipment.", "warning");
    if (!Flow.validDate(NewDueInput.text) || !Flow.validDate(NewSubmittedInput.text)) return showAlert("Dates must look like 2026-09-15.", "warning");
    let created;
    try { created = await createRequest.run(); } catch (e) { return showAlert("Could not create: " + (e.message || e), "error"); }
    await storeValue("requestFocus", created[0].code); await storeValue("showNew", false);
    await getRequests.run(); await resetWidget("RequestsTable", true); await Flow.resetDetail();
    showAlert("Request " + created[0].code + " created", "success");
  }
}
