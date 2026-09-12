export default {
  reset: async () => { for (const n of ["EquipmentNameInput","EquipmentConditionSelect","EquipmentLocationInput","EquipmentTipsInput"]) await resetWidget(n, true); await getEquipmentRequests.run(); },
  save: async () => {
    if (!EquipmentTable.selectedRow || !EquipmentTable.selectedRow.id) return showAlert("Select equipment first.", "warning");
    if (!(EquipmentNameInput.text || "").trim()) return showAlert("Enter a name.", "warning");
    try { await updateEquipment.run(); } catch (e) { return showAlert("Save failed: " + (e.message || e), "error"); }
    await getEquipment.run(); showAlert("Equipment saved", "success");
  },
  add: async () => {
    if (!(NewEquipmentName.text || "").trim()) return showAlert("Enter a name.", "warning");
    try { await addEquipment.run(); } catch (e) { return showAlert("Could not add: " + (e.message || e), "error"); }
    for (const n of ["NewEquipmentName","NewEquipmentLocation"]) await resetWidget(n, true);
    await getEquipment.run(); showAlert("Equipment added", "success");
  },
  open: async () => { await storeValue("requestFocus", EquipmentRequestsTable.selectedRow.code); navigateTo("Requests", {}, "SAME_WINDOW"); }
}
