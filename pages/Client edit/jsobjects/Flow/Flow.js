export default {
  save: async () => {
    if (!(ClientNameInput.text || "").trim()) return showAlert("Enter a name.", "warning");
    const id = appsmith.URL.queryParams.id;
    try {
      if (id) { await updateClient.run(); showAlert("Client saved", "success"); navigateTo("Client", {id}, "SAME_WINDOW"); }
      else { const r = await addClient.run(); showAlert("Client " + r[0].code + " added", "success"); navigateTo("Client", {id: r[0].id}, "SAME_WINDOW"); }
    } catch (e) { showAlert("Save failed: " + (e.message || e), "error"); }
  },
  cancel: () => appsmith.URL.queryParams.id ? navigateTo("Client", {id: appsmith.URL.queryParams.id}, "SAME_WINDOW") : navigateTo("Clients", {}, "SAME_WINDOW")
}
