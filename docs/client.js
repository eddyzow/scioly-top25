/* ==========================================================
   Weeks, Data (25 teams each), News, State, Rendering + FLIP
   ========================================================== */

const WEEK_LABELS = {
  1: "Week 1 (Sept 8 – Sept 14, 2025)",
  2: "Week 2 (Sept 15 – Sept 21, 2025)",
  3: "Week 3 (Sept 22 – Sept 28, 2025)",
  4: "Week 4 (Sept 29 – Oct 5, 2025)",
};

/* ---- Base rosters ---- */
const C_BASE = [
  "Troy High School (CA)","Solon High School (OH)","Mason High School (OH)","WW-P North (NJ)",
  "Seven Lakes High School (TX)","Acton-Boxborough (MA)","New Trier High School (IL)","Carmel High School (IN)",
  "Mira Loma High School (CA)","Centerville High School (OH)","Mountain View High School (CA)","Harriton High School (PA)",
  "Brookwood High School (GA)","Grand Haven High School (MI)","Syosset High School (NY)","LASA High School (TX)",
  "Columbia High School (NY)","Eastview High School (MN)","Shady Side Academy (PA)","Bothell High School (WA)",
  "Pembroke Hill (MO)","Charlottesville High School (VA)","Cambridge High School (GA)","Iolani School (HI)",
  "Bearden High School (TN)"
];

const B_BASE = [
  "Kennedy Middle School (CA)","Solon Middle School (OH)","Beckendorff Junior High (TX)","Marie Murphy (IL)",
  "Piedmont IB Middle School (NC)","Winston Churchill MS (CA)","Paul J. Gelinas JH (NY)","Jeffrey Trail MS (CA)",
  "Shady Side Academy (PA)","Carmel Middle School (IN)","Rachel Carson MS (VA)","Fulton Science Academy (GA)",
  "Thomas MS (IL)","Harlan MS (TX)","Dodgen MS (GA)","Sycamore JH (OH)","Clague MS (MI)",
  "Timberline MS (WA)","Clements MS (AL)","Mesa Robles MS (CA)","Seven Lakes JH (TX)","Longfellow MS (VA)",
  "Ladue MS (MO)","Bearden MS (TN)","Iolani School (HI)"
];

/* ---- Helpers ---- */
const clone = (a)=>a.slice();
function swap(arr,a,b){
  const i=arr.indexOf(a),j=arr.indexOf(b);
  if(i>=0 && j>=0)[arr[i],arr[j]]=[arr[j],arr[i]];
}
function remove(arr,name){
  const i=arr.indexOf(name);
  if(i<0)return arr.slice();
  const out=arr.slice();out.splice(i,1);return out;
}
function insert(arr,name,idx){
  const out=arr.slice();
  if(!out.includes(name))out.splice(Math.max(0,Math.min(idx,out.length)),0,name);
  return out.slice(0,25);
}

/* ---- Build weekly rankings for Division C ---- */
const C_w1 = clone(C_BASE);
const C_w2 = clone(C_w1); swap(C_w2,"Mason High School (OH)","WW-P North (NJ)"); swap(C_w2,"Carmel High School (IN)","New Trier High School (IL)");
const C_w3a = clone(C_w2); swap(C_w3a,"Seven Lakes High School (TX)","Acton-Boxborough (MA)"); swap(C_w3a,"Harriton High School (PA)","Mountain View High School (CA)");
const C_w3 = insert(remove(C_w3a,"Pembroke Hill (MO)"), "Arcadia High School (CA)", 18);
const C_w4a = clone(C_w3); swap(C_w4a,"Mason High School (OH)","WW-P North (NJ)"); swap(C_w4a,"Shady Side Academy (PA)","Bothell High School (WA)");
const C_w4 = insert(remove(C_w4a,"Cambridge High School (GA)"), "West Windsor-Plainsboro South (NJ)", 20);

/* ---- Build weekly rankings for Division B ---- */
const B_w1 = clone(B_BASE);
const B_w2 = clone(B_w1); swap(B_w2,"Beckendorff Junior High (TX)","Solon Middle School (OH)"); swap(B_w2,"Winston Churchill MS (CA)","Paul J. Gelinas JH (NY)");
const B_w3a = clone(B_w2); swap(B_w3a,"Jeffrey Trail MS (CA)","Shady Side Academy (PA)"); swap(B_w3a,"Thomas MS (IL)","Fulton Science Academy (GA)");
let B_w3 = insert(remove(B_w3a,"Bearden MS (TN)"), "Hamilton MS (CO)", 22);
const B_w4a = clone(B_w3); swap(B_w4a,"Solon Middle School (OH)","Kennedy Middle School (CA)"); swap(B_w4a,"Dodgen MS (GA)","Sycamore JH (OH)");
let B_w4 = insert(remove(B_w4a,"Iolani School (HI)"), "Meads Mill MS (MI)", 23);

