export default {
  onLoad: async () => { await storeValue("equipmentFilter", appsmith.URL.queryParams.filter === "down" ? "down" : ""); },
  rows: () => (getEquipment.data || []).filter(e => (ShowInactiveEquipment.isChecked || e.active) && (appsmith.store.equipmentFilter !== "down" || e.condition !== "Available"))
    .map(e => ({...e, state: e.active ? "" : "inactive"}))
}
