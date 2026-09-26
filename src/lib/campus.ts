export type AccessStatus = 'step-free' | 'stairs' | 'unknown';
export type EdgeKind = 'path' | 'ramp' | 'lift';
export type ReportType = 'Broken lift' | 'Blocked ramp' | 'Obstruction' | 'Inaccessible entrance' | 'Other issue';
export type ReportStatus = 'unverified' | 'confirmed' | 'resolved';
export type RoutingMode = 'standard' | 'step-free' | 'evidence-first' | 'lift-free' | 'ramp-preferred';

export type Node = { id: string; label: string; x: number; y: number; kind?: string; note?: string };
export type Edge = {
  id: string; from: string; to: string; distance: number; stairs: boolean; usesRamp: boolean;
  usesLift: boolean; access: AccessStatus; blocked: boolean; lastVerified: string; label: string; kind: EdgeKind;
};
export type Report = {
  id: string; edgeId: string; type: ReportType; location: string; description: string; timestamp: string;
  updatedAt: string; photoName?: string; status: ReportStatus; confirmations: string[]; seeded?: boolean; createdBy: string;
};
export type Participant = { id: string; name: string; points: number; seeded?: boolean };
export type Mission = { id: string; title: string; description: string; points: number; edgeId: string; kind: 'entrance'|'ramp'|'obstacle'; completedBy: string[] };
export type NotificationItem = { id: string; title: string; body: string; timestamp: string; type: 'report'|'route'|'mission'|'system'; readBy: string[] };
export type Store = { reports: Report[]; participants: Participant[]; missions: Mission[]; notifications: NotificationItem[]; mode: 'local-demo'; demoLoaded: boolean };

const verified = '2026-09-20T09:00:00.000Z';
export const nodes: Node[] = [
  { id:'gate', label:'Main Gate', x:78, y:250, kind:'gate', note:'Accessible drop-off' },
  { id:'plaza', label:'Central Plaza', x:240, y:250 },
  { id:'library', label:'Library', x:450, y:105, kind:'building' },
  { id:'engineering', label:'Engineering Block', x:455, y:280, kind:'building' },
  { id:'cafeteria', label:'Cafeteria', x:650, y:260, kind:'building' },
  { id:'student', label:'Student Centre', x:675, y:115, kind:'building' },
  { id:'auditorium', label:'Auditorium', x:465, y:430, kind:'building' },
  { id:'hostel', label:'Hostel', x:690, y:430, kind:'building' },
  { id:'east', label:'East Accessible Entrance', x:820, y:250, kind:'entrance' },
  { id:'lift', label:'Library Lift', x:450, y:185, kind:'lift', note:'Ground ↔ Library level' },
];

