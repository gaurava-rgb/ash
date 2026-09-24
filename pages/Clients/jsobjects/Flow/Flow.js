export default {
  rows: () => (getClients.data || []).filter(c => ShowInactiveClients.isChecked || c.active).map(c => ({...c, state: c.active ? "" : "inactive"}))
}
