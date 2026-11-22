// P12-02: newsletter ringan. Hanya menyimpan email newsletter di localStorage
// sebagai string JSON. Tidak menyimpan data sensitif.
// Dibungkus function agar nama variabel tidak bentrok dengan js/form.js dan js/app.js.
(function () {
  "use strict";

  const KUNCI_NEWSLETTER = "kopi-nusa-newsletter";

  const formNewsletter = document.querySelector("#form-newsletter");
  const inputEmail = document.querySelector("#newsletter-email");
  const errorEmail = document.querySelector("#newsletter-email-error");
  const statusNewsletter = document.querySelector("#newsletter-status");
  const tombolHapus = document.querySelector("#newsletter-hapus");

  // Halaman lain tidak punya form ini: berhenti diam-diam tanpa error.
  if (!formNewsletter || !inputEmail || !errorEmail || !statusNewsletter || !tombolHapus) {
    return;
  }

  function aturStatus(teks, jenis) {
    statusNewsletter.textContent = teks;
    statusNewsletter.className = jenis ? `form-feedback ${jenis}` : "form-feedback";
  }

  function tampilkanErrorEmail(pesan) {
    inputEmail.setCustomValidity(pesan);
    inputEmail.setAttribute("aria-invalid", pesan ? "true" : "false");
    errorEmail.textContent = pesan;
  }

  // OUTPUT: true jika email valid; jika tidak, pesan error tampil
  function periksaEmail() {
    inputEmail.setCustomValidity("");

    let pesan = "";
    const validity = inputEmail.validity;
    if (validity.valueMissing) {
      pesan = "Email newsletter wajib diisi.";
    } else if (validity.typeMismatch) {
      pesan = "Format email belum benar. Contoh: nama@contoh.com.";
    } else if (validity.tooLong) {
      pesan = `Email maksimal ${inputEmail.maxLength} karakter.`;
    }

    tampilkanErrorEmail(pesan);
    return pesan === "";
  }

  // PROSES: object -> JSON.stringify -> setItem di dalam try...catch
  function simpanNewsletter() {
    const data = {
      email: inputEmail.value.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(KUNCI_NEWSLETTER, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn("Email newsletter tidak bisa disimpan.", error);
      return false;
    }
  }

  // PROSES: getItem -> JSON.parse di dalam try...catch; data rusak dibuang
  function muatNewsletter() {
    try {
      const tersimpan = localStorage.getItem(KUNCI_NEWSLETTER);
      if (!tersimpan) {
        aturStatus("Belum ada email newsletter tersimpan.", "");
        return;
      }

      const data = JSON.parse(tersimpan);
      if (data === null || typeof data !== "object" || typeof data.email !== "string") {
        throw new Error("Bentuk data newsletter tidak sesuai.");
      }

      inputEmail.value = data.email;
      aturStatus("Email newsletter tersimpan dimuat kembali.", "");
    } catch (error) {
      console.warn("Data newsletter tidak valid.", error);
      aturStatus("Data tersimpan tidak valid dan diabaikan. Silakan simpan ulang.", "error");
      try {
        localStorage.removeItem(KUNCI_NEWSLETTER);
      } catch (errorHapus) {
        console.warn("Data rusak tidak bisa dihapus.", errorHapus);
      }
    }
  }

  inputEmail.addEventListener("input", () => {
    if (inputEmail.getAttribute("aria-invalid") === "true") {
      periksaEmail();
    }
  });

  formNewsletter.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!periksaEmail()) {
      aturStatus("Email belum disimpan: periksa isian email.", "error");
      inputEmail.focus(); // focus management
      return;
    }

    if (simpanNewsletter()) {
      aturStatus("Email newsletter berhasil disimpan di browser ini.", "success");
    } else {
      aturStatus("Email gagal disimpan. Penyimpanan browser mungkin diblokir.", "error");
    }
  });

  tombolHapus.addEventListener("click", () => {
    try {
      localStorage.removeItem(KUNCI_NEWSLETTER);
    } catch (error) {
      console.warn("Email newsletter tidak bisa dihapus.", error);
      aturStatus("Email tidak bisa dihapus. Penyimpanan browser mungkin diblokir.", "error");
      return;
    }

    inputEmail.value = "";
    tampilkanErrorEmail("");
    aturStatus("Email newsletter dihapus dari browser ini.", "success");
  });

  // Menjalankan program
  muatNewsletter();
})();