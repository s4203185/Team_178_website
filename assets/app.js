import { runQuery } from "./db.js";
import {
  landingQueries,
  conditionsQueries,
  peopleQueries,
  deepConditionsQueries,
  deepPeopleQueries
} from "./queries.js";

const COLORS = ["#1a3a5c", "#2563a8", "#e63946", "#f4a261", "#2a9d8f", "#9b59b6", "#e67e22", "#27ae60", "#c0392b", "#2980b9"];
const GRID = { color: "rgba(0,0,0,0.05)" };
const FONT = { family: "Inter, sans-serif", size: 11 };

const pageKey = document.body.dataset.page;
const params = new URLSearchParams(window.location.search);
const root = document.getElementById("app");

function n(value) {
  return Number(value || 0).toLocaleString();
}
function pct(v, total) {
  return total ? ((Number(v || 0) / total) * 100).toFixed(1) : "0.0";
}
function setActiveNav() {
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.dataset.page === pageKey) a.classList.add("active");
  });
}
function showError(err) {
  root.innerHTML = `<div class="container section"><div class="card card-body"><h3>Data load error</h3><p class="section-sub">${err.message}</p></div></div>`;
}

function layout(title, subtitle, badge, content) {
  return `<div class="page-hero"><div class="container"><div class="hero-badge">${badge}</div><h1>${title}</h1><p>${subtitle}</p></div></div>${content}`;
}

