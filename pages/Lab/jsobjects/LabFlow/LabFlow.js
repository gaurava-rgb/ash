export default {
  seed: () => ({
    schemaVersion: 1,
    clients: [
      {id:"C-001",name:"Example Geology Group",contact:"",email:""},
      {id:"C-002",name:"Example Materials Group",contact:"",email:""},
      {id:"C-003",name:"Example Engineering Group",contact:"",email:""},
      {id:"C-004",name:"Example Chemistry Group",contact:"",email:""}
    ],
    equipment: [
      {id:"E-001",name:"Electron Microscope",condition:"Available",location:"Demo Lab A",tips:"Use the approved sample preparation procedure."},
      {id:"E-002",name:"Raman Spectrometer",condition:"Under repair",location:"Demo Lab B",tips:"Check with the lab administrator before planning new work."}
    ],
    requests: [
      {id:"LAB-001",title:"Mineral surface imaging",clientId:"C-001",equipmentId:"E-001",assignee:"Alex Chen",status:"Active",due:"2026-09-15",notes:""},
      {id:"LAB-002",title:"Polymer composition check",clientId:"C-002",equipmentId:"E-002",assignee:"Unassigned",status:"New",due:"2026-09-18",notes:""},
      {id:"LAB-003",title:"Coating defect review",clientId:"C-003",equipmentId:"E-001",assignee:"Morgan Patel",status:"Blocked",due:"2026-09-16",notes:"Awaiting replacement sample from client."},
      {id:"LAB-004",title:"Reference spectrum capture",clientId:"C-004",equipmentId:"E-002",assignee:"Sam Rivera",status:"Complete",due:"2026-09-09",notes:""}
    ],
    samples: [
      {id:"LAB-001-S1",requestId:"LAB-001",name:"Sample 1",scan:true,export:true,email:false},
      {id:"LAB-001-S2",requestId:"LAB-001",name:"Sample 2",scan:true,export:false,email:false},
      {id:"LAB-002-S1",requestId:"LAB-002",name:"Sample 1",scan:false,export:false,email:false},
      {id:"LAB-002-S2",requestId:"LAB-002",name:"Sample 2",scan:false,export:false,email:false},
      {id:"LAB-003-S1",requestId:"LAB-003",name:"Sample 1",scan:false,export:false,email:false},
      {id:"LAB-003-S2",requestId:"LAB-003",name:"Sample 2",scan:false,export:false,email:false},
      {id:"LAB-004-S1",requestId:"LAB-004",name:"Sample 1",scan:true,export:true,email:true},
      {id:"LAB-004-S2",requestId:"LAB-004",name:"Sample 2",scan:true,export:true,email:true}
    ]
  }),
  data: () => {
    const saved = appsmith.store.labTrackerConnectedV1;
    if (saved === undefined || saved === null) return LabFlow.seed();
    if (saved.schemaVersion !== 1 || ![saved.clients,saved.equipment,saved.requests,saved.samples].every(Array.isArray)) throw new Error("Stored demo data has an unsupported format. It has not been changed.");
    return saved;
  },
  view: () => ["requests","clients","equipment","newRequest"].includes(appsmith.store.labV1View) ? appsmith.store.labV1View : "requests",
  joinedRequests: () => {
    const d = LabFlow.data();
    return d.requests.map(r => {
      const client = d.clients.find(c => c.id === r.clientId);
      const equipment = d.equipment.find(e => e.id === r.equipmentId);
      const samples = d.samples.filter(s => s.requestId === r.id);
      const complete = samples.filter(s => s.scan && s["export"] && s.email).length;
      return {...r,client:client?.name || "Missing client",equipment:equipment?.name || "Missing equipment",instrument:equipment?.name || "Missing equipment",equipmentCondition:equipment?.condition || "Unknown",sampleCount:samples.length,completedSamples:complete,progress:complete+" / "+samples.length+" complete"};
    });
  },
  requestRows: () => {
    const q = (RequestSearch.text || "").trim().toLowerCase();
    const status = RequestStatusFilter.selectedOptionValue || "All";
    return LabFlow.joinedRequests().filter(r => (status === "All" || r.status === status) && [r.id,r.title,r.client,r.equipment,r.assignee,r.status].join(" ").toLowerCase().includes(q));
  },
  clientRows: () => { const d = LabFlow.data(); return d.clients.map(c => ({...c,requestCount:d.requests.filter(r => r.clientId === c.id).length})); },
  equipmentRows: () => { const d = LabFlow.data(); return d.equipment.map(e => ({...e,requestCount:d.requests.filter(r => r.equipmentId === e.id).length})); },
  selectedRequest: () => { const id = RequestsTable.selectedRow?.id; return LabFlow.requestRows().some(r => r.id === id) ? LabFlow.data().requests.find(r => r.id === id) : undefined; },
  selectedClient: () => LabFlow.data().clients.find(c => c.id === ClientsTable.selectedRow?.id),
  selectedEquipment: () => LabFlow.data().equipment.find(e => e.id === EquipmentTable.selectedRow?.id),
  sampleRows: () => { const request = LabFlow.selectedRequest(); return request ? LabFlow.data().samples.filter(s => s.requestId === request.id) : []; },
  selectedSample: () => LabFlow.sampleRows().find(s => s.id === SamplesTable.selectedRow?.id),
  clientRequests: () => { const client = LabFlow.selectedClient(); return client ? LabFlow.joinedRequests().filter(r => r.clientId === client.id) : []; },
  equipmentRequests: () => { const equipment = LabFlow.selectedEquipment(); return equipment ? LabFlow.joinedRequests().filter(r => r.equipmentId === equipment.id) : []; },
  clientOptions: () => LabFlow.data().clients.map(c => ({label:c.name,value:c.id})),
  equipmentOptions: () => LabFlow.data().equipment.map(e => ({label:e.name+" ("+e.condition+")",value:e.id})),
  stats: () => { const d=LabFlow.data(); return {requests:d.requests.length,clients:d.clients.length,equipment:d.equipment.length,samples:d.samples.length,active:d.requests.filter(r=>r.status==="Active").length,blocked:d.requests.filter(r=>r.status==="Blocked").length,unassigned:d.requests.filter(r=>r.assignee==="Unassigned").length,unavailableEquipment:d.equipment.filter(e=>e.condition!=="Available").length}; },
  resetWidgets: async (names) => { for (const name of names) await resetWidget(name, true); },
  navigate: async (view) => {
    if (!["requests","clients","equipment","newRequest"].includes(view)) return false;
    await storeValue("labV1View", view, false);
    return true;
  },
  openRequest: async (id) => {
    if (!LabFlow.data().requests.some(r=>r.id===id)) return LabFlow.warn("That request no longer exists.");
    await storeValue("labV1RequestFocus", id, false);
    await LabFlow.navigate("requests");
    await LabFlow.resetWidgets(["RequestSearch","RequestStatusFilter","RequestsTable"]);
    await LabFlow.resetRequestForm();
    return true;
  },
  openClient: async (id) => {
    if (!LabFlow.data().clients.some(c=>c.id===id)) return LabFlow.warn("That client no longer exists.");
    await storeValue("labV1ClientFocus", id, false);
    await LabFlow.navigate("clients");
    await resetWidget("ClientsTable", true);
    await LabFlow.resetClientForm();
    return true;
  },
  openEquipment: async (id) => {
    if (!LabFlow.data().equipment.some(e=>e.id===id)) return LabFlow.warn("That equipment no longer exists.");
    await storeValue("labV1EquipmentFocus", id, false);
    await LabFlow.navigate("equipment");
    await resetWidget("EquipmentTable", true);
    await LabFlow.resetEquipmentForm();
    return true;
  },
  resetRequestForm: async () => { await LabFlow.resetWidgets(["RequestClientSelect","RequestEquipmentSelect","RequestAssigneeSelect","RequestStatusSelect","RequestDueInput","RequestNotesInput","NewSampleName","SamplesTable"]); await LabFlow.resetSampleForm(); },
  resetClientForm: async () => { await LabFlow.resetWidgets(["ClientNameInput","ClientContactInput","ClientEmailInput","ClientRequestsTable"]); },
  resetEquipmentForm: async () => { await LabFlow.resetWidgets(["EquipmentNameInput","EquipmentConditionSelect","EquipmentLocationInput","EquipmentTipsInput","EquipmentRequestsTable"]); },
  resetSampleForm: async () => { await LabFlow.resetWidgets(["SampleScan","SampleExport","SampleEmail"]); },
  warn: async (message) => { await showAlert(message,"warning"); return false; },
  validDate: (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value+"T00:00:00Z");
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
  },
  validEmail: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  requestError: (r,d) => {
    if (!d.clients.some(c=>c.id===r.clientId)) return "Choose a valid client.";
    if (!d.equipment.some(e=>e.id===r.equipmentId)) return "Choose valid equipment.";
    if (!["Unassigned","Alex Chen","Morgan Patel","Sam Rivera"].includes(r.assignee)) return "Choose a valid assignee.";
    if (!["New","Active","Blocked","Complete"].includes(r.status)) return "Choose a valid status.";
    if (!LabFlow.validDate(r.due)) return "Enter a real due date as YYYY-MM-DD.";
    return "";
  },
  persist: async (next,message) => {
    try { await storeValue("labTrackerConnectedV1",next,true); }
    catch (error) { await showAlert("Save failed. Your changes were not saved. Please try again.","error"); return false; }
    await showAlert(message+" Saved on this device.","success");
    return true;
  },
  nextId: (prefix,rows) => prefix+String(rows.reduce((max,r)=>{ const suffix=r.id.startsWith(prefix)?r.id.slice(prefix.length):""; return /^\d+$/.test(suffix)?Math.max(max,Number(suffix)):max; },0)+1).padStart(3,"0"),
  saveRequest: async () => {
    const current=LabFlow.selectedRequest();
    if (!current) return LabFlow.warn("Select a visible request first.");
    const d=LabFlow.data();
    const changes={clientId:RequestClientSelect.selectedOptionValue,equipmentId:RequestEquipmentSelect.selectedOptionValue,assignee:RequestAssigneeSelect.selectedOptionValue,status:RequestStatusSelect.selectedOptionValue,due:(RequestDueInput.text||"").trim(),notes:RequestNotesInput.text||""};
    const error=LabFlow.requestError(changes,d);
    if (error) return LabFlow.warn(error);
    return LabFlow.persist({...d,requests:d.requests.map(r=>r.id===current.id?{...r,...changes}:r)},"Request updated.");
  },
  saveClient: async () => {
    const current=LabFlow.selectedClient();
    if (!current) return LabFlow.warn("Select a client first.");
    const name=(ClientNameInput.text||"").trim(), contact=(ClientContactInput.text||"").trim(), email=(ClientEmailInput.text||"").trim();
    if (!name) return LabFlow.warn("Enter a client name.");
    if (!LabFlow.validEmail(email)) return LabFlow.warn("Enter a valid email or leave it blank.");
    const d=LabFlow.data();
    return LabFlow.persist({...d,clients:d.clients.map(c=>c.id===current.id?{...c,name,contact,email}:c)},"Client updated.");
  },
  saveEquipment: async () => {
    const current=LabFlow.selectedEquipment();
    if (!current) return LabFlow.warn("Select equipment first.");
    const name=(EquipmentNameInput.text||"").trim(),condition=EquipmentConditionSelect.selectedOptionValue,location=(EquipmentLocationInput.text||"").trim(),tips=EquipmentTipsInput.text||"";
    if (!name) return LabFlow.warn("Enter an equipment name.");
    if (!["Available","Under repair","Out of service"].includes(condition)) return LabFlow.warn("Choose a valid equipment condition.");
    const d=LabFlow.data();
    return LabFlow.persist({...d,equipment:d.equipment.map(e=>e.id===current.id?{...e,name,condition,location,tips}:e)},"Equipment updated.");
  },
  saveSample: async () => {
    const current=LabFlow.selectedSample();
    if (!current) return LabFlow.warn("Select a sample from the current request first.");
    const flags={scan:SampleScan.isChecked,export:SampleExport.isChecked,email:SampleEmail.isChecked};
    if (!Object.values(flags).every(v=>typeof v==="boolean")) return LabFlow.warn("Choose valid sample progress values.");
    const d=LabFlow.data();
    return LabFlow.persist({...d,samples:d.samples.map(s=>s.id===current.id?{...s,...flags}:s)},"Sample progress updated.");
  },
  addSample: async () => {
    const request=LabFlow.selectedRequest();
    if (!request) return LabFlow.warn("Select a visible request first.");
    const name=(NewSampleName.text||"").trim();
    if (!name) return LabFlow.warn("Enter a sample name.");
    const d=LabFlow.data(),sample={id:LabFlow.nextId(request.id+"-S",d.samples),requestId:request.id,name,scan:false,export:false,email:false};
    const saved=await LabFlow.persist({...d,samples:[...d.samples,sample]},"Sample added.");
    if (saved) await resetWidget("NewSampleName",true);
    return saved;
  },
  createRequest: async () => {
    const d=LabFlow.data();
    const request={id:LabFlow.nextId("LAB-",d.requests),title:(NewRequestTitle.text||"").trim(),clientId:NewRequestClientSelect.selectedOptionValue,equipmentId:NewRequestEquipmentSelect.selectedOptionValue,assignee:NewRequestAssigneeSelect.selectedOptionValue,status:"New",due:(NewRequestDueInput.text||"").trim(),notes:NewRequestNotesInput.text||""};
    if (!request.title) return LabFlow.warn("Enter a request title.");
    const error=LabFlow.requestError(request,d);
    if (error) return LabFlow.warn(error);
    const saved=await LabFlow.persist({...d,requests:[...d.requests,request]},"Request created. Add its samples below.");
    if (saved) { await LabFlow.openRequest(request.id); await LabFlow.resetWidgets(["NewRequestTitle","NewRequestClientSelect","NewRequestEquipmentSelect","NewRequestAssigneeSelect","NewRequestDueInput","NewRequestNotesInput"]); }
    return saved;
  },
  addClient: async () => {
    const name=(NewClientName.text||"").trim(),contact=(NewClientContact.text||"").trim(),email=(NewClientEmail.text||"").trim();
    if (!name) return LabFlow.warn("Enter a client name.");
    if (!LabFlow.validEmail(email)) return LabFlow.warn("Enter a valid email or leave it blank.");
    const d=LabFlow.data(),client={id:LabFlow.nextId("C-",d.clients),name,contact,email};
    const saved=await LabFlow.persist({...d,clients:[...d.clients,client]},"Client added.");
    if (saved) { await LabFlow.openClient(client.id); await LabFlow.resetWidgets(["NewClientName","NewClientContact","NewClientEmail"]); }
    return saved;
  },
  addEquipment: async () => {
    const name=(NewEquipmentName.text||"").trim(),location=(NewEquipmentLocation.text||"").trim();
    if (!name) return LabFlow.warn("Enter an equipment name.");
    const d=LabFlow.data(),equipment={id:LabFlow.nextId("E-",d.equipment),name,condition:"Available",location,tips:""};
    const saved=await LabFlow.persist({...d,equipment:[...d.equipment,equipment]},"Equipment added.");
    if (saved) { await LabFlow.openEquipment(equipment.id); await LabFlow.resetWidgets(["NewEquipmentName","NewEquipmentLocation"]); }
    return saved;
  }
};
