"use strict";

console.log("P11 JavaScript aktif");

// =====================================================================
// P10: FUNCTION, LOOP, ARRAY METHODS, DAN DEBUGGING
// P11: DOM, EVENTS, DAN RENDERING (filter kategori katalog, lihat bagian bertanda "P11").
// Pengembangan dari P09. Data produk TIDAK diubah. Pada P11, id katalog diseragamkan dengan
// worksheet (#katalog-produk -> #produk-grid, #katalog-status -> #produk-status).
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

// P11
// INPUT : daftar (array of object produk), kategori (string) -> "Semua" / "Minuman" / "Makanan" / ...
// PROSES: "Semua" mengembalikan seluruh daftar; selain itu filter() berdasarkan produk.kategori
// OUTPUT: array baru berisi produk yang cocok (array asli tidak berubah)
function filterProdukByKategori(daftar, kategori) {
  if (kategori === "Semua") {
    return daftar;
  }
  return daftar.filter((produk) => produk.kategori === kategori);
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

// P11: function pembuat elemen DOM kecil, dipakai berulang oleh buatElemenProduk().
// INPUT : tag (string), teks (string), kelas (string, boleh kosong)
// OUTPUT: elemen HTML baru; isinya diisi memakai textContent (bukan innerHTML)
function buatElemen(tag, teks, kelas) {
  const elemen = document.createElement(tag);
  elemen.textContent = teks;
  if (kelas) {
    elemen.className = kelas;
  }
  return elemen;
}

// INPUT : produk (object dari daftarProduk)
// PROSES: P11 -- kartu dibuat dengan createElement + textContent + classList + append
//         (sebelumnya P10 memakai string HTML dan innerHTML). Function ini HANYA membuat
//         elemen; memasukkannya ke halaman dilakukan renderKatalog().
//         Tombol "Sembunyikan" memakai remove(): kartu hilang dari tampilan saja,
//         datanya di array daftarProduk TIDAK dihapus.
// OUTPUT: elemen <article class="product-card"> yang siap di-append ke container
function buatElemenProduk(produk) {
  const status = statusStok(produk.stok);
  const label = produk.label ?? "Menu"; // ?? : pakai "Menu" jika label kosong
  const deskripsi = produk.deskripsi ?? "Deskripsi belum tersedia.";
  const badgeUnggulan = produk.unggulan ? " \u2605" : ""; // \u2605 = bintang (sama dengan &#9733; di P10)

  const kartu = document.createElement("article");
  kartu.classList.add("product-card");

  const tombolTanya = buatElemen("a", "Tanya produk", "button");
  tombolTanya.href = "kontak.html";

  const tautanHarga = buatElemen("a", "Lihat tabel harga");
  tautanHarga.href = "#harga-title";

  const tombolSembunyikan = buatElemen("button", "Sembunyikan", "ghost-button");
  tombolSembunyikan.type = "button";
  tombolSembunyikan.setAttribute("aria-label", `Sembunyikan ${produk.nama} dari tampilan`);
  tombolSembunyikan.addEventListener("click", () => {
    const wadah = kartu.parentElement;
    kartu.remove(); // hanya menghapus elemen dari DOM, bukan data produk

    const statusProduk = document.querySelector("#produk-status");
    if (statusProduk !== null) {
      statusProduk.textContent =
        wadah !== null && wadah.children.length === 0
          ? "Semua kartu disembunyikan. Klik tombol filter untuk menampilkannya lagi."
          : "Satu kartu disembunyikan dari tampilan sementara.";
    }
  });

  const aksi = document.createElement("div");
  aksi.classList.add("card-actions");
  aksi.append(tombolTanya, tautanHarga, tombolSembunyikan);

  kartu.append(
    buatElemen("span", `${label}${badgeUnggulan}`, "product-badge"),
    buatElemen("h3", produk.nama),
    buatElemen("p", produk.kategori, "product-category"),
    buatElemen("p", deskripsi),
    buatElemen("p", formatRupiah(produk.harga), "price"),
    buatElemen("p", `${status.teks} (stok: ${produk.stok})`, `stock-status stock-status--${status.kelas}`),
    aksi
  );

  return kartu;
}

// P11: empty state, dibuat saat hasil filter kosong.
// INPUT : kategori (string)
// OUTPUT: elemen <p class="empty-state">
function buatEmptyState(kategori) {
  return buatElemen("p", `Belum ada produk pada kategori ${kategori}.`, "empty-state");
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

// P11
// OUTPUT: object { produkGrid, produkStatus, tombolFilter } -- semua target DOM katalog.
//         querySelector -> satu elemen (atau null jika tidak ada); querySelectorAll -> NodeList
//         (kosong jika tidak ada). Dibuat function supaya variabelnya tetap LOKAL (lihat catatan
//         scope di atas) dan bisa dipakai render, event, dan debug.
function ambilTargetKatalog() {
  return {
    produkGrid: document.querySelector("#produk-grid"),
    produkStatus: document.querySelector("#produk-status"),
    tombolFilter: document.querySelectorAll("[data-filter]"),
  };
}

// INPUT : daftar (array of object produk), kategoriAktif (string, bawaan "Semua")
// PROSES: P11 -- guard target -> filter() produk aktif -> filter() kategori -> replaceChildren()
//         kosongkan container -> append kartu (atau empty state) -> textContent update status
// OUTPUT: tidak ada (void); hasilnya tampil di #produk-grid dan #produk-status
function renderKatalog(daftar, kategoriAktif = "Semua") {
  const { produkGrid, produkStatus } = ambilTargetKatalog();

  // app.js dimuat di semua halaman. Jika kedua target tidak ada, ini bukan halaman Produk:
  // berhenti diam-diam. Jika hanya salah satu yang hilang, itu kesalahan HTML: beri peringatan.
  if (!produkGrid && !produkStatus) {
    return;
  }
  if (!produkGrid || !produkStatus) {
    console.warn("Target render produk tidak ditemukan.");
    return;
  }

  const produkAktif = daftar.filter((produk) => produk.aktif); // produk nonaktif tidak ditampilkan
  const produkTampil = filterProdukByKategori(produkAktif, kategoriAktif);

  if (MODE_DEBUG) {
    console.log("[RENDER] kategori:", kategoriAktif, "| produk tampil:", produkTampil.length);
  }

  // Kosongkan container dulu supaya kartu lama (dan empty state lama) hilang.
  produkGrid.replaceChildren();

  if (produkTampil.length === 0) {
    produkGrid.append(buatEmptyState(kategoriAktif));
    produkStatus.textContent =
      kategoriAktif === "Semua" ? "0 produk ditampilkan." : `0 produk ditampilkan pada kategori ${kategoriAktif}.`;
    return;
  }

  produkTampil.forEach((produk) => {
    produkGrid.append(buatElemenProduk(produk));
  });

  produkStatus.textContent =
    kategoriAktif === "Semua"
      ? `${produkTampil.length} produk ditampilkan.`
      : `${produkTampil.length} produk ditampilkan pada kategori ${kategoriAktif}.`;
}

// P11
// INPUT : semuaTombol (NodeList tombol filter), tombolDipilih (elemen tombol yang diklik)
// PROSES: classList.remove("is-active") dari SEMUA tombol, lalu classList.add pada yang dipilih
//         (jadi selalu hanya satu tombol aktif). aria-pressed ikut diperbarui untuk pembaca layar.
// OUTPUT: tidak ada
function aturTombolAktif(semuaTombol, tombolDipilih) {
  semuaTombol.forEach((tombol) => {
    tombol.classList.remove("is-active");
    tombol.setAttribute("aria-pressed", "false");
  });
  tombolDipilih.classList.add("is-active");
  tombolDipilih.setAttribute("aria-pressed", "true");
}

// P11
// INPUT : daftar (array of object produk)
// PROSES: ambil semua tombol [data-filter], lalu pasang SATU listener "click" per tombol.
//         Dipanggil sekali saja (dari jalankanProgram), jadi listener tidak menumpuk.
//         event.currentTarget = tombol yang MEMEGANG listener (selalu tombol, walau yang
//         diklik elemen di dalamnya); event.target = elemen yang benar-benar diklik.
//         Kategori dibaca dari dataset.filter (atribut data-filter), bukan dari teks tombol.
// OUTPUT: tidak ada
function pasangFilterKatalog(daftar) {
  const { tombolFilter } = ambilTargetKatalog();

  // Halaman lain (tanpa tombol filter) berhenti di sini tanpa error.
  if (tombolFilter.length === 0) {
    return;
  }

  tombolFilter.forEach((tombol) => {
    tombol.addEventListener("click", (event) => {
      const tombolAktif = event.currentTarget;
      const kategori = tombolAktif.dataset.filter;

      aturTombolAktif(tombolFilter, tombolAktif);
      renderKatalog(daftar, kategori);
    });
  });
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

  // P11 -- Tujuan: memastikan target DOM katalog ditemukan (bukan null) dan jumlah tombol filter benar.
  const target = ambilTargetKatalog();
  console.log("[DEBUG] #produk-grid ditemukan:", target.produkGrid !== null);
  console.log("[DEBUG] #produk-status ditemukan:", target.produkStatus !== null);
  console.log("[DEBUG] Jumlah tombol [data-filter]:", target.tombolFilter.length);

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
    // P11: filter kategori pada data asli daftarProduk
    { uji: 'filterProdukByKategori(Semua)', hasil: String(filterProdukByKategori(daftarProduk, "Semua").length), harapan: "3" },
    { uji: 'filterProdukByKategori(Minuman)', hasil: String(filterProdukByKategori(daftarProduk, "Minuman").length), harapan: "2" },
    { uji: 'filterProdukByKategori(Makanan)', hasil: String(filterProdukByKategori(daftarProduk, "Makanan").length), harapan: "1" },
    { uji: 'filterProdukByKategori(Camilan)', hasil: String(filterProdukByKategori(daftarProduk, "Camilan").length), harapan: "0" },
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
  renderKatalog(daftarProduk); // tampilan awal: kategori "Semua"
  pasangFilterKatalog(daftarProduk); // P11: pasang listener tombol filter (sekali saja)
  renderRingkasan(daftarProduk);
  renderProduk(produkUmkm);

  // Pemeriksaan Console hanya di halaman Produk agar halaman lain tetap bersih.
  if (MODE_DEBUG && document.querySelector("#produk-grid") !== null) {
    tampilkanDebug();
    jalankanUjiCepat();
  }
}

document.addEventListener("DOMContentLoaded", jalankanProgram);