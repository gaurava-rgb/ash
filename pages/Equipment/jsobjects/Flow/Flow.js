export default {
  rows: () => (getEquipment.data || []).filter(e => ShowInactiveEquipment.isChecked || e.active).map(e => ({...e, state: e.active ? "" : "inactive"}))
}
