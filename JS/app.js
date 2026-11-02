"use strict";

console.log("P09 JavaScript aktif");

// ---------------------------------------------------------------------
// 1. DATA PRODUK (sumber utama katalog)
// Nama, harga, dan deskripsi diambil dari website asli.
// CATATAN: nilai "stok" hanya DATA DUMMY untuk praktikum,
// BUKAN stok asli Warkop Mas Hamzah.
// Untuk mengubah katalog, cukup ubah isi array ini.
// ---------------------------------------------------------------------
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

// Batas stok terbatas (stok 1 sampai dengan 5 = "Stok terbatas")
const BATAS_STOK_TERBATAS = 5;

// ---------------------------------------------------------------------
// 2. FORMAT HARGA (Intl.NumberFormat, locale id-ID, mata uang IDR)
// ---------------------------------------------------------------------
const formatRupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Hasil bawaan: "Rp 21.000" (ada spasi). Spasi dibuang agar sama
// dengan tampilan website asli: "Rp21.000".
function formatHarga(angka) {
  return formatRupiah.format(angka).replace(/\s/g, "");
}

// ---------------------------------------------------------------------
// 3. STATUS STOK (urutan if / else if / else harus benar)
// ---------------------------------------------------------------------
function tentukanStatusStok(stok) {
  if (stok === 0) {
    return { teks: "Habis", kelas: "habis" };
  } else if (stok > 0 && stok <= BATAS_STOK_TERBATAS) {
    return { teks: "Stok terbatas", kelas: "terbatas" };
  } else {
    return { teks: "Tersedia", kelas: "tersedia" };
  }
}

// ---------------------------------------------------------------------
// 4. RINGKASAN KATALOG (dihitung dari array, bukan ditulis manual)
// Definisi:
// - total     : semua object di array daftarProduk
// - aktif     : produk dengan aktif === true
// - tersedia  : produk aktif DAN stok lebih dari 0
// - habis     : produk aktif DAN stok sama dengan 0
// ---------------------------------------------------------------------
function hitungRingkasan(produkList) {
  let total = 0;
  let aktif = 0;
  let tersedia = 0;
  let habis = 0;
  let totalStok = 0;

  for (const produk of produkList) {
    total += 1;
    totalStok += produk.stok;

    if (produk.aktif) {
      aktif += 1;

      if (produk.stok > 0) {
        tersedia += 1;
      } else {
        habis += 1;
      }
    }
  }

  return { total, aktif, tersedia, habis, totalStok };
}

