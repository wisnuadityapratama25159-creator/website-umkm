"use strict";

console.log("P10 JavaScript aktif");

// =====================================================================
// P10: FUNCTION, LOOP, ARRAY METHODS, DAN DEBUGGING
// Pengembangan dari P09. Data produk, nama elemen HTML (id), dan kelas CSS
// TIDAK diubah, hanya kode JavaScript-nya yang dirapikan menjadi function kecil.
//
// Susunan file:
//   1. Data & konstanta   (GLOBAL, dibuat sekali, dipakai banyak function)
//   2. Function pengolah data   (input -> proses -> output, tanpa menyentuh HTML)
//   3. Function pembuat HTML    (mengubah data menjadi teks HTML)
//   4. Function render ke DOM   (menempelkan HTML ke halaman)
//   5. Function debugging       (console.log / console.table)
//   6. Menjalankan program
//
// CATATAN SCOPE: file .js klasik berbagi satu lingkup global dengan file .js lain
// di halaman yang sama (form.js memakai nama "form" dan "preview", script.js memakai
// "promoButton"). Karena itu nama-nama tersebut TIDAK dipakai di file ini, dan semua
// variabel selain data/konstanta di bagian 1 dibuat LOKAL di dalam function.
// =====================================================================


// ---------------------------------------------------------------------
// 1. DATA & KONSTANTA (GLOBAL, memakai const karena tidak diganti isinya)
// CATATAN: nilai "stok" hanya DATA DUMMY untuk praktikum,
// BUKAN stok asli Warkop Mas Hamzah.
// ---------------------------------------------------------------------

// Sumber data untuk bagian "Produk Pilihan" (katalog + ringkasan)
const daftarProduk = [
  {
    nama: "Kopi Susu Vanila",
    harga: 21000,
    stok: 8, // dummy
    kategori: "Minuman",
    deskripsi: "Kopi susu dengan rasa vanila yang lembut.",
    label: "Terlaris",
    aktif: true,
    unggulan: true,
  },
  {
    nama: "Americano",
    harga: 22000,
    stok: 4, // dummy
    kategori: "Minuman",
    deskripsi: "Kopi hitam dengan rasa yang kuat dan sederhana.",
    label: "Segar",
    aktif: true,
    unggulan: false,
  },
  {
    nama: "Mie Goreng Aceh Telur Ceplok",
    harga: 20000,
    stok: 0, // dummy
    kategori: "Makanan",
    deskripsi: "Mie goreng dengan bumbu khas Aceh dan telur ceplok.",
    label: "Hemat",
    aktif: true,
    unggulan: false,
  },
];

// Sumber data untuk bagian "Menu Hari Ini" (P09-02).
// P10: ditambah properti "unggulan" supaya find() bisa dipakai pada data ini juga.
const produkUmkm = [
  { nama: "Kopi Susu Vanila", kategori: "minuman", harga: 21000, stok: 8, unggulan: true }, // Tersedia
  { nama: "Americano", kategori: "minuman", harga: 22000, stok: 4, unggulan: false }, // Stok terbatas
  { nama: "Mie Goreng Aceh Telur Ceplok", kategori: "makanan", harga: 20000, stok: 0, unggulan: false }, // Habis
];

// Batas stok terbatas (stok 1 sampai dengan 5 = "Stok terbatas"). Satu-satunya tempat
// angka 5 ditulis, supaya kalau batas berubah cukup ubah di sini.
const BATAS_STOK_TERBATAS = 5;

// true = tampilkan pemeriksaan di Console (hanya di halaman Produk). Ubah ke false untuk mematikannya.
const MODE_DEBUG = true;

// Objek pemformat angka -> rupiah. Dibuat sekali di sini (bukan di dalam function)
// supaya tidak dibuat ulang setiap function dipanggil.
const PEMFORMAT_RUPIAH = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});


// ---------------------------------------------------------------------
// 2. FUNCTION PENGOLAH DATA
// Setiap function punya kontrak yang jelas: INPUT (parameter), PROSES, OUTPUT (return).
// Function di bagian ini TIDAK menyentuh HTML, jadi mudah diuji di Console.
// ---------------------------------------------------------------------

// INPUT : nilai (number)  -> contoh 21000
// PROSES: diformat Intl.NumberFormat, lalu spasi dibuang agar sama dengan tabel harga
// OUTPUT: string          -> "Rp21.000" (atau teks pengganti jika bukan angka)
function formatRupiah(nilai) {
  if (typeof nilai !== "number" || Number.isNaN(nilai)) {
    return "Harga belum tersedia";
  }
  return PEMFORMAT_RUPIAH.format(nilai).replace(/\s/g, "");
}

