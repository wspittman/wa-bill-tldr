window.onload = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const billId = urlParams.get("id");

  if (billId) {
    try {
      document.getElementById("currentBillId").textContent = billId;

      const { bill, summary } = await fetchBill(billId);

      const main = document.querySelector("main");
      main.innerHTML = `
        ${renderMetaSection(bill)}
        ${renderViewSection(bill.id, summary.documents)}
      `;
    } catch (error) {
      renderError(billId, error.message);
    }
  }
};

async function fetchBill(id) {
  const [bill, summary] = await Promise.all([
    fetchJson(`data/${id}.json`),
    fetchJson(`data/${id}_Summary.json`),
  ]);

  return { bill, summary };
}

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
    ${renderMeta("Last Action", new Date(bill.actionDate))}
    ${renderMeta("Status", bill.status)}
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

function renderViewSection(id, documents) {
  return `
    <div class="view-toggle" role="tablist">
      ${renderViewTab("Summary", true)}
      ${renderViewTab("Original")}
    </div>
    ${renderViewContent("Summary", documents[id], true, true)}
    ${renderViewContent("Original", documents[id])}
  `;
}

function renderViewTab(name, isDefault = false) {
  return `<button id="${name}Btn" role="tab" aria-selected="${isDefault}" aria-controls="${name}View" onclick="toggleView('${name}')" class="view-tab${
    isDefault ? " active" : ""
  }">${name}</button>`;
}

function renderViewContent(name, document, isAI = false, isDefault = false) {
  const disclaimer = isAI
    ? "<i>AI-Generated Summary - May Contain Errors. Check Official Text.</i>"
    : "";
  return `
    <div id="${name}View" role="tabpanel" aria-labelledby="${name}Btn" style="display: ${
    isDefault ? "block" : "none"
  }; overflow: auto;">
      <h2>${name}</h2>
      ${disclaimer}
      ${document[name.toLowerCase()]}
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
