export default {
  reset: async () => { for (const n of ["ClientNameInput","ClientContactInput","ClientEmailInput","ClientBillingInput"]) await resetWidget(n, true); await getClientRequests.run(); },
  save: async () => {
    if (!ClientsTable.selectedRow || !ClientsTable.selectedRow.id) return showAlert("Select a client first.", "warning");
    if (!(ClientNameInput.text || "").trim()) return showAlert("Enter a name.", "warning");
    try { await updateClient.run(); } catch (e) { return showAlert("Save failed: " + (e.message || e), "error"); }
    await getClients.run(); showAlert("Client saved", "success");
  },
  add: async () => {
    if (!(NewClientName.text || "").trim()) return showAlert("Enter a name.", "warning");
    try { await addClient.run(); } catch (e) { return showAlert("Could not add: " + (e.message || e), "error"); }
    for (const n of ["NewClientName","NewClientContact","NewClientEmail","NewClientBilling"]) await resetWidget(n, true);
    await getClients.run(); showAlert("Client added", "success");
  },
  open: async () => { await storeValue("requestFocus", ClientRequestsTable.selectedRow.code); navigateTo("Requests", {}, "SAME_WINDOW"); }
}