// INPUT : stok (number)   -> contoh 4
// PROSES: if / else if / else. URUTAN PENTING: data tidak valid dicek lebih dulu,
//         lalu 0, lalu batas terbatas, sisanya tersedia.
// OUTPUT: object { teks, kelas } -> { teks: "Stok terbatas", kelas: "terbatas" }
function statusStok(stok) {
  if (typeof stok !== "number" || Number.isNaN(stok) || stok < 0) {
    // kelas "habis" dipakai agar tampil merah memakai CSS yang sudah ada
    return { teks: "Stok tidak valid", kelas: "habis" };
  } else if (stok === 0) {
    return { teks: "Habis", kelas: "habis" };
  } else if (stok <= BATAS_STOK_TERBATAS) {
    return { teks: "Stok terbatas", kelas: "terbatas" };
  } else {
    return { teks: "Tersedia", kelas: "tersedia" };
  }
}

// INPUT : status (object hasil statusStok)
// OUTPUT: string nama kelas CSS untuk badge ("stock-badge", "... warning", "... empty")
function kelasBadgeStok(status) {
  if (status.kelas === "habis") {
    return "stock-badge empty";
  } else if (status.kelas === "terbatas") {
    return "stock-badge warning";
  }
  return "stock-badge";
}

// INPUT : kategori (string) -> "minuman" / "makanan"
// PROSES: switch
// OUTPUT: string label kategori
function labelKategori(kategori) {
  switch (kategori) {
    case "minuman":
      return "Minuman";
    case "makanan":
      return "Makanan";
    default:
      return "Lainnya";
  }
}

// INPUT : stok (number)
// PROSES: ternary
// OUTPUT: string label tombol
function labelAksi(stok) {
  return stok > 0 ? "Siap dipesan" : "Hubungi admin";
}

// INPUT : daftar (array of object produk)
// PROSES: for...of -- membaca produk satu per satu dan menjumlahkan stoknya
// OUTPUT: number total stok
function hitungTotalStok(daftar) {
  let total = 0; // LOKAL: hanya hidup selama function ini berjalan
  for (const produk of daftar) {
    total += produk.stok;
  }
  return total;
}

// INPUT : daftar (array of object produk)
// PROSES: filter() -- ambil produk yang stoknya lebih dari 0
// OUTPUT: array baru berisi produk yang tersedia (array asli tidak berubah)
function ambilProdukTersedia(daftar) {
  return daftar.filter((produk) => produk.stok > 0);
}

// INPUT : daftar (array of object produk)
// PROSES: find() -- mengambil SATU produk pertama yang unggulan === true
// OUTPUT: object produk, atau null jika tidak ada (find() aslinya mengembalikan
//         undefined; diubah ke null agar pemanggil cukup memeriksa === null)
function cariProdukUnggulan(daftar) {
  const hasil = daftar.find((produk) => produk.unggulan === true);
  return hasil ?? null;
}

// Definisi ringkasan (sama dengan P09):
// - total    : semua object di array
// - aktif    : produk dengan aktif === true
// - tersedia : produk aktif DAN stok lebih dari 0
// - habis    : produk aktif DAN stok sama dengan 0
// INPUT : daftar (array of object produk)
// OUTPUT: object { total, aktif, tersedia, habis, totalStok }
function hitungRingkasan(daftar) {
  const produkAktif = daftar.filter((produk) => produk.aktif);
  const aktifTersedia = ambilProdukTersedia(produkAktif);
  const aktifHabis = produkAktif.filter((produk) => produk.stok === 0);

  return {
    total: daftar.length,
    aktif: produkAktif.length,
    tersedia: aktifTersedia.length,
    habis: aktifHabis.length,
    totalStok: hitungTotalStok(daftar),
  };
}

// INPUT : produk (object produk unggulan, atau null jika find() tidak menemukan apa-apa)
// PROSES: memeriksa null SEBELUM membaca properti .nama (kalau tidak, terjadi TypeError)
// OUTPUT: string kalimat untuk #produk-unggulan
function buatTeksUnggulan(produk) {
  if (produk === null) {
    return "Belum ada produk unggulan.";
  }
  return `Produk unggulan: ${produk.nama}`;
}


// ---------------------------------------------------------------------
// 3. FUNCTION PEMBUAT HTML
// Hanya mengubah SATU produk menjadi teks HTML. Tidak menyentuh halaman.
// Nama kelas CSS mengikuti desain P09 (product-card, product-badge, price, dst.).
// ---------------------------------------------------------------------

