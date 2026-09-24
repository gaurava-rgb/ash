export default {
  rows: () => (getStaff.data || []).filter(s => ShowInactiveStaff.isChecked || s.active).map(s => ({...s, state: s.active ? "" : "inactive"}))
}