export const edges: Edge[] = [
  {id:'gate-plaza',from:'gate',to:'plaza',distance:90,stairs:false,usesRamp:false,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'Main walkway',kind:'path'},
  {id:'plaza-library',from:'plaza',to:'library',distance:140,stairs:false,usesRamp:true,usesLift:false,access:'unknown',blocked:false,lastVerified:verified,label:'North ramp',kind:'ramp'},
  {id:'plaza-engineering',from:'plaza',to:'engineering',distance:105,stairs:false,usesRamp:false,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'Engineering path',kind:'path'},
  {id:'engineering-cafe',from:'engineering',to:'cafeteria',distance:120,stairs:false,usesRamp:false,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'Cafeteria path',kind:'path'},
  {id:'cafe-student',from:'cafeteria',to:'student',distance:95,stairs:true,usesRamp:false,usesLift:false,access:'stairs',blocked:false,lastVerified:verified,label:'Garden steps',kind:'path'},
  {id:'student-library',from:'student',to:'library',distance:115,stairs:false,usesRamp:false,usesLift:false,access:'unknown',blocked:false,lastVerified:verified,label:'Library east path',kind:'path'},
  {id:'engineering-aud',from:'engineering',to:'auditorium',distance:135,stairs:false,usesRamp:true,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'Auditorium ramp',kind:'ramp'},
  {id:'aud-hostel',from:'auditorium',to:'hostel',distance:170,stairs:false,usesRamp:false,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'South walkway',kind:'path'},
  {id:'hostel-east',from:'hostel',to:'east',distance:130,stairs:false,usesRamp:true,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'East accessible ramp',kind:'ramp'},
  {id:'east-library',from:'east',to:'library',distance:240,stairs:false,usesRamp:true,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'East accessible loop',kind:'ramp'},
  {id:'east-cafe',from:'east',to:'cafeteria',distance:315,stairs:false,usesRamp:false,usesLift:false,access:'step-free',blocked:false,lastVerified:verified,label:'East connector',kind:'path'},
  {id:'library-lift',from:'library',to:'lift',distance:20,stairs:false,usesRamp:false,usesLift:true,access:'step-free',blocked:false,lastVerified:verified,label:'Library lift',kind:'lift'},
  {id:'lift-plaza',from:'lift',to:'plaza',distance:120,stairs:false,usesRamp:false,usesLift:true,access:'step-free',blocked:false,lastVerified:verified,label:'Lift approach',kind:'lift'},
  {id:'plaza-aud',from:'plaza',to:'auditorium',distance:210,stairs:true,usesRamp:false,usesLift:false,access:'stairs',blocked:false,lastVerified:verified,label:'South steps',kind:'path'},
];

export const seedParticipants: Participant[] = [
  {id:'maya',name:'Maya',points:30,seeded:true}, {id:'arjun',name:'Arjun',points:20,seeded:true}, {id:'sam',name:'Sam',points:10,seeded:true},
];
export const seedMissions: Mission[] = [
  {id:'m1',title:'Check an accessible entrance',description:'Verify the East Accessible Entrance.',points:10,edgeId:'hostel-east',kind:'entrance',completedBy:[]},
  {id:'m2',title:'Verify a ramp',description:'Confirm the Auditorium ramp is usable.',points:15,edgeId:'engineering-aud',kind:'ramp',completedBy:[]},
  {id:'m3',title:'Confirm a resolved obstacle',description:'Verify that the Library lift issue is resolved.',points:20,edgeId:'library-lift',kind:'obstacle',completedBy:[]},
];

export function defaultStore(): Store { return {reports:[],participants:seedParticipants.map(p=>({...p})),missions:seedMissions.map(m=>({...m,completedBy:[]})),notifications:[],mode:'local-demo',demoLoaded:false}; }
export function demoReport(): Report { const now = new Date().toISOString(); return {id:'demo-lift',edgeId:'library-lift',type:'Broken lift',location:'Library lift',description:'Demo scenario: the lift is temporarily unavailable. This is seeded demo data.',timestamp:now,updatedAt:now,status:'unverified',confirmations:[],seeded:true,createdBy:'demo'}; }
export function loadDemoStore(): Store { return {...defaultStore(),reports:[demoReport()],demoLoaded:true}; }
export function activeEdgeSet(reportList: Report[]) { const blocked = new Set(edges.filter(e=>e.blocked).map(e=>e.id)); reportList.filter(r=>r.status!=='resolved').forEach(r=>blocked.add(r.edgeId)); return blocked; }