// INPUT : produk (object dari daftarProduk)
// OUTPUT: string HTML satu kartu katalog
function buatKartuProduk(produk) {
  const status = statusStok(produk.stok);
  const label = produk.label ?? "Menu"; // ?? : pakai "Menu" jika label kosong
  const deskripsi = produk.deskripsi ?? "Deskripsi belum tersedia.";
  const badgeUnggulan = produk.unggulan ? " &#9733;" : "";

  return `
    <article class="product-card">
      <span class="product-badge">${label}${badgeUnggulan}</span>
      <h3>${produk.nama}</h3>
      <p class="product-category">${produk.kategori}</p>
      <p>${deskripsi}</p>
      <p class="price">${formatRupiah(produk.harga)}</p>
      <p class="stock-status stock-status--${status.kelas}">
        ${status.teks} (stok: ${produk.stok})
      </p>
      <div class="card-actions">
        <a class="button" href="kontak.html">Tanya produk</a>
        <a href="#harga-title">Lihat tabel harga</a>
      </div>
    </article>
  `;
}

// INPUT : item (object dari produkUmkm)
// OUTPUT: string HTML satu kartu "Menu Hari Ini"
function buatKartuMenu(item) {
  const status = statusStok(item.stok);

  return `
    <article class="product-card js-product-card">
      <span class="product-badge">${labelKategori(item.kategori)}</span>
      <h3>${item.nama}</h3>
      <p class="price">${formatRupiah(item.harga)}</p>
      <p><span class="${kelasBadgeStok(status)}">${status.teks}</span> (stok: ${item.stok})</p>
      <div class="card-actions">
        <a class="button" href="kontak.html">${labelAksi(item.stok)}</a>
      </div>
    </article>
  `;
}


// ---------------------------------------------------------------------
// 4. FUNCTION RENDER KE DOM
// Satu-satunya bagian yang mengubah halaman. Datanya dikirim lewat parameter
// (bukan dibaca langsung dari variabel global), jadi function bisa dipakai ulang.
// ---------------------------------------------------------------------

// INPUT : daftar (array of object produk)
// PROSES: filter() ambil produk aktif -> map() ubah tiap produk jadi HTML -> join("") gabung
// OUTPUT: tidak ada (void); hasilnya tampil di #katalog-produk
function renderKatalog(daftar) {
  const katalog = document.querySelector("#katalog-produk");

  // Jika elemen tidak ada (bukan halaman Produk), hentikan tanpa error.
  if (katalog === null) {
    return;
  }

  const html = daftar
    .filter((produk) => produk.aktif) // produk nonaktif tidak ditampilkan
    .map((produk) => buatKartuProduk(produk))
    .join("");

  katalog.innerHTML = html || "<p>Belum ada produk untuk ditampilkan.</p>";
}

// INPUT : daftar (array of object produk)
// OUTPUT: tidak ada; angka ringkasan tampil di #ringkasan-*
function renderRingkasan(daftar) {
  const elemenTotal = document.querySelector("#ringkasan-total");
  const elemenAktif = document.querySelector("#ringkasan-aktif");
  const elemenTersedia = document.querySelector("#ringkasan-tersedia");
  const elemenHabis = document.querySelector("#ringkasan-habis");

  if (!elemenTotal || !elemenAktif || !elemenTersedia || !elemenHabis) {
    return;
  }

  const ringkasan = hitungRingkasan(daftar);

  elemenTotal.textContent = ringkasan.total;
  elemenAktif.textContent = ringkasan.aktif;
  elemenTersedia.textContent = ringkasan.tersedia;
  elemenHabis.textContent = ringkasan.habis;
}

// INPUT : daftar (array of object produk "Menu Hari Ini")
// PROSES: filter() -> jumlah produk tersedia, find() -> satu produk unggulan,
//         map() + join("") -> HTML semua kartu menu
// OUTPUT: tidak ada; kartu tampil di #produk-dinamis, ringkasan di #produk-ringkasan,
//         produk unggulan di #produk-unggulan
function renderProduk(daftar) {
  const grid = document.querySelector("#produk-dinamis");
  const ringkasan = document.querySelector("#produk-ringkasan");
  const unggulan = document.querySelector("#produk-unggulan");

  // app.js dimuat di semua halaman. Jika SEMUA target tidak ada, ini bukan halaman Produk:
  // berhenti diam-diam. Jika hanya sebagian yang ada, itu kesalahan HTML: beri peringatan.
  if (!grid && !ringkasan && !unggulan) {
    return;
  }
  if (!grid || !ringkasan || !unggulan) {
    console.warn("Target render produk belum lengkap.");
    return;
  }

  const produkTersedia = daftar.filter((item) => item.stok > 0);
  const produkUnggulan = daftar.find((item) => item.unggulan === true) ?? null;

  grid.innerHTML = daftar.map((item) => buatKartuMenu(item)).join("");
  ringkasan.textContent = `${produkTersedia.length} produk tersedia dari ${daftar.length} data.`;
  unggulan.textContent = buatTeksUnggulan(produkUnggulan);
}