// ---------------------------------------------------------------------
// 5. TEMPLATE KARTU PRODUK (template literal)
// Nama kelas CSS mengikuti desain asli: product-card, product-badge,
// price, card-actions.
// ---------------------------------------------------------------------
function buatKartuProduk(produk) {
  const status = tentukanStatusStok(produk.stok);
  const label = produk.label ?? "Menu"; // ?? : pakai "Menu" jika label kosong
  const deskripsi = produk.deskripsi ?? "Deskripsi belum tersedia.";
  const badgeUnggulan = produk.unggulan ? " &#9733;" : ""; // ternary

  return `
    <article class="product-card">
      <span class="product-badge">${label}${badgeUnggulan}</span>
      <h3>${produk.nama}</h3>
      <p class="product-category">${produk.kategori}</p>
      <p>${deskripsi}</p>
      <p class="price">${formatHarga(produk.harga)}</p>
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

// ---------------------------------------------------------------------
// 6. RENDER KATALOG KE DOM
// ---------------------------------------------------------------------
function renderKatalog() {
  const katalog = document.querySelector("#katalog-produk");

  // Jika elemen tidak ada (bukan halaman produk), hentikan tanpa error.
  if (katalog === null) {
    return;
  }

  let html = "";

  for (const produk of daftarProduk) {
    if (!produk.aktif) {
      continue; // produk nonaktif tidak ditampilkan
    }
    html += buatKartuProduk(produk);
  }

  katalog.innerHTML = html;
}

function renderRingkasan() {
  const elemenTotal = document.querySelector("#ringkasan-total");
  const elemenAktif = document.querySelector("#ringkasan-aktif");
  const elemenTersedia = document.querySelector("#ringkasan-tersedia");
  const elemenHabis = document.querySelector("#ringkasan-habis");

  if (!elemenTotal || !elemenAktif || !elemenTersedia || !elemenHabis) {
    return;
  }

  const ringkasan = hitungRingkasan(daftarProduk);

  elemenTotal.textContent = ringkasan.total;
  elemenAktif.textContent = ringkasan.aktif;
  elemenTersedia.textContent = ringkasan.tersedia;
  elemenHabis.textContent = ringkasan.habis;
}

// ---------------------------------------------------------------------
// 7. DEBUGGING (console.log dan console.table)
// ---------------------------------------------------------------------
function tampilkanDebug() {
  const ringkasan = hitungRingkasan(daftarProduk);

  console.log("Jumlah produk:", daftarProduk.length);
  console.log(
    `Ringkasan: ${ringkasan.total} total, ${ringkasan.aktif} aktif, ` +
      `${ringkasan.tersedia} tersedia, ${ringkasan.habis} habis, ` +
      `total stok dummy ${ringkasan.totalStok}`
  );
  console.table(daftarProduk);
}

// ---------------------------------------------------------------------
// 8. JALANKAN (hanya bekerja jika elemen katalog ada di halaman)
// ---------------------------------------------------------------------
renderKatalog();
renderRingkasan();
tampilkanDebug();

// =====================================================================
// P09-02: DATA, FORMATTER, CONDITIONAL, SWITCH, TERNARY, RENDER DOM
// Kode di atas (daftarProduk, renderKatalog, dst.) tidak diubah.
// Semua nama di bawah sengaja dibuat berbeda agar tidak bentrok, karena
// file .js klasik berbagi satu lingkup global (mis. form.js sudah memakai
// nama "form" dan "preview", jadi nama itu TIDAK dipakai di sini).
// CATATAN: nilai stok hanya DATA DUMMY untuk praktikum.
// =====================================================================

// A. Array of object: nama, kategori, harga, stok
const produkUmkm = [
  { nama: "Kopi Susu Vanila", kategori: "minuman", harga: 21000, stok: 8 }, // Tersedia
  { nama: "Americano", kategori: "minuman", harga: 22000, stok: 4 }, // Stok terbatas
  { nama: "Mie Goreng Aceh Telur Ceplok", kategori: "makanan", harga: 20000, stok: 0 }, // Habis
];

// B. Status stok: === 0 -> Habis, <= 5 -> Stok terbatas, selain itu Tersedia
function statusStok(stok) {
  if (stok === 0) {
    return "Habis";
  } else if (stok <= 5) {
    return "Stok terbatas";
  } else {
    return "Tersedia";
  }
}

// Kelas CSS untuk badge (tersedia = gaya dasar, tanpa kelas tambahan)
function kelasBadgeStok(stok) {
  if (stok === 0) {
    return "stock-badge empty";
  } else if (stok <= 5) {
    return "stock-badge warning";
  }
  return "stock-badge";
}

// C. switch: label kategori
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

// D. ternary: label aksi
function labelAksi(stok) {
  return stok > 0 ? "Siap dipesan" : "Hubungi admin";
}

// E. renderProduk(): kartu lewat innerHTML, ringkasan lewat textContent
function renderProduk() {
  const grid = document.querySelector("#produk-dinamis");
  const ringkasan = document.querySelector("#produk-ringkasan");

  // app.js dimuat di semua halaman; target ini hanya ada di produk.html.
  if (!grid || !ringkasan) {
    return;
  }

  let html = "";
  let jumlahTersedia = 0;
  let totalStok = 0;

  for (const item of produkUmkm) {
    totalStok += item.stok;
    if (item.stok > 0) {
      jumlahTersedia += 1;
    }

    html += `
      <article class="product-card js-product-card">
        <span class="product-badge">${labelKategori(item.kategori)}</span>
        <h3>${item.nama}</h3>
        <p class="price">${formatRupiah.format(item.harga)}</p>
        <p><span class="${kelasBadgeStok(item.stok)}">${statusStok(item.stok)}</span> (stok: ${item.stok})</p>
        <div class="card-actions">
          <a class="button" href="kontak.html">${labelAksi(item.stok)}</a>
        </div>
      </article>
    `;
  }

  grid.innerHTML = html;
  ringkasan.textContent =
    `Total ${produkUmkm.length} produk, ${jumlahTersedia} tersedia, ` +
    `total stok dummy ${totalStok}.`;
}

// F. Jalankan setelah DOM siap + tampilkan data di Console
document.addEventListener("DOMContentLoaded", () => {
  renderProduk();
  console.table(produkUmkm);
});