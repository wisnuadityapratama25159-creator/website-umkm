// P12-02: validasi form kontak (HTML constraint + Constraint Validation API),
// pesan error aksesibel (aria-describedby + aria-live), focus management,
// dan preferensi kontak di localStorage (JSON.stringify / JSON.parse + try...catch).
// Kode dibungkus function agar nama variabelnya tidak bentrok dengan file JS lain
// di halaman yang sama (newsletter.js, app.js) karena file .js klasik berbagi lingkup global.
(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. DOM SELECTION
  // ---------------------------------------------------------------------
  const form = document.querySelector("#form-kontak");
  const preview = document.querySelector("#preview-form");
  const formFeedback = document.querySelector("#form-feedback");

  // Halaman lain tidak punya form ini: berhenti diam-diam tanpa error.
  if (!form || !preview || !formFeedback) {
    return;
  }

  const ID_FIELD = ["nama", "email", "telepon", "paket", "pesan", "setuju"];
  const fields = ID_FIELD.map((id) => document.querySelector(`#${id}`));
  const topikInputs = document.querySelectorAll('input[name="topik"]');
  const kotakChannel = document.querySelectorAll("#panel-preferensi [data-channel]");
  const preferensiStatus = document.querySelector("#preferensi-status");
  const tombolSimpan = document.querySelector("#simpan-preferensi");
  const tombolHapus = document.querySelector("#hapus-preferensi");

  // Bukti PW1-P12-E04: elemen field harus ditemukan (bukan null) di Console.
  console.log("[P12] fields:", fields);

  if (fields.includes(null) || topikInputs.length === 0) {
    console.warn("Elemen form kontak belum lengkap. Periksa id di kontak.html.");
    return;
  }

  const TEKS_PREVIEW_AWAL = "Data form akan muncul setelah tombol dikirim.";
  const STORAGE_KEY = "kopi-nusa-preferensi-kontak";
  const PAKET_VALID = ["rumahan", "kantor", "tester"];
  const TOPIK_VALID = ["produk", "pesanan", "kerja-sama"];
  const CHANNEL_VALID = ["email", "whatsapp"];

  // Urutan validasi = urutan tampil di halaman. Radio "topik" diwakili radio pertama
  // dan berada di antara "paket" dan "pesan".
  const urutanValidasi = [...fields.slice(0, 4), topikInputs[0], ...fields.slice(4)];

  // ---------------------------------------------------------------------
  // 2. VALIDASI FIELD
  // ---------------------------------------------------------------------

  // INPUT : elemen target event
  // OUTPUT: field yang divalidasi (untuk radio: radio pertama), atau null jika bukan field validasi
  function pilihField(target) {
    if (target.name === "topik") {
      return topikInputs[0];
    }
    return fields.includes(target) ? target : null;
  }

  function ambilLabel(field) {
    if (field.name === "topik") {
      return "Topik pertanyaan";
    }
    const label = form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.trim() : field.name;
  }

  function ambilIdError(field) {
    return field.name === "topik" ? "topik-error" : `${field.id}-error`;
  }

  // INPUT : field
  // PROSES: membaca field.validity untuk mengetahui constraint mana yang dilanggar
  // OUTPUT: string pesan error (kosong jika valid)
  function getFieldError(field) {
    const validity = field.validity;
    const label = ambilLabel(field);

    if (validity.valid) {
      return "";
    }
    if (validity.valueMissing) {
      if (field.name === "topik") {
        return "Pilih salah satu topik pertanyaan.";
      }
      if (field.type === "checkbox") {
        return "Centang persetujuan ini sebelum mengirim form.";
      }
      return `${label} wajib diisi.`;
    }
    if (validity.typeMismatch) {
      return "Format email belum benar. Contoh: nama@contoh.com.";
    }
    if (validity.tooShort) {
      return `${label} minimal ${field.minLength} karakter (sekarang ${field.value.length}).`;
    }
    if (validity.tooLong) {
      return `${label} maksimal ${field.maxLength} karakter (sekarang ${field.value.length}).`;
    }
    if (validity.patternMismatch) {
      return field.title || `Format ${label} belum sesuai.`;
    }
    return `${label} belum valid.`;
  }

  // INPUT : field, pesan (string; kosong = tidak ada error)
  // PROSES: setCustomValidity(pesan), atur aria-invalid, isi teks error dengan textContent
  // OUTPUT: tidak ada
  function tampilkanError(field, pesan) {
    const error = document.getElementById(ambilIdError(field));
    const kelompok = field.name === "topik" ? topikInputs : [field];

    field.setCustomValidity(pesan);
    kelompok.forEach((item) => {
      item.setAttribute("aria-invalid", pesan ? "true" : "false");
    });

    if (error) {
      error.textContent = pesan;
    }
  }

  // INPUT : field
  // PROSES: setCustomValidity("") dulu supaya pesan lama tidak membuat field terus invalid,
  //         lalu hitung pesan baru dari validity
  // OUTPUT: true jika field valid
  function validasiField(field) {
    field.setCustomValidity("");
    const pesan = getFieldError(field);
    tampilkanError(field, pesan);
    return pesan === "";
  }

  // PROSES: SEMUA field diperiksa (tidak berhenti di error pertama) agar semua pesan tampil sekaligus
  // OUTPUT: array field yang tidak valid, urutannya sesuai halaman
  function validasiSemuaField() {
    return urutanValidasi.filter((field) => !validasiField(field));
  }

  function aturFeedback(teks, jenis) {
    formFeedback.textContent = teks;
    formFeedback.className = jenis ? `form-feedback ${jenis}` : "form-feedback";
  }

  // ---------------------------------------------------------------------
  // 3. PREVIEW
  // ---------------------------------------------------------------------

  // Dipanggil hanya jika semua field valid.
  function tampilkanPreview() {
    const data = new FormData(form);

    preview.textContent = [
      `Nama: ${data.get("nama")}`,
      `Email: ${data.get("email")}`,
      `Nomor telepon: ${data.get("telepon") || "-"}`,
      `Paket: ${data.get("paket")}`,
      `Topik: ${data.get("topik")}`,
      `Pesan: ${data.get("pesan")}`,
    ].join("\n");

    aturFeedback("Form valid. Preview berhasil dibuat.", "success");
  }

  // ---------------------------------------------------------------------
  // 4. PREFERENSI (localStorage + JSON)
  // ---------------------------------------------------------------------

  function aturStatusPreferensi(teks, jenis) {
    if (!preferensiStatus) {
      return;
    }
    preferensiStatus.textContent = teks;
    preferensiStatus.className = jenis ? `form-feedback ${jenis}` : "form-feedback";
  }

  // PROSES: object dibuat dari form + panel, diubah ke string dengan JSON.stringify,
  //         lalu disimpan. setItem bisa gagal (storage penuh/diblokir), jadi memakai try...catch.
  function simpanPreferensi() {
    const data = new FormData(form);
    const preferensi = {
      paket: data.get("paket") ?? "",
      topik: data.get("topik") ?? "",
      channel: Array.from(kotakChannel)
        .filter((kotak) => kotak.checked)
        .map((kotak) => kotak.value),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferensi));
      aturStatusPreferensi("Preferensi berhasil disimpan di browser ini.", "success");
    } catch (error) {
      console.warn("Preferensi tidak bisa disimpan.", error);
      aturStatusPreferensi("Preferensi gagal disimpan. Penyimpanan browser mungkin diblokir.", "error");
    }
  }

  // PROSES: getItem -> JSON.parse di dalam try...catch -> isi form.
  //         Jika JSON rusak, data dibuang dengan removeItem dan halaman tetap berjalan.
  function muatPreferensi() {
    try {
      const tersimpan = localStorage.getItem(STORAGE_KEY);
      if (!tersimpan) {
        aturStatusPreferensi("Belum ada preferensi tersimpan.", "");
        return;
      }

      const preferensi = JSON.parse(tersimpan);
      if (preferensi === null || typeof preferensi !== "object" || Array.isArray(preferensi)) {
        throw new Error("Bentuk data preferensi tidak sesuai.");
      }

      document.querySelector("#paket").value = PAKET_VALID.includes(preferensi.paket)
        ? preferensi.paket
        : "";

      topikInputs.forEach((input) => {
        input.checked = TOPIK_VALID.includes(preferensi.topik) && input.value === preferensi.topik;
      });

      const channel = Array.isArray(preferensi.channel) ? preferensi.channel : [];
      kotakChannel.forEach((kotak) => {
        kotak.checked = CHANNEL_VALID.includes(kotak.value) && channel.includes(kotak.value);
      });

      aturStatusPreferensi("Preferensi tersimpan dimuat kembali.", "");
    } catch (error) {
      console.warn("Preferensi tidak valid.", error);
      aturStatusPreferensi("Data tersimpan tidak valid dan diabaikan. Silakan simpan ulang.", "error");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (errorHapus) {
        console.warn("Data rusak tidak bisa dihapus.", errorHapus);
      }
    }
  }

  function hapusPreferensi() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Preferensi tidak bisa dihapus.", error);
      aturStatusPreferensi("Preferensi tidak bisa dihapus. Penyimpanan browser mungkin diblokir.", "error");
      return;
    }

    // Kosongkan isian yang tadinya dimuat dari preferensi, dan bersihkan errornya.
    const paket = document.querySelector("#paket");
    paket.value = "";
    topikInputs.forEach((input) => {
      input.checked = false;
    });
    kotakChannel.forEach((kotak) => {
      kotak.checked = false;
    });
    tampilkanError(paket, "");
    tampilkanError(topikInputs[0], "");

    aturStatusPreferensi("Preferensi dihapus dari browser ini.", "success");
  }

  // ---------------------------------------------------------------------
  // 5. EVENT
  // ---------------------------------------------------------------------

  // Validasi saat pengguna selesai mengisi satu field (hanya jika sudah terisi,
  // supaya pengguna yang hanya menekan Tab tidak langsung dimarahi).
  form.addEventListener("focusout", (event) => {
    const field = pilihField(event.target);
    const adaIsi = event.target.type === "checkbox" ? event.target.checked : event.target.value !== "";
    if (field !== null && event.target.type !== "radio" && adaIsi) {
      validasiField(field);
    }
  });

  // Jika field sedang menampilkan error, perbarui pesan saat pengguna mengubahnya.
  // Fokus TIDAK dipindahkan di sini karena akan mengganggu pengguna yang sedang mengetik.
  form.addEventListener("input", (event) => {
    const field = pilihField(event.target);
    if (field !== null && field.getAttribute("aria-invalid") === "true") {
      validasiField(field);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fieldInvalid = validasiSemuaField();

    if (fieldInvalid.length > 0 || !form.checkValidity()) {
      aturFeedback(
        `Periksa kembali bagian yang ditandai (${fieldInvalid.length} isian perlu diperbaiki).`,
        "error"
      );
      preview.textContent = TEKS_PREVIEW_AWAL;
      form.reportValidity();

      // Selector dibatasi ke kontrol form: fieldset juga cocok dengan :invalid tetapi tidak bisa difokuskan.
      const pertamaInvalid =
        form.querySelector("input:invalid, select:invalid, textarea:invalid") ?? fieldInvalid[0];
      if (pertamaInvalid) {
        pertamaInvalid.focus(); // focus management: pindah ke field invalid pertama
      }
      return;
    }

    tampilkanPreview();
  });

  if (tombolSimpan) {
    tombolSimpan.addEventListener("click", simpanPreferensi);
  }
  if (tombolHapus) {
    tombolHapus.addEventListener("click", hapusPreferensi);
  }

  // ---------------------------------------------------------------------
  // 6. MENJALANKAN PROGRAM
  // ---------------------------------------------------------------------
  muatPreferensi();
})();