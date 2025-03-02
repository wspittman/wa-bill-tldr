let billsData = [];
let currentSortColumn = "";
let isAscending = true;
let filterText = "";

function sortBills(column) {
  const sortingFunctions = {
    Bill: (a, b) => a.id - b.id,
    Description: (a, b) => a.description.localeCompare(b.description),
    Sponsors: (a, b) =>
      a.sponsors.join(", ").localeCompare(b.sponsors.join(", ")),
    Status: (a, b) => a.status.localeCompare(b.status.text),
  };

  if (currentSortColumn === column) {
    isAscending = !isAscending;
  } else {
    currentSortColumn = column;
    isAscending = true;
  }

  billsData.sort((a, b) => {
    const result = sortingFunctions[column](a, b);
    return isAscending ? result : -result;
  });

  updateTableDisplay();
}

function filterBills() {
  filterText = document.getElementById("filterInput").value.toLowerCase();
  updateTableDisplay();
}

function matchesFilter(bill) {
  if (!filterText) return true;
  return (
    bill.description.toLowerCase().includes(filterText) ||
    bill.sponsors.join(", ").toLowerCase().includes(filterText) ||
    bill.status.text.toLowerCase().includes(filterText) ||
    bill.keywords?.text.toLowerCase().includes(filterText)
  );
}

function updateTableDisplay() {
  const tbody = document.getElementById("billsTableBody");
  const filteredBills = billsData.filter(matchesFilter);

  tbody.innerHTML = filteredBills.length
    ? filteredBills
        .map(
          (bill) => `
            <tr>
                <td><a href="bill.html?id=${bill.id}">${bill.id}</a> (${
            bill.agency
          })</td>
                <td>${bill.description}</td>
                <td>${bill.sponsors.join(", ")}</td>
                <td>${bill.status.text}</td>
            </tr>
        `
        )
        .join("")
    : `<tr><td colspan="6">No matching bills found</td></tr>`;

  // Update sort indicators
  document.querySelectorAll("#billsTable th").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (th.textContent === currentSortColumn) {
      th.classList.add(isAscending ? "sort-asc" : "sort-desc");
    }
  });
}

fetch("data/bills.json")
  .then((response) => response.json())
  .then((bills) => {
    billsData = bills;
    updateTableDisplay();
  })
  .catch((error) => {
    document.getElementById("billsTableBody").innerHTML = `
            <tr>
                <td colspan="6">Error loading bills: ${error.message}</td>
            </tr>
        `;
  });
