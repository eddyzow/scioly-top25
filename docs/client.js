/* ==========================================================
   Scioly25 Client (Preseason-ready, Division B removed)
   - No placeholder rankings before Oct 25, 2025
   - Week 1 begins Oct 25, 2025
   - FLIP animations preserved when data exists
   - Preseason overlay with top alignment to first news card
   - Robust against duplicate overlays & resize corruption
   ========================================================== */

/* ---- Labels ---- */
const WEEK_LABELS = {
  0: "2026 Preseason (through Oct 25, 2025)",
  1: "2026 Week 1 (Oct 25 – Oct 31, 2025)",
  // Add more weeks when you publish them:
  // 2: "Week 2 (Nov 1 – Nov 7, 2025)",
  // ...
};

/* ---- Data ----
   IMPORTANT: No placeholder rankings are shipped.
   Fill in DATA.C[1] (and beyond) when results are finalized. */
const DATA = {
  C: {
    1: [], // e.g., ["Team A","Team B",...,"Team Y"] (max 25)
  },
};

/* ---- News ---- */
const NEWS = {
  preseason: [
    {
      title: "Preseason Poll Schedule Announced",
      date: "Oct 5, 2025",
      author: "Scioly25 Team",
      content:
        "Welcome to the 2025-2026 Science Olympiad season! We are currently in the period we call \"pre-season\", when the season is officially underway but no major tournaments have taken place. Initial pre-season rankings will be released on Oct. 25. From then on, we will update rankings periodically based on alumni votes, which will be influenced by general sentiment and tournament results. If you are an alum, we encourage you to participate in the voting process to help shape the rankings. You can find the sign-up form by clicking the button in the lower right hand corner. Stay tuned for more updates as the season progresses!",
    },
  ],
  C: {
    1: [], // Fill with real Week 1 headlines after release
  },
};

/* ---- State ---- */
let currentDivision = "C";
let currentWeek = 0; // start in Preseason

/* ---- Utils ---- */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* Compute rank diffs relative to previous list */
function computeStats(currList, prevList) {
  const prevIdx = new Map();
  if (prevList) prevList.forEach((t, i) => prevIdx.set(t, i + 1));
  const out = {};
  currList.forEach((t, i) => {
    const curr = i + 1;
    const prev = prevIdx.has(t) ? prevIdx.get(t) : null;
    const diff = prev == null ? null : prev - curr; // + up, - down
    out[t] = { currRank: curr, prevRank: prev, diff };
  });
  return out;
}

/* ---- News Render ---- */
function renderNews(div, wk) {
  const box = $("#articles").empty();

  // If before Oct 25, always show preseason headline(s)
  const today = new Date();
  const preseasonEnd = new Date("2025-10-25T00:00:00");
  if (today < preseasonEnd) {
    NEWS.preseason.forEach((a) => {
      box.append(`
        <div class="blogpost">
          <div class="title">${a.title}</div>
          <div class="devtime">${a.date} · ${a.author}</div>
          <p class="note">${a.content}</p>
        </div>
      `);
    });
    return;
  }

  // After preseason, render week headlines (if any)
  const items = (NEWS[div] && NEWS[div][wk]) ? NEWS[div][wk] : [];
  items.forEach((a) => {
    box.append(`
      <div class="blogpost">
        <div class="title">${a.title}</div>
        <div class="devtime">${a.date} · ${a.author}</div>
        <p class="note">${a.content}</p>
      </div>
    `);
  });

  // Soft placeholder if none
  if (items.length === 0) {
    box.append(`
      <div class="blogpost">
        <div class="title">Awaiting Results</div>
        <div class="devtime">${WEEK_LABELS[wk] || ""}</div>
        <p class="note">Headlines will appear as soon as results are posted.</p>
      </div>
    `);
  }
}

/* ==========================================================
   Robust FLIP Animation (table-safe)
   - Handles empty weeks gracefully
   ========================================================== */
