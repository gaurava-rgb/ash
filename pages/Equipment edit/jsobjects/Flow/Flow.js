export default {
  save: async () => {
    if (!(EquipmentNameInput.text || "").trim()) return showAlert("Enter a name.", "warning");
    const id = appsmith.URL.queryParams.id;
    try {
      if (id) { await updateEquipment.run(); showAlert("Equipment saved", "success"); navigateTo("Equipment item", {id}, "SAME_WINDOW"); }
      else { const r = await addEquipment.run(); showAlert("Equipment " + r[0].code + " added", "success"); navigateTo("Equipment item", {id: r[0].id}, "SAME_WINDOW"); }
    } catch (e) { showAlert("Save failed: " + (e.message || e), "error"); }
  },
  cancel: () => appsmith.URL.queryParams.id ? navigateTo("Equipment item", {id: appsmith.URL.queryParams.id}, "SAME_WINDOW") : navigateTo("Equipment", {}, "SAME_WINDOW")
}
