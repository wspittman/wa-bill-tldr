fetch("data/bills.json")
  .then((response) => response.json())
  .then((bills) => {
    const tbody = document.getElementById("billsTableBody");
    tbody.innerHTML = bills
      .map(
        (bill) => `
            <tr>
                <td><a href="bill.html?id=${bill.id}">${bill.id}</a></td>
                <td>${bill.description}</td>
                <td>${bill.agency}</td>
                <td>${bill.sponsors.join(", ")}</td>
                <td>${bill.status}</td>
            </tr>
        `
      )
      .join("");
  })
  .catch((error) => {
    document.getElementById("billsTableBody").innerHTML = `
            <tr>
                <td colspan="5">Error loading bills: ${error.message}</td>
            </tr>
        `;
  });
