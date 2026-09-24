export default {
  onLoad: async () => {
    const f = appsmith.URL.queryParams.filter || "";
    await storeValue("statusFilter", f === "blocked" ? "Blocked" : "All");
    await storeValue("quickFilter", ["open", "unassigned", "overdue"].includes(f) ? f : "");
  },
  quickLabel: () => ({open: "Open (not complete)", unassigned: "Unassigned", overdue: "Overdue"}[appsmith.store.quickFilter] || ""),
  rows: () => {
    const q = (RequestSearch.text || "").trim().toLowerCase();
    const status = appsmith.store.statusFilter || "All";
    const quick = appsmith.store.quickFilter || "";
    return (getRequests.data || []).filter(r => (status === "All" || r.status === status) &&
      (quick !== "open" || r.status !== "Complete") &&
      (quick !== "unassigned" || (r.assignee === "Unassigned" && r.status !== "Complete")) &&
      (quick !== "overdue" || r.overdue) &&
      [r.code, r.title, r.client, r.equipment, r.assignee, r.status].join(" ").toLowerCase().includes(q));
  }
}