async function renderLanding() {
  const [a] = await runQuery(landingQueries.totalAccidents);
  const [k] = await runQuery(landingQueries.totalKilled);
  const [s] = await runQuery(landingQueries.totalSerious);
  const [p] = await runQuery(landingQueries.totalPersons);
  const years = await runQuery(landingQueries.yearData);
  const lights = await runQuery(landingQueries.lightData);
  const speeds = await runQuery(landingQueries.speedData);
  const lgas = await runQuery(landingQueries.lgaData);
  const facts = [
    { icon: "fa-car-crash", value: n(a.total), label: "Total Accidents", color: "#e74c3c", bg: "#fdf2f2", desc: "Recorded incidents across Victoria" },
    { icon: "fa-heart-broken", value: n(k.total), label: "Lives Lost", color: "#2c3e50", bg: "#f0f2f5", desc: "Fatalities from road accidents" },
    { icon: "fa-hospital", value: n(s.total), label: "Seriously Injured", color: "#e67e22", bg: "#fef9f0", desc: "People with serious injuries" },
    { icon: "fa-users", value: n(p.total), label: "People Involved", color: "#2980b9", bg: "#f0f7fd", desc: "Total people across all incidents" }
  ];
  root.innerHTML = layout("Investigating Road Incidents<br><span>Across Victoria</span>", "Explore detailed, data-driven insights from the Department of Transport and Planning's road crash database.", '<i class="fas fa-shield-alt"></i> Victoria Road Safety Data Platform', `
    <div class="container section"><p class="section-title">At a Glance</p><p class="section-sub">Key statistics drawn directly from the Victorian road incident database.</p>
      <div class="grid-4">${facts.map((f) => `<div class="stat-card" style="color:${f.color};border-top:4px solid ${f.color};"><div class="stat-icon" style="background:${f.bg};color:${f.color};"><i class="fas ${f.icon}"></i></div><div class="stat-value" style="color:${f.color};">${f.value}</div><div class="stat-label">${f.label}</div><div class="stat-desc">${f.desc}</div></div>`).join("")}</div></div>
    <div class="container"><div class="grid-2"><div class="card"><div class="card-header"><h3>Accidents by Year</h3></div><div class="card-body"><div class="chart-wrap"><canvas id="yearChart"></canvas></div></div></div><div class="card"><div class="card-header"><h3>Accidents by Light Condition</h3></div><div class="card-body"><div class="chart-wrap"><canvas id="lightChart"></canvas></div></div></div></div></div>
    <div class="container section"><div class="grid-2"><div class="card"><div class="card-header"><h3>Accidents by Speed Zone</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="speedChart"></canvas></div></div></div><div class="card"><div class="card-header"><h3>Top 10 LGAs by Accident Count</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="lgaChart"></canvas></div></div></div></div></div>
  `);
  new Chart(document.getElementById("yearChart"), { type: "line", data: { labels: years.map((x) => x.yr), datasets: [{ data: years.map((x) => x.cnt), borderColor: "#2563a8", backgroundColor: "rgba(37,99,168,0.1)", fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: GRID, ticks: { font: FONT } }, y: { grid: GRID, ticks: { font: FONT } } } } });
  new Chart(document.getElementById("lightChart"), { type: "doughnut", data: { labels: lights.map((x) => x.COND_NAME), datasets: [{ data: lights.map((x) => x.cnt), backgroundColor: COLORS }] }, options: { responsive: true, maintainAspectRatio: false } });
  new Chart(document.getElementById("speedChart"), { type: "bar", data: { labels: speeds.map((x) => `${x.SPEED_ZONE} km/h`), datasets: [{ data: speeds.map((x) => x.cnt), backgroundColor: COLORS.map((c) => `${c}cc`) }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: FONT } }, y: { ticks: { font: FONT } } } } });
  new Chart(document.getElementById("lgaChart"), { type: "bar", data: { labels: lgas.map((x) => x.LGA_NAME), datasets: [{ data: lgas.map((x) => x.cnt), backgroundColor: "rgba(155,89,182,0.75)" }] }, options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

async function renderMission() {
  const personas = [
    { name: "Sarah Thompson", role: "Road Safety Policy Analyst", age: 34, goal: "Identify high-risk conditions to inform government road safety policies", icon: "fa-user-tie", color: "#3498db", tasks: ["Analyse accident trends by year", "Compare conditions across regions", "Identify peak risk periods"] },
    { name: "James Park", role: "Insurance Risk Assessor", age: 42, goal: "Assess risk factors for different driver demographics and road types", icon: "fa-chart-line", color: "#27ae60", tasks: ["Review injury severity by age group", "Analyse vehicle types involved", "Study ejection & hospital rates"] },
    { name: "Dr. Emily Chen", role: "Public Health Researcher", age: 38, goal: "Study patterns in road trauma to improve emergency response planning", icon: "fa-microscope", color: "#9b59b6", tasks: ["Track hospitalisation trends", "Study injury severity patterns", "Identify at-risk demographics"] }
  ];
  root.innerHTML = layout("Our <span>Mission</span>", "Understanding the purpose of this platform, who it serves, and how it supports Victoria's road safety goals.", '<i class="fas fa-bullseye"></i> Level 1B - Mission Statement', `
    <div class="container section"><p class="section-title">User Personas</p><p class="section-sub">Designed for policy, insurance, and public health users.</p><div class="grid-3 mb-3">${personas.map((p) => `<div class="persona-card"><div class="persona-header"><div class="persona-avatar" style="background:${p.color}22;color:${p.color};"><i class="fas ${p.icon}"></i></div><div><div class="persona-name">${p.name}</div><div class="persona-role">${p.role}</div><div class="persona-age">Age ${p.age}</div></div></div><div class="persona-body"><div class="persona-goal"><strong>Goal:</strong> ${p.goal}</div><ul class="persona-tasks">${p.tasks.map((t) => `<li>${t}</li>`).join("")}</ul></div></div>`).join("")}</div></div>
  `);
}

async function renderConditions() {
  const filter = params.get("filter_type") || "atmospheric";
  const rows = await runQuery(conditionsQueries[filter] || conditionsQueries.atmospheric);
  const total = rows.reduce((x, r) => x + Number(r.accident_count || 0), 0);
  rows.forEach((r) => { r.percentage = pct(r.accident_count, total); });
  root.innerHTML = layout("Accident Conditions <span>Summary</span>", "Summarised accident data grouped by atmospheric, road surface, and light conditions.", '<i class="fas fa-cloud-rain"></i> Level 2A - Summarise Facts', `
    <div class="container section"><div class="filter-bar"><label>Filter by Condition Type:</label><div class="btn-group">
      <a class="btn ${filter === "atmospheric" ? "btn-active" : "btn-outline"}" href="?filter_type=atmospheric">Atmospheric</a>
      <a class="btn ${filter === "surface" ? "btn-active" : "btn-outline"}" href="?filter_type=surface">Road Surface</a>
      <a class="btn ${filter === "light" ? "btn-active" : "btn-outline"}" href="?filter_type=light">Light Condition</a>
    </div><span class="tag tag-blue" style="margin-left:auto;">${n(total)} total accidents</span></div>
    <div class="grid-2"><div class="card"><div class="card-header"><h3>Distribution Chart</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="conditionChart"></canvas></div></div></div><div class="card"><div class="card-header"><h3>Fatalities & Serious Injuries</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="severityChart"></canvas></div></div></div></div>
    <div class="card mt-2"><div class="card-header"><h3>Detailed Summary Table</h3></div><div class="data-table-wrap"><table><thead><tr><th>#</th><th>Condition</th><th>Total Accidents</th><th>%</th><th>Fatalities</th><th>Serious</th><th>Avg Speed</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr><td><span class="rank-badge ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : ""}">${i + 1}</span></td><td><strong>${r.condition_name}</strong></td><td class="fw-bold">${n(r.accident_count)}</td><td>${r.percentage}%</td><td class="text-danger fw-bold">${n(r.total_killed)}</td><td class="text-warning">${n(r.total_serious)}</td><td>${r.avg_speed_zone ? `${r.avg_speed_zone} km/h` : "-"}</td></tr>`).join("")}
    </tbody></table></div></div></div>`);
  new Chart(document.getElementById("conditionChart"), { type: "bar", data: { labels: rows.map((r) => r.condition_name), datasets: [{ data: rows.map((r) => r.accident_count), backgroundColor: COLORS.map((c) => `${c}cc`) }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  new Chart(document.getElementById("severityChart"), { type: "bar", data: { labels: rows.map((r) => r.condition_name), datasets: [{ label: "Fatalities", data: rows.map((r) => r.total_killed || 0), backgroundColor: "rgba(230,57,70,0.8)" }, { label: "Serious Injuries", data: rows.map((r) => r.total_serious || 0), backgroundColor: "rgba(244,162,97,0.8)" }] }, options: { responsive: true, maintainAspectRatio: false } });
}

async function renderPeople() {
  const filter = params.get("filter_type") || "injury";
  const rows = await runQuery(peopleQueries[filter] || peopleQueries.injury);
  const total = rows.reduce((x, r) => x + Number(r.person_count || 0), 0);
  rows.forEach((r) => { r.percentage = pct(r.person_count, total); r.hospital_rate = pct(r.hospital_count, r.person_count); });
  root.innerHTML = layout("People & <span>Injuries</span>", "Focused view of people involved in accidents.", '<i class="fas fa-user-injured"></i> Level 2B - Summarise Facts', `
    <div class="container section"><div class="filter-bar"><label>View by:</label><div class="btn-group">
      <a class="btn ${filter === "injury" ? "btn-active" : "btn-outline"}" href="?filter_type=injury">Injury Level</a>
      <a class="btn ${filter === "age" ? "btn-active" : "btn-outline"}" href="?filter_type=age">Age Group</a>
      <a class="btn ${filter === "ejection" ? "btn-active" : "btn-outline"}" href="?filter_type=ejection">Ejection</a>
      <a class="btn ${filter === "road_user" ? "btn-active" : "btn-outline"}" href="?filter_type=road_user">Road User</a>
    </div></div>
    <div class="grid-2"><div class="card"><div class="card-header"><h3>Distribution</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="peopleChart"></canvas></div></div></div><div class="card"><div class="card-header"><h3>Hospitalisation Rate (%)</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="hospitalChart"></canvas></div></div></div></div>
    <div class="card mt-2"><div class="card-header"><h3>Detailed Summary Table</h3></div><div class="data-table-wrap"><table><thead><tr><th>#</th><th>Category</th><th>Total</th><th>%</th><th>Hospitalised</th><th>Hospital Rate</th><th>Male</th><th>Female</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr><td><span class="rank-badge ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : ""}">${i + 1}</span></td><td><strong>${r.category}</strong></td><td class="fw-bold">${n(r.person_count)}</td><td>${r.percentage}%</td><td>${n(r.hospital_count)}</td><td>${r.hospital_rate}%</td><td>${n(r.male_count)}</td><td>${n(r.female_count)}</td></tr>`).join("")}
    </tbody></table></div></div></div>`);
  new Chart(document.getElementById("peopleChart"), { type: "doughnut", data: { labels: rows.map((r) => r.category), datasets: [{ data: rows.map((r) => r.person_count), backgroundColor: COLORS }] }, options: { responsive: true, maintainAspectRatio: false } });
  new Chart(document.getElementById("hospitalChart"), { type: "bar", data: { labels: rows.map((r) => r.category), datasets: [{ data: rows.map((r) => r.hospital_rate), backgroundColor: "rgba(42,157,143,0.75)" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => `${v}%` } } } } });
}

async function renderDeepConditions() {
  const metric = params.get("metric") || "fatality_rate";
  const rows = await runQuery(deepConditionsQueries[metric] || deepConditionsQueries.fatality_rate);
  root.innerHTML = layout("Deep Conditions <span>Analysis</span>", "Subquery analysis for above-average risk conditions.", '<i class="fas fa-search-plus"></i> Level 3A - Discover New Facts', `
    <div class="container section"><div class="filter-bar"><label>Subquery Analysis:</label><div class="btn-group">
      <a class="btn ${metric === "fatality_rate" ? "btn-active" : "btn-outline"}" href="?metric=fatality_rate">Atmospheric</a>
      <a class="btn ${metric === "speed_fatality" ? "btn-active" : "btn-outline"}" href="?metric=speed_fatality">Speed Zone</a>
      <a class="btn ${metric === "light_risk" ? "btn-active" : "btn-outline"}" href="?metric=light_risk">Light Condition</a>
    </div></div>
    <div class="grid-2"><div class="card"><div class="card-header"><h3>Fatality Rate by Condition</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="deepChart"></canvas></div></div></div><div class="card"><div class="card-header"><h3>Accidents vs Fatalities</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="compareChart"></canvas></div></div></div></div>
    <div class="card mt-2"><div class="card-header"><h3>Ranked Conditions</h3></div><div class="data-table-wrap"><table><thead><tr><th>Rank</th><th>Condition</th><th>Accidents</th><th>Fatalities</th><th>Serious</th><th>Fatality Rate</th><th>Serious Rate</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${r.rank}</td><td><strong>${r.condition_name}</strong></td><td>${n(r.accident_count)}</td><td class="text-danger fw-bold">${n(r.total_killed)}</td><td>${n(r.total_serious)}</td><td>${r.fatality_rate}%</td><td>${r.serious_rate}%</td></tr>`).join("")}
    </tbody></table></div></div></div>`);
  new Chart(document.getElementById("deepChart"), { type: "bar", data: { labels: rows.map((r) => r.condition_name), datasets: [{ data: rows.map((r) => r.fatality_rate), backgroundColor: "rgba(230,57,70,0.8)" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
  new Chart(document.getElementById("compareChart"), { type: "bar", data: { labels: rows.map((r) => r.condition_name), datasets: [{ label: "Accidents", data: rows.map((r) => r.accident_count), backgroundColor: "rgba(37,99,168,0.7)" }, { label: "Fatalities", data: rows.map((r) => r.total_killed), backgroundColor: "rgba(230,57,70,0.8)" }] }, options: { responsive: true, maintainAspectRatio: false } });
}

async function renderDeepPeople() {
  const metric = params.get("metric") || "high_risk_age";
  const rows = await runQuery(deepPeopleQueries[metric] || deepPeopleQueries.high_risk_age);
  root.innerHTML = layout("Deep People <span>Analysis</span>", "Subquery-driven discovery of above-average hospitalisation and fatality rates.", '<i class="fas fa-microscope"></i> Level 3B - Discover New Facts', `
    <div class="container section"><div class="filter-bar"><label>Discovery Mode:</label><div class="btn-group">
      <a class="btn ${metric === "high_risk_age" ? "btn-active" : "btn-outline"}" href="?metric=high_risk_age">High-Risk Age Groups</a>
      <a class="btn ${metric === "unprotected" ? "btn-active" : "btn-outline"}" href="?metric=unprotected">Protection Equipment</a>
      <a class="btn ${metric === "road_user_risk" ? "btn-active" : "btn-outline"}" href="?metric=road_user_risk">Road User Risk</a>
    </div></div>
    <div class="grid-2"><div class="card"><div class="card-header"><h3>Hospital Rate</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="hospChart"></canvas></div></div></div><div class="card"><div class="card-header"><h3>Fatality Rate</h3></div><div class="card-body"><div class="chart-wrap-tall"><canvas id="fatalChart"></canvas></div></div></div></div>
    <div class="card mt-2"><div class="card-header"><h3>Ranked Groups</h3></div><div class="data-table-wrap"><table><thead><tr><th>Rank</th><th>Category</th><th>Total People</th><th>Hospitalised</th><th>Hospital Rate</th><th>Fatalities</th><th>Fatality Rate</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${r.rank}</td><td><strong>${r.category}</strong></td><td>${n(r.person_count)}</td><td>${n(r.hospital_count)}</td><td>${r.hospital_rate}%</td><td class="text-danger fw-bold">${n(r.fatality_count)}</td><td>${r.fatality_rate}%</td></tr>`).join("")}
    </tbody></table></div></div></div>`);
  new Chart(document.getElementById("hospChart"), { type: "bar", data: { labels: rows.map((r) => r.category), datasets: [{ data: rows.map((r) => r.hospital_rate), backgroundColor: "rgba(42,157,143,0.8)" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => `${v}%` } } } } });
  new Chart(document.getElementById("fatalChart"), { type: "bar", data: { labels: rows.map((r) => r.category), datasets: [{ data: rows.map((r) => r.fatality_rate), backgroundColor: "rgba(230,57,70,0.8)" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

async function init() {
  setActiveNav();
  root.innerHTML = '<div class="loading-screen">Loading database and running SQL queries...</div>';
  try {
    if (pageKey === "landing") await renderLanding();
    if (pageKey === "mission") await renderMission();
    if (pageKey === "conditions") await renderConditions();
    if (pageKey === "people") await renderPeople();
    if (pageKey === "deep_conditions") await renderDeepConditions();
    if (pageKey === "deep_people") await renderDeepPeople();
  } catch (err) {
    showError(err);
  }
}

init();
