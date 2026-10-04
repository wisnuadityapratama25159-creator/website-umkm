const form = document.querySelector("#form-kontak");
const preview = document.querySelector("#preview-form");

if (form && preview) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);

    preview.textContent = [
      `Nama: ${data.get("nama")}`,
      `Email: ${data.get("email")}`,
      `Nomor telepon: ${data.get("telepon") || "-"}`,
      `Paket: ${data.get("paket")}`,
      `Topik: ${data.get("topik")}`,
      `Pesan: ${data.get("pesan")}`,
    ].join("\n");
  });
}