const promoButton = document.querySelector("#promoButton");

if (promoButton) {
  promoButton.addEventListener("click", () => {
    promoButton.textContent = "Promo Beli 2 gratis 1";
    console.log("Promo Warkop Mas Hamzah berhasil ditampilkan, Ngopi Kuy!.");
  });
}