/* ---- Normalize ---- */
function normalize(list){
  const seen=new Set();const out=[];
  for(const t of list){if(!seen.has(t)){ seen.add(t); out.push(t); }}
  while(out.length<25) out.push("At-Large Team "+(out.length+1));
  return out.slice(0,25);
}
const DATA={
  C:{1:normalize(C_w1),2:normalize(C_w2),3:normalize(C_w3),4:normalize(C_w4)},
  B:{1:normalize(B_w1),2:normalize(B_w2),3:normalize(B_w3),4:normalize(B_w4)}
};

/* ---- News ---- */
const NEWS={
  C:{
    1:[{title:"Preseason Hype Centers on Troy, Solon",date:"Sept 12, 2025",author:"Scioly25 Team",content:"Coast-to-coast alumni ballots give Troy a narrow edge over Solon entering Week 1."}],
    2:[{title:"Mason Surges After Strong Invite",date:"Sept 19, 2025",author:"Scioly25 Team",content:"Mason climbs on the back of consistent top-3 finishes; WW-P North stabilizes."}],
    3:[{title:"Arcadia Enters Top 25",date:"Sept 26, 2025",author:"Scioly25 Team",content:"Arcadia breaks into the poll after a breakout showing at early-season invitationals."}],
    4:[{title:"WW-P South Joins the Party",date:"Oct 3, 2025",author:"Scioly25 Team",content:"New Jersey tightens — WW-P South debuts as regional results shake the teens."}]
  },
  B:{
    1:[{title:"Kennedy, Solon Pace the Field",date:"Sept 12, 2025",author:"Scioly25 Team",content:"Early ballots favor the West Coast powerhouse with Solon close behind."}],
    2:[{title:"Texas Heats Up",date:"Sept 19, 2025",author:"Scioly25 Team",content:"Beckendorff and Seven Lakes post statement results across multiple events."}],
    3:[{title:"Depth Matters Mid-Season",date:"Sept 26, 2025",author:"Scioly25 Team",content:"Balanced rosters rise as rebuilds cause turbulence through the teens."}],
    4:[{title:"Meads Mill Reappears in the Poll",date:"Oct 3, 2025",author:"Scioly25 Team",content:"Michigan’s perennial threat returns to the top-25 as the Midwest tightens up."}]
  }
};

/* ---- State ---- */
let currentDivision="C";
let currentWeek=4;

/* ---- Helpers ---- */
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-");
function computeStats(currList,prevList){
  const prevIdx=new Map();
  if(prevList) prevList.forEach((t,i)=>prevIdx.set(t,i+1));
  const out={};
  currList.forEach((t,i)=>{
    const curr=i+1;
    const prev=prevIdx.has(t)?prevIdx.get(t):null;
    const diff=prev==null?null:(prev-curr); // + => moved up, - => moved down
    out[t]={currRank:curr,prevRank:prev,diff};
  });
  return out;
}

/* ---- News Render ---- */
function renderNews(div,wk){
  const box=$("#articles").empty();
  const items=(NEWS[div]&&NEWS[div][wk])?NEWS[div][wk]:[];
  items.forEach(a=>{
    box.append(`
      <div class="blogpost">
        <div class="title">${a.title}</div>
        <div class="devtime">${a.date} · ${a.author}</div>
        <p class="note">${a.content}</p>
      </div>
    `);
  });
}

/* ==========================================================
   Robust FLIP Animation (table-safe)
   - measure FIRST rects
   - build final order (append existing nodes or create entering)
   - measure LAST rects
   - invert: set translateY(first - last)
   - force reflow, then play to 0 with opacity 1
   - leaving nodes: fade/slide then remove (after final layout built)
   ========================================================== */
