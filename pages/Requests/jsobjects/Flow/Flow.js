export default {
  rows: () => {
    const q = (RequestSearch.text || "").trim().toLowerCase();
    const status = RequestStatusFilter.selectedOptionValue || "All";
    return (getRequests.data || []).filter(r => (status === "All" || r.status === status) &&
      [r.code, r.title, r.client, r.equipment, r.assignee, r.status].join(" ").toLowerCase().includes(q));
  }
}