function renderTable(div, wk, animate = true) {
  const tbody = document.getElementById("rankingBody");

  const currList = (DATA[div] && DATA[div][wk]) ? DATA[div][wk] : [];
  const prevList = (wk > 0 && DATA[div] && DATA[div][wk - 1]) ? DATA[div][wk - 1] : null;

  // If no data for this week, show a friendly placeholder row
  if (!Array.isArray(currList) || currList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; opacity:.85;">
          ${wk === 0 ? "No rankings yet — preseason mode." : "No rankings published yet."}
        </td>
      </tr>
    `;
    // Labels & nav buttons
    $("#divisionLabel").text(div);
    $("#weekLabel").text(WEEK_LABELS[wk] || "");
    $("#weekRangeLabel").text(WEEK_LABELS[wk] || "");
    $("#prevWeekBtn").prop("disabled", wk === 0);
    $("#nextWeekBtn").prop("disabled", !(WEEK_LABELS[wk + 1]));
    // News
    renderNews(div, wk);
    // If overlay is present, realign after content changes
    scheduleOverlayRealign();
    return;
  }

  // Otherwise: normal FLIP flow
  const stats = computeStats(currList, prevList);

  // Map existing rows
  const oldRows = new Map();
  Array.from(tbody.children).forEach((tr) => {
    const id = tr.getAttribute("data-id");
    if (id) oldRows.set(id, tr);
  });

  // FIRST: measure current positions
  const firstRect = new Map();
  oldRows.forEach((el, id) => {
    firstRect.set(id, el.getBoundingClientRect().top);
  });

  // Determine leaving ids
  const incomingIds = new Set(currList.map(slug));
  const leaving = [];
  oldRows.forEach((el, id) => {
    if (!incomingIds.has(id)) leaving.push(el);
  });

  // Build final order (reusing nodes when possible)
  const frag = document.createDocumentFragment();
  currList.forEach((team) => {
    const id = slug(team);
    const { currRank, prevRank, diff } = stats[team];
    let trend = `<span class="trend-none">—</span>`;
    if (prevRank != null) {
      if (diff > 0) trend = `<span class="trend-up">▲ ${diff}</span>`;
      else if (diff < 0) trend = `<span class="trend-down">▼ ${Math.abs(diff)}</span>`;
    }

    let row = oldRows.get(id);
    if (!row) {
      // ENTERING
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
      // UPDATE existing
      row.querySelector(".rank-num").textContent = `#${currRank}`;
      row.querySelector(".team-name").textContent = team;
      row.querySelector(".trend").innerHTML = trend;
      row.style.willChange = "transform, opacity";
    }
    frag.appendChild(row);
  });

  // Remove leaving from layout first
  leaving.forEach((el) => {
    el.style.transition = "transform 220ms ease, opacity 220ms ease";
    el.style.transform = "translateY(20px)";
    el.style.opacity = "0";
    el.parentNode && el.parentNode.removeChild(el);
  });

  // Append final order
  tbody.appendChild(frag);

  // LAST: measure final positions
  const lastRect = new Map();
  Array.from(tbody.children).forEach((tr) => {
    const id = tr.getAttribute("data-id");
    if (id) lastRect.set(id, tr.getBoundingClientRect().top);
  });

  // INVERT + PLAY
  if (animate) {
    Array.from(tbody.children).forEach((tr) => {
      const id = tr.getAttribute("data-id");
      const firstTop = firstRect.get(id);
      const lastTop = lastRect.get(id);
      if (firstTop === undefined) {
        // entering
        void tr.getBoundingClientRect();
        tr.style.transition = "transform 250ms ease, opacity 250ms ease";
        tr.style.transform = "translateY(0)";
        tr.style.opacity = "1";
        return;
      }
      const delta = firstTop - lastTop;
      tr.style.transition = "none";
      tr.style.transform = `translateY(${delta}px)`;
      void tr.getBoundingClientRect();
      tr.style.transition = "transform 250ms ease, opacity 250ms ease";
      tr.style.transform = "translateY(0)";
      tr.style.opacity = "1";
    });
  } else {
    Array.from(tbody.children).forEach((tr) => {
      tr.style.transition = "transform 250ms ease, opacity 250ms ease";
      tr.style.transform = "translateY(0)";
      tr.style.opacity = "1";
    });
  }

  // Labels & buttons
  $("#divisionLabel").text(div);
  $("#weekLabel").text(WEEK_LABELS[wk] || "");
  $("#weekRangeLabel").text(WEEK_LABELS[wk] || "");
  $("#prevWeekBtn").prop("disabled", wk === 0);
  $("#nextWeekBtn").prop("disabled", !(WEEK_LABELS[wk + 1]));

  // News
  renderNews(div, wk);

  // If overlay is present, realign after content changes
  scheduleOverlayRealign();
}

