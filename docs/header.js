function onEnter(event, fn) {
  if (event.key === "Enter") {
    fn();
  }
}

function findBill() {
  const billId = document.getElementById("billId").value;
  if (billId) {
    window.location.href = `bill.html?id=${billId}`;
  }
}