// ---------------------------------------------------------------------
// 5. FUNCTION DEBUGGING
// Setiap console.log diberi tujuan (apa yang diperiksa) agar bisa dibaca di Console.
// ---------------------------------------------------------------------

function tampilkanDebug() {
  const ringkasan = hitungRingkasan(daftarProduk);
  const unggulan = cariProdukUnggulan(daftarProduk);

  // Tujuan: memastikan data terbaca dan jumlahnya benar.
  console.log("[DEBUG] Jumlah produk:", daftarProduk.length);
  // Tujuan: memeriksa angka ringkasan sebelum dibandingkan dengan tampilan halaman.
  console.log("[DEBUG] Ringkasan:", ringkasan);
  // Tujuan: memastikan find() mengembalikan produk (atau null) dan bukan error.
  console.log("[DEBUG] Produk unggulan:", unggulan !== null ? unggulan.nama : "(tidak ada)");

  // Tujuan: melihat isi semua object dalam bentuk tabel (cocok untuk array of object).
  console.table(daftarProduk);
  console.table(produkUmkm);

  // Tujuan: memeriksa status stok setiap produk, satu per satu, memakai forEach().
  daftarProduk.forEach((produk, nomor) => {
    const status = statusStok(produk.stok);
    console.log(`[DEBUG] ${nomor + 1}. ${produk.nama} | stok ${produk.stok} -> ${status.teks}`);
  });
}

// Uji cepat: membandingkan hasil function dengan hasil yang diharapkan.
// Kolom "lulus" bernilai false jika ada function yang hasilnya tidak sesuai.
function jalankanUjiCepat() {
  const kasus = [
    { uji: "statusStok(0)", hasil: statusStok(0).teks, harapan: "Habis" },
    { uji: "statusStok(4)", hasil: statusStok(4).teks, harapan: "Stok terbatas" },
    { uji: "statusStok(5)", hasil: statusStok(5).teks, harapan: "Stok terbatas" },
    { uji: "statusStok(6)", hasil: statusStok(6).teks, harapan: "Tersedia" },
    { uji: "statusStok(-1)", hasil: statusStok(-1).teks, harapan: "Stok tidak valid" },
    { uji: 'statusStok("8")', hasil: statusStok("8").teks, harapan: "Stok tidak valid" },
    { uji: "formatRupiah(21000)", hasil: formatRupiah(21000), harapan: "Rp21.000" },
    { uji: 'formatRupiah("abc")', hasil: formatRupiah("abc"), harapan: "Harga belum tersedia" },
    { uji: "cariProdukUnggulan([])", hasil: String(cariProdukUnggulan([])), harapan: "null" },
    { uji: "buatTeksUnggulan(null)", hasil: buatTeksUnggulan(null), harapan: "Belum ada produk unggulan." },
    { uji: "buatTeksUnggulan(produk)", hasil: buatTeksUnggulan({ nama: "Americano" }), harapan: "Produk unggulan: Americano" },
  ];

  const tabel = kasus.map((k) => ({
    uji: k.uji,
    hasil: k.hasil,
    harapan: k.harapan,
    lulus: k.hasil === k.harapan,
  }));

  console.log("[UJI] Membandingkan hasil function dengan hasil yang diharapkan:");
  console.table(tabel);
}


// ---------------------------------------------------------------------
// 6. MENJALANKAN PROGRAM
// Dipanggil setelah DOM siap. Argumen (daftarProduk / produkUmkm) dikirim ke parameter "daftar".
// ---------------------------------------------------------------------
function jalankanProgram() {
  renderKatalog(daftarProduk);
  renderRingkasan(daftarProduk);
  renderProduk(produkUmkm);

  // Pemeriksaan Console hanya di halaman Produk agar halaman lain tetap bersih.
  if (MODE_DEBUG && document.querySelector("#katalog-produk") !== null) {
    tampilkanDebug();
    jalankanUjiCepat();
  }
}

document.addEventListener("DOMContentLoaded", jalankanProgram);