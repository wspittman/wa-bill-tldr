window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const billId = urlParams.get("id");
  if (billId) {
    document.getElementById("currentBillId").textContent = billId;

    fetch(`data/${billId}.json`)
      .then((response) => {
        if (response.status === 404) {
          throw new Error("Bill not found");
        }
        return response.json();
      })
      .then((bill) => {
        const main = document.querySelector("main");
        main.innerHTML = `
                    <h2>${bill.agency} Bill ${bill.id}</h2>
                    <p>
                        <a href="https://app.leg.wa.gov/billsummary?BillNumber=${
                          bill.id
                        }&Initiative=False&Year=2025" target="_blank">Link to official page↗</a>
                        <br/>
                        <a href="https://app.leg.wa.gov/pbc/bill/${
                          bill.id
                        }" target="_blank">Link to official public comment↗</a>
                    </p>
                    <p>${bill.description}</p>
                    <p><strong>Sponsors:</strong> ${bill.sponsors.join(
                      ", "
                    )}</p>
                    <p><strong>Introduced:</strong> ${new Date(
                      bill.introducedDate
                    ).toLocaleDateString()}</p>
                    <p><strong>Last Action:</strong> ${new Date(
                      bill.actionDate
                    ).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${bill.status}</p>
                `;
      })
      .catch((error) => {
        const message =
          error.message === "Bill not found"
            ? `Bill ${billId} was not found.`
            : `Failed to load bill ${billId}: ${error.message}`;

        document.querySelector("main").innerHTML = `
                    <h2>Error</h2>
                    <p>${message}</p>
                    <p><a href="index.html">Return to bill list</a></p>
                `;
      });
  }
};
