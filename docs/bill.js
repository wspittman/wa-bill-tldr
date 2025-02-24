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
            }&Initiative=False&Year=2025" target="_blank">Official page↗</a>
            <br/>
            <a href="https://app.leg.wa.gov/pbc/bill/${
              bill.id
            }" target="_blank">Official public comment↗</a>
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
        <div class="view-toggle">
        <button onclick="toggleView('summary')" class="active" id="summaryBtn">Summary</button>
          <button onclick="toggleView('original')" id="originalBtn">Original</button>
        </div>
        <div id="summaryView">
          <h2>${bill.agency} Bill ${bill.id} - Summary</h2>
          <i>AI-Generated Summary - May Contain Errors. Check Official Text.</i>
          ${summary.documents[bill.id].summary}
        </div>
        <div id="originalView" style="display: none;">
          <h2>${bill.agency} Bill ${bill.id} - Original</h2>
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
  } else {
    originalView.style.display = "none";
    summaryView.style.display = "block";
    originalBtn.classList.remove("active");
    summaryBtn.classList.add("active");
  }
}
