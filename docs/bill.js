window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const billId = urlParams.get("id");
  if (billId) {
    document.getElementById("currentBillId").textContent = billId;

    Promise.all([
      fetch(`data/${billId}.json`).then((response) => {
        if (response.status === 404) throw new Error("Bill not found");
        return response.json();
      }),
      fetch(`data/${billId}_Summary.json`).then((response) => {
        if (response.status === 404) throw new Error("Summary not found");
        return response.json();
      }),
    ])
      .then(([bill, summary]) => {
        const main = document.querySelector("main");
        main.innerHTML = `
        <h2>${bill.agency} Bill ${bill.id}</h2>
          <p>
            <a href="https://app.leg.wa.gov/billsummary?BillNumber=${
              bill.id
            }&Initiative=False&Year=2025" target="_blank">Official Page↗</a>
            <br/>
            <a href="https://app.leg.wa.gov/pbc/bill/${
              bill.id
            }" target="_blank">Tell your representative what you think↗</a>
          </p>
          <p>${bill.description}</p>
          <p><strong>Sponsors:</strong> ${bill.sponsors.join(", ")}</p>
          <p><strong>Introduced:</strong> ${new Date(
            bill.introducedDate
          ).toLocaleDateString()}</p>
          <p><strong>Last Action:</strong> ${new Date(
            bill.actionDate
          ).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${bill.status}</p>
        <div class="view-toggle" role="tablist">
          <button role="tab" aria-selected="true" aria-controls="summaryView" onclick="toggleView('summary')" class="active" id="summaryBtn">Summary</button>
          <button role="tab" aria-selected="false" aria-controls="originalView" onclick="toggleView('original')" id="originalBtn">Original</button>
        </div>
        <div id="summaryView" role="tabpanel" aria-labelledby="summaryBtn">
          <h2>Summary</h2>
          <i>AI-Generated Summary - May Contain Errors. Check Official Text.</i>
          ${summary.documents[bill.id].summary}
        </div>
        <div id="originalView" role="tabpanel" aria-labelledby="originalBtn" style="display: none; overflow: auto;">
          <h2>Original</h2>
          ${summary.documents[bill.id].original}
        </div>
      `;
      })
      .catch((error) => {
        const message = error.message.includes("not found")
          ? `${error.message} for bill ${billId}.`
          : `Failed to load bill ${billId}: ${error.message}`;

        document.querySelector("main").innerHTML = `
        <h2>Error</h2>
        <p>${message}</p>
        <p><a href="index.html">Return to bill list</a></p>
      `;
      });
  }
};

function toggleView(view) {
  const originalView = document.getElementById("originalView");
  const summaryView = document.getElementById("summaryView");
  const originalBtn = document.getElementById("originalBtn");
  const summaryBtn = document.getElementById("summaryBtn");

  if (view === "original") {
    originalView.style.display = "block";
    summaryView.style.display = "none";
    originalBtn.classList.add("active");
    summaryBtn.classList.remove("active");
    originalBtn.setAttribute("aria-selected", "true");
    summaryBtn.setAttribute("aria-selected", "false");
  } else {
    originalView.style.display = "none";
    summaryView.style.display = "block";
    originalBtn.classList.remove("active");
    summaryBtn.classList.add("active");
    originalBtn.setAttribute("aria-selected", "false");
    summaryBtn.setAttribute("aria-selected", "true");
  }
}
