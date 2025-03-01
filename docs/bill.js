window.onload = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const billId = urlParams.get("id");

  if (billId) {
    try {
      document.getElementById("currentBillId").textContent = billId;

      const bill = await fetchJson(`data/${billId}.json`);

      const main = document.querySelector("main");
      main.innerHTML = `
        ${renderMetaSection(bill)}
        ${renderViewSection(bill)}
      `;
    } catch (error) {
      renderError(billId, error.message);
    }
  }
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

function renderError(id, message) {
  document.querySelector("main").innerHTML = `
    <h2>Error</h2>
    <p>Failed to load bill ${id}: ${message}</p>
    <p><a href="index.html">Return to bill list</a></p>
  `;
}

function renderMetaSection(bill) {
  return `
    <h2>${bill.agency} Bill ${bill.id}</h2>
    <p>
      ${renderExternalLink(
        `https://app.leg.wa.gov/billsummary?BillNumber=${bill.id}&Initiative=False&Year=2025`,
        "Official Page"
      )}
      <br/>
      ${renderExternalLink(
        `https://app.leg.wa.gov/pbc/bill/${bill.id}`,
        "Tell your representative what you think"
      )}
    </p>
    <p>${bill.description}</p>
    ${renderMeta("Sponsors", bill.sponsors)}
    ${renderMeta("Introduced", new Date(bill.introducedDate))}
    ${renderMeta("Last Action", new Date(bill.status.ts))}
    ${renderMeta("Status", bill.status.text)}
  `;
}

function renderExternalLink(url, text) {
  return `<a href="${url}" target="_blank">${text}↗</a>`;
}

function renderMeta(name, value) {
  if (Array.isArray(value)) value = value.join(", ");
  if (value instanceof Date) value = value.toLocaleDateString();
  return `<p><strong>${name}:</strong> ${value}</p>`;
}

function renderViewSection({ document, subDocuments }) {
  const components = [
    renderViewComponents(document, true),
    ...subDocuments.map((subDoc) => renderViewComponents(subDoc)),
  ];

  return `
    <div class="view-toggle" role="tablist">
      ${components.flatMap((c) => c.buttons).join("\n")}
    </div>
    ${components.flatMap((c) => c.contents).join("\n")}
  `;
}

function renderViewComponents(
  { name, description, original, summary },
  isDefault
) {
  const sid = `${name}_summary`;
  const oid = `${name}_original`;
  return {
    buttons: [
      renderViewTab(sid, `${name} Summary`, isDefault),
      renderViewTab(oid, `${name} Original`),
    ],
    contents: [
      renderViewContent(
        sid,
        `Summary: ${description}`,
        summary.text,
        true,
        isDefault
      ),
      renderViewContent(oid, `Original: ${description}`, original.text),
    ],
  };
}

function renderViewTab(tabId, tabDisplay, isDefault = false) {
  return `<button id="${tabId}Btn" role="tab" aria-selected="${isDefault}" aria-controls="${tabId}View" onclick="toggleView('${tabId}')" class="view-tab${
    isDefault ? " active" : ""
  }">${tabDisplay}</button>`;
}

function renderViewContent(
  tabId,
  tabDisplay,
  html,
  isAI = false,
  isDefault = false
) {
  const disclaimer = isAI
    ? "<i>AI-Generated Summary - May Contain Errors. Check Official Text.</i>"
    : "";
  return `
    <div id="${tabId}View" role="tabpanel" aria-labelledby="${tabId}Btn" style="display: ${
    isDefault ? "block" : "none"
  }; overflow: auto;">
      <h2>${tabDisplay}</h2>
      ${disclaimer}
      ${html}
    </div>
  `;
}

function toggleView(name) {
  const views = document.querySelectorAll("[role=tabpanel]");
  views.forEach(
    (v) => (v.style.display = v.id === `${name}View` ? "block" : "none")
  );

  const tabs = document.querySelectorAll(".view-tab");
  tabs.forEach((t) => {
    const isSelected = t.id === `${name}Btn`;
    t.classList.toggle("active", isSelected);
    t.setAttribute("aria-selected", isSelected);
  });
}
