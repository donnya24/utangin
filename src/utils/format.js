export function formatRupiah(angka) {
  if (angka === null || angka === undefined) return "Rp 0";
  return "Rp " + Math.abs(angka).toLocaleString("id-ID");
}

export function formatRupiahInput(angka) {
  // Untuk input: tampilkan tanpa 'Rp', hanya angka dengan titik
  if (!angka) return "";
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseRupiahInput(value) {
  // Hapus semua karakter selain digit
  const raw = value.replace(/\D/g, "");
  return raw === "" ? 0 : parseInt(raw, 10);
}