function edgeCost(e: Edge, mode: RoutingMode) {
  if(mode==='standard') return e.distance;
  if(mode==='step-free') return e.distance;
  if(mode==='evidence-first') return e.distance + (e.access==='unknown'?260:0) + (e.stairs?900:0) + (e.usesLift?25:0);
  if(mode==='lift-free') return e.distance + (e.usesLift?100000:0);
  return e.distance + (e.usesRamp?-25:0) + (e.access==='unknown'?320:0) + (e.stairs?900:0);
}
function allowed(e: Edge, mode: RoutingMode, blocked: Set<string>) {
  if(blocked.has(e.id)) return false;
  if(mode==='step-free' && (e.stairs || e.access!=='step-free')) return false;
  if(mode==='lift-free' && e.usesLift) return false;
  return true;
}
export function dijkstra(start:string,end:string,mode:RoutingMode,reportList:Report[]) {
  if(start===end) return {nodes:[start],edges:[],distance:0,cost:0};
  const blocked=activeEdgeSet(reportList); const dist:Record<string,number>={}; const cost:Record<string,number>={};
  const prev:Record<string,{node:string;edge:Edge}|undefined>={}; const unvisited=new Set(nodes.map(n=>n.id));
  nodes.forEach(n=>{dist[n.id]=Infinity;cost[n.id]=Infinity}); dist[start]=0; cost[start]=0;
  while(unvisited.size){let current:string|undefined;for(const id of unvisited) if(!current||cost[id]<cost[current]) current=id; if(!current||cost[current]===Infinity) break;unvisited.delete(current);if(current===end)break;
    for(const e of edges.filter(e=>e.from===current||e.to===current)){if(!allowed(e,mode,blocked))continue;const next=e.from===current?e.to:e.from;if(!unvisited.has(next))continue;const alt=cost[current]+edgeCost(e,mode);if(alt<cost[next]){cost[next]=alt;dist[next]=dist[current]+e.distance;prev[next]={node:current,edge:e};}}
  }
  if(cost[end]===Infinity)return null; const path:string[]=[];const pathEdges:Edge[]=[];let cur=end;while(cur!==start){const p=prev[cur];if(!p)return null;path.unshift(cur);pathEdges.unshift(p.edge);cur=p.node;}path.unshift(start);return {nodes:path,edges:pathEdges,distance:dist[end],cost:cost[end]};
}

export function routeExplanation(route:ReturnType<typeof dijkstra>,start:string,end:string,mode:RoutingMode,reportList:Report[]) {
  if(!route)return mode==='step-free'||mode==='evidence-first'?'No known step-free route is currently available. Try another destination or resolve an active barrier.':'No available route remains after excluding blocked paths.';
  const blocked=activeEdgeSet(reportList); const reasons:string[]=[];
  if(mode==='step-free')reasons.push('stairs and unknown-accessibility edges are excluded');
  if(mode==='evidence-first')reasons.push('known-access edges are prioritised and unknown segments receive a large uncertainty penalty');
  if(mode==='lift-free')reasons.push('lift segments are avoided');
  if(mode==='ramp-preferred')reasons.push('ramps are preferred while uncertain and stair segments are heavily penalised');
  if(blocked.size)reasons.push(`${blocked.size} active barrier${blocked.size===1?'':'s'} affect the graph`);
  const shortest=dijkstra(start,end,'standard',reportList); if(shortest&&shortest.distance<route.distance)reasons.push(`the shortest available physical path is ${shortest.distance} m, but this route adds ${route.distance-shortest.distance} m to respect the preference`);
  return reasons.length?`Chosen deliberately: ${reasons.join('; ')}. Step-free routing is a limited preference based on known campus data, not a universal accessibility or safety guarantee.`:'This is the shortest known route under the selected preference.';
}

export function alternatives(start:string,end:string,mode:RoutingMode,reports:Report[],limit=3){
  const out:NonNullable<ReturnType<typeof dijkstra>>[]=[]; const base=dijkstra(start,end,mode,reports); if(!base)return out; out.push(base);
  const seen=new Set(base.edges.map(e=>e.id));
  for(const candidateEdge of base.edges){const filtered=reports.filter(r=>r.status!=='resolved' && r.edgeId!==candidateEdge.id);const candidate=dijkstra(start,end,mode,filtered);if(candidate && !candidate.edges.some(e=>seen.has(e.id))){out.push(candidate);candidate.edges.forEach(e=>seen.add(e.id));if(out.length>=limit)break;}}
  return out.sort((a,b)=>a.distance-b.distance).slice(0,limit);
}
