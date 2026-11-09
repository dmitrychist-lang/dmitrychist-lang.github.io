"use strict";
const repo = "dmitrychist-lang/dmitrychist-lang.github.io";
const guides = [
  ["Добавление фотографий", "Файлы, папки и перетаскивание в EPPS.", "guide-01-photos.webp"],
  ["Количество копий", "Настройка числа копий каждой фотографии.", "guide-02-copies.webp"],
  ["Компоновка листа", "Количество снимков, размер и расположение.", "guide-03-layout.webp"],
  ["Перемещение блоков", "Перестановка и сворачивание панелей.", "guide-04-panels.webp"],
  ["Редактирование фото", "Ориентация, масштаб и горизонт.", "guide-05-editing.webp"],
  ["Контекстное меню", "Быстрые действия по правому клику.", "guide-06-context-menu.webp"],
  ["Настройки Epson", "Драйвер, бумага, качество и параметры.", "guide-07-epson.webp"],
  ["Цветокоррекция Epson", "PhotoEnhance и ручные настройки.", "guide-08-color.webp"],
  ["ICC-профили", "Режимы управления цветом при печати.", "guide-09-icc.webp"],
  ["Предпросмотр и печать", "Проверка листов перед печатью.", "guide-10-print.webp"]
];
const grid = document.getElementById("guide-grid");
const dialog = document.getElementById("image-dialog");
const dlgImg = document.getElementById("dialog-image");
const dlgCaption = document.getElementById("dialog-caption");
const dlgCount = document.getElementById("dialog-count");
let openedIndex = 0;
for (const [i, [title, description, file]] of guides.entries()) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "guide-card";
  b.setAttribute("aria-label", `Открыть шаг ${i + 1}: ${title}`);
  const img = document.createElement("img");
  img.src = `assets/${file}`; img.alt = `Шаг ${i + 1}: ${title}, скриншот интерфейса EPPS`;
  img.loading = "lazy"; img.width = 1920; img.height = 950;
  const meta = document.createElement("span"); meta.className = "guide-card-meta";
  const number = document.createElement("span"); number.className = "step-number"; number.textContent = String(i + 1);
  const words = document.createElement("span");
  const strong = document.createElement("strong"); strong.textContent = title;
  const small = document.createElement("small"); small.textContent = description;
  words.append(strong, small); meta.append(number, words); b.append(img, meta);
  b.addEventListener("click", () => showGuide(i)); grid.append(b);
}
function showGuide(index) {
  openedIndex = (index + guides.length) % guides.length;
  const [title, description, file] = guides[openedIndex];
  dlgImg.src = `assets/${file}`;
  dlgImg.alt = `Скриншот шага ${openedIndex + 1}: ${title}`;
  dlgCaption.textContent = `${openedIndex + 1}. ${title} — ${description}`;
  dlgCount.textContent = `${openedIndex + 1} / ${guides.length}`;
  if (!dialog.open) dialog.showModal();
}
document.getElementById("dialog-close").addEventListener("click", () => dialog.close());
document.getElementById("dialog-prev").addEventListener("click", () => showGuide(openedIndex - 1));
document.getElementById("dialog-next").addEventListener("click", () => showGuide(openedIndex + 1));
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener("keydown", e => { if (e.key === "ArrowLeft") showGuide(openedIndex - 1); if (e.key === "ArrowRight") showGuide(openedIndex + 1); });
async function fetchCompleteRelease(version) {
  const url = "https://api.github.com/repos/" + repo + "/releases/tags/v" + version;
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) return null;
  const release = await response.json();
  const versionSlug = version.replaceAll(".", "_");
  const filenames = {
    setup: "EcoPrint_Photo_Studio_Setup_v" + version + ".exe",
    portable: "EcoPrint_Photo_Studio_v" + versionSlug + "_WIN10_x64.zip"
  };
  const assets = {};
  for (const [kind, filename] of Object.entries(filenames)) {
    const asset = release.assets?.find(item => item.name === filename);
    if (!asset || !asset.browser_download_url) return null;
    assets[kind] = asset;
  }
  return { version, assets };
}
async function bindReleaseDownloads() {
  try {
    // Keep v1.4.89 downloads live until BOTH v1.4.90 binaries exist in GitHub Releases.
    const published = (await fetchCompleteRelease("1.4.90")) || (await fetchCompleteRelease("1.4.89"));
    if (!published) return;
    const version = published.version;
    const nav = document.querySelector(".nav-download");
    if (nav) nav.innerHTML = "v" + version + " <span>· Open Beta</span>";
    const kicker = document.querySelector("#top .kicker");
    if (kicker) kicker.innerHTML = '<span class="live-dot"></span> Открытый бета-тест · Версия ' + version;
    const heroButton = document.querySelector(".hero-actions .btn.primary");
    if (heroButton) heroButton.innerHTML = '<span aria-hidden="true">↓</span> К загрузке v' + version;
    const heading = document.querySelector("#downloads .section-header .eyebrow");
    if (heading) heading.textContent = "ВЕРСИЯ " + version + " · OPEN BETA";
    for (const [kind, asset] of Object.entries(published.assets)) {
      const anchor = document.getElementById(kind + "-download");
      if (!anchor) continue;
      anchor.href = asset.browser_download_url;
      anchor.textContent = "Скачать с GitHub ↓";
      anchor.setAttribute("aria-label", "Скачать " + asset.name + " с GitHub Releases");
      const counter = document.getElementById(kind + "-count");
      if (counter) counter.textContent = "Скачиваний: " + new Intl.NumberFormat("ru-RU").format(asset.download_count ?? 0);
    }
  } catch (_error) {
    // Static fallback links always lead to a previously published version.
  }
}
bindReleaseDownloads();