/* ---- Events ---- */
function setDivision(div) {
  // Division B removed; keep label static but preserve API for future
  currentDivision = "C";
  renderTable(currentDivision, currentWeek, true);
}

$(function () {
  // Week arrows
  $("#prevWeekBtn").on("click", function () {
    if (currentWeek > 0) {
      currentWeek--;
      renderTable(currentDivision, currentWeek, true);
    }
    $("#prevWeekBtn").prop("disabled", currentWeek === 0);
    $("#nextWeekBtn").prop("disabled", !(WEEK_LABELS[currentWeek + 1]));
  });

  $("#nextWeekBtn").on("click", function () {
    if (WEEK_LABELS[currentWeek + 1]) {
      currentWeek++;
      renderTable(currentDivision, currentWeek, true);
    }
    $("#prevWeekBtn").prop("disabled", currentWeek === 0);
    $("#nextWeekBtn").prop("disabled", !(WEEK_LABELS[currentWeek + 1]));
  });

  // Vote (stub)
  $("#voteBtn").on("click", function () {
    window.open("https://forms.gle/UJ2dUeJBy1ve8UJ48", "_blank");
  });

  // Initial paint
  setDivision("C");
  renderTable(currentDivision, currentWeek, false);
});

/* ==========================================================
   Overlay management (prevents duplicates + smooth reflow)
   ========================================================== */
const OVERLAY_ID = "preseasonOverlay";
let overlayRAF = null;

function alignOverlayToNewsCard() {
  const $ranking = $(".ranking-section");
  const $overlay = $("#" + OVERLAY_ID);
  const $overlayCard = $overlay.find(".preseason-card");
  const $firstNews = $(".news-section .blogpost").first();

  if (!$ranking.length || !$overlay.length || !$overlayCard.length) return;

  // Default: no offset if there is no news card
  let offset = 0;

  if ($firstNews.length) {
    // Align the overlay card's top to the first news card (relative to the same row)
    const rowTop = $(".two-column").offset().top || 0;
    const rankingTop = $ranking.offset().top - rowTop;
    const newsCardTop = $firstNews.offset().top - rowTop;
    offset = Math.max(0, newsCardTop - rankingTop);
  }

  // Use margin-top on the card; simpler and avoids reflow thrash

}

function scheduleOverlayRealign() {
  if (overlayRAF) cancelAnimationFrame(overlayRAF);
  overlayRAF = requestAnimationFrame(() => {
    alignOverlayToNewsCard();
    overlayRAF = null;
  });
}

function ensurePreseasonOverlay() {
  const today = new Date();
  const preseasonEnd = new Date("2025-10-25T00:00:00");
  if (today >= preseasonEnd) return; // no overlay after preseason

  if (!document.getElementById(OVERLAY_ID)) {
    const overlay = $(`
      <div class="preseason-overlay" id="${OVERLAY_ID}">
        <div class="preseason-card">
          <h3 class="preseason-title">Preseason Poll Coming Soon</h3>
        
          <p class="preseason-text">
            Preseason rankings will be released on <strong>October 25, 2025</strong>.
          </p>
        </div>
      </div>
    `);
    $(".ranking-section").css("position", "relative").append(overlay);
  }

  scheduleOverlayRealign();
}

/* Create overlay once on ready, and keep it aligned */
$(function () {
  ensurePreseasonOverlay();

  // Re-align on viewport changes
  $(window).on("resize orientationchange", scheduleOverlayRealign);

  // Re-align when news list height changes
  if (window.ResizeObserver) {
    const newsEl = document.querySelector(".news-section");
    const rankEl = document.querySelector(".ranking-section");
    const ro = new ResizeObserver(() => scheduleOverlayRealign());
    newsEl && ro.observe(newsEl);
    rankEl && ro.observe(rankEl);
  }

  // Also re-align after any async content is appended to news
  const articles = document.getElementById("articles");
  if (articles && window.MutationObserver) {
    const mo = new MutationObserver(() => scheduleOverlayRealign());
    mo.observe(articles, { childList: true, subtree: true });
  }
});