function renderTable(div,wk,animate=true){
  const tbody = document.getElementById("rankingBody");
  const $tbody = $("#rankingBody");

  const currList = DATA[div][wk];
  const prevList = (wk>1)?DATA[div][wk-1]:null;
  const stats = computeStats(currList, prevList);

  // Map existing rows by id
  const oldRows = new Map();
  Array.from(tbody.children).forEach(tr => { oldRows.set(tr.getAttribute("data-id"), tr); });

  // FIRST: measure current positions
  const firstRect = new Map();
  oldRows.forEach((el, id) => { firstRect.set(id, el.getBoundingClientRect().top); });

  // Determine leaving ids
  const incomingIds = new Set(currList.map(slug));
  const leaving = [];
  oldRows.forEach((el, id) => { if (!incomingIds.has(id)) leaving.push(el); });

  // Build final order fragment (reusing existing nodes when possible)
  const frag = document.createDocumentFragment();
  const presentIds = [];
  currList.forEach(team => {
    const id = slug(team);
    presentIds.push(id);

    const { currRank, prevRank, diff } = stats[team];
    let trend = `<span class="trend-none">—</span>`;
    if (prevRank != null) {
      if (diff > 0) trend = `<span class="trend-up">▲ ${diff}</span>`;
      else if (diff < 0) trend = `<span class="trend-down">▼ ${Math.abs(diff)}</span>`;
    }

    let row = oldRows.get(id);
    if (!row) {
      // ENTERING node
      row = document.createElement("tr");
      row.setAttribute("data-id", id);
      row.style.transform = "translateY(20px)";
      row.style.opacity = "0";
      row.style.willChange = "transform, opacity";
      row.innerHTML = `
        <td class="rank-num">#${currRank}</td>
        <td class="team-name">${team}</td>
        <td class="trend">${trend}</td>
      `;
    } else {
      // Update cell contents on existing node
      row.querySelector(".rank-num").textContent = `#${currRank}`;
      row.querySelector(".team-name").textContent = team;
      row.querySelector(".trend").innerHTML = trend;
      row.style.willChange = "transform, opacity";
    }
    frag.appendChild(row);
  });

  // Remove leaving rows *from layout* first so last positions reflect the final layout
  leaving.forEach(el => {
    el.style.transition = "transform 220ms ease, opacity 220ms ease";
    el.style.transform = "translateY(20px)";
    el.style.opacity = "0";
    // Remove from DOM before measuring LAST (to avoid layout interference)
    el.parentNode && el.parentNode.removeChild(el);
  });

  // Append final order
  tbody.appendChild(frag);

  // LAST: measure final positions
  const lastRect = new Map();
  Array.from(tbody.children).forEach(tr => {
    lastRect.set(tr.getAttribute("data-id"), tr.getBoundingClientRect().top);
  });

  // Invert and Play
  if (animate) {
    Array.from(tbody.children).forEach(tr => {
      const id = tr.getAttribute("data-id");
      const firstTop = firstRect.get(id);
      const lastTop  = lastRect.get(id);

      // ENTERING: firstTop undefined
      if (firstTop === undefined) {
        // already set to translateY(20px), opacity 0
        // force reflow
        void tr.getBoundingClientRect();
        tr.style.transition = "transform 250ms ease, opacity 250ms ease";
        tr.style.transform = "translateY(0)";
        tr.style.opacity = "1";
        return;
      }

      // EXISTING: invert
      const delta = firstTop - lastTop;
      tr.style.transition = "none";
      tr.style.transform  = `translateY(${delta}px)`;

      // force reflow
      void tr.getBoundingClientRect();

      // play
      tr.style.transition = "transform 250ms ease, opacity 250ms ease";
      tr.style.transform  = "translateY(0)";
      tr.style.opacity    = "1";
    });
  } else {
    // initial paint
    Array.from(tbody.children).forEach(tr => {
      tr.style.transition = "transform 250ms ease, opacity 250ms ease";
      tr.style.transform  = "translateY(0)";
      tr.style.opacity    = "1";
    });
  }

  // Labels & buttons
  $("#divisionLabel").text(div);
  $("#weekLabel").text(WEEK_LABELS[wk]);
  $("#weekRangeLabel").text(WEEK_LABELS[wk]);
  $("#prevWeekBtn").prop("disabled", wk===1);
  $("#nextWeekBtn").prop("disabled", wk===4);

  // News
  renderNews(div, wk);
}

/* ---- Events ---- */
function setDivision(div){
  currentDivision=div;
  const checked=(div==="C");
  $("#divisionSwitch").attr("aria-checked",checked?"true":"false");
  $(".switch-knob").text(div);
  renderTable(currentDivision,currentWeek,true);
}

$(function(){
  // Division slider (B on left, C on right; default C)
  $("#divisionSwitch").on("click keypress",function(e){
    if(e.type==="keypress" && e.which!==13 && e.which!==32) return;
    setDivision(currentDivision==="C" ? "B" : "C");
  });

  // Week arrows (stop at ends)
  $("#prevWeekBtn").on("click",function(){
    if(currentWeek>1){
      currentWeek--;
      renderTable(currentDivision,currentWeek,true);
    }
    $("#prevWeekBtn").prop("disabled", currentWeek===1);
    $("#nextWeekBtn").prop("disabled", currentWeek===4);
  });
  $("#nextWeekBtn").on("click",function(){
    if(currentWeek<4){
      currentWeek++;
      renderTable(currentDivision,currentWeek,true);
    }
    $("#prevWeekBtn").prop("disabled", currentWeek===1);
    $("#nextWeekBtn").prop("disabled", currentWeek===4);
  });

  // Vote (stub)
  $("#voteBtn").on("click",function(){
    window.open("https://forms.gle/mxxS4cMUDDUSVbgq7","_blank");});
  // Initial paint
  setDivision("C");
  renderTable(currentDivision,currentWeek,false);
});
