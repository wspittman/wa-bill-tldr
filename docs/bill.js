window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const billId = urlParams.get("id");
  if (billId) {
    document.getElementById("currentBillId").textContent = billId;
  }
};
