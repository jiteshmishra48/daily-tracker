const SUPABASE_URL = "https://efzitgnvfsiwifubuvgk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LJqVj8uXor5kXhtK-5EeOg_PMRju69X";

const { createClient } = window.supabase;
const supabase = createClient("https://efzitgnvfsiwifubuvgk.supabase.co", "sb_publishable_LJqVj8uXor5kXhtK-5EeOg_PMRju69X");

const $=id=>document.getElementById(id);
const today=new Date(), dateKey=today.toLocaleDateString("en-CA");
$("dateTitle").textContent=today.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});

for(let h=0;h<24;h++){
 const o=document.createElement("option"); o.value=h;
 o.textContent=`${String(h).padStart(2,"0")}:00 – ${String((h+1)%24).padStart(2,"0")}:00`;
 $("hour").appendChild(o);
}
$("hour").value=today.getHours();

let tasks=JSON.parse(localStorage.getItem("dt_tasks_"+dateKey)||"[]");
let activity=JSON.parse(localStorage.getItem("dt_activity_"+dateKey)||"{}");

function saveTasks(){localStorage.setItem("dt_tasks_"+dateKey,JSON.stringify(tasks));renderTasks();renderActivity();updateSummary()}
function saveActivity(){localStorage.setItem("dt_activity_"+dateKey,JSON.stringify(activity));updateSummary()}

function renderTasks(){
 const box=$("taskList");box.innerHTML="";
 tasks.sort((a,b)=>a.hour-b.hour||a.id-b.id);
 if(!tasks.length){box.innerHTML='<div class="empty">No planned tasks yet.</div>'}
 tasks.forEach(t=>{
  const r=document.createElement("div");r.className="task"+(t.done?" completed":"");
  r.innerHTML=`<input type="checkbox" ${t.done?"checked":""}><div class="time">${String(t.hour).padStart(2,"0")}:00</div><div><div class="title"></div><div class="details"></div><div class="priority">${t.priority.toUpperCase()}</div></div><button class="delete">✕</button>`;
  r.querySelector(".title").textContent=t.title;r.querySelector(".details").textContent=t.details||"";
  r.querySelector("input").onchange=e=>{t.done=e.target.checked;saveTasks()};
  r.querySelector(".delete").onclick=()=>{tasks=tasks.filter(x=>x.id!==t.id);saveTasks()};
  box.appendChild(r);
 });
 const done=tasks.filter(t=>t.done).length;
 $("taskCount").textContent=tasks.length;$("completedCount").textContent=done;
 $("progress").textContent=tasks.length?Math.round(done/tasks.length*100)+"%":"0%";
 $("taskMessage").textContent=tasks.length?`${done}/${tasks.length} completed`:"";
}

function renderActivity(){
 const box=$("activityList");box.innerHTML="";
 const now=today.getHours();
 for(let h=0;h<24;h++){
  const end=(h+1)%24;
  const a=activity[h]||{text:"",productive:false};
  const r=document.createElement("div");r.className="activity-row"+(h===now?" current":"");
  const time=document.createElement("div");time.className="activity-time";
  time.textContent=`${String(h).padStart(2,"0")}:00–${String(end).padStart(2,"0")}:00`;
  const input=document.createElement("input");input.className="activity-input";input.placeholder="Write what you did...";input.value=a.text||"";
  input.oninput=()=>{activity[h]={...(activity[h]||{}),text:input.value};saveActivity()};
  const wrap=document.createElement("label");wrap.className="productive-wrap";
  const check=document.createElement("input");check.type="checkbox";check.className="productive-check";check.checked=!!a.productive;
  check.onchange=()=>{activity[h]={...(activity[h]||{}),productive:check.checked};saveActivity()};
  wrap.append("Productive ",check);r.append(time,input,wrap);box.appendChild(r);
 }
}

function updateSummary(){
 const planned=new Set(tasks.map(t=>Number(t.hour))).size;
 const productive=Object.values(activity).filter(a=>a&&a.text&&a.productive).length;
 $("plannedHours").textContent=planned+" h";
 $("productiveHours").textContent=productive+" h";
 $("executionRate").textContent=planned?Math.round(productive/planned*100)+"%":"0%";
}

$("taskForm").onsubmit=e=>{
 e.preventDefault();
 tasks.push({id:Date.now(),title:$("taskTitle").value.trim(),priority:$("priority").value,hour:Number($("hour").value),details:$("details").value.trim(),done:false});
 $("taskForm").reset();$("hour").value=today.getHours();saveTasks();
};
$("clearBtn").onclick=()=>{if(confirm("Delete today's tasks and activity?")){tasks=[];activity={};saveTasks();saveActivity();renderActivity()}};

renderTasks();renderActivity();updateSummary();
