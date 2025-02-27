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
        ${renderViewSection(bill.id, bill.billDocuments, summary.documents)}
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

function renderViewSection(id, billDocuments, documents) {
  const idString = String(id);
  const components = billDocuments.map((billDoc) =>
    renderViewComponents(
      billDoc,
      documents[billDoc.name],
      billDoc.name === idString
    )
  );

  return `
    <div class="view-toggle" role="tablist">
      ${components.flatMap((c) => c.buttons).join("\n")}
    </div>
    ${components.flatMap((c) => c.contents).join("\n")}
  `;
}

function renderViewComponents({ name, description }, document, isDefault) {
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
        document.summary,
        true,
        isDefault
      ),
      renderViewContent(oid, `Original: ${description}`, document.original),
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
