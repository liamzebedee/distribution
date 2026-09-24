async function detectedPlatform() {
  const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
  const userAgent = navigator.userAgent;
  let architecture = "";

  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      ({ architecture } = await navigator.userAgentData.getHighEntropyValues(["architecture"]));
    } catch {
      // The browser can withhold architecture; the OS still identifies the download list.
    }
  }

  if (/mac/i.test(platform)) {
    const macArchitecture = architecture === "arm" || /arm64|aarch64/i.test(userAgent)
      ? "arm"
      : architecture === "x86" ? "intel" : "unknown";
    return { os: "mac", architecture: macArchitecture };
  }
  if (/linux/i.test(platform)) {
    const linuxArchitecture = architecture === "arm" || /arm64|aarch64/i.test(userAgent)
      ? "arm"
      : architecture === "x86" || /x86_64|amd64|x64/i.test(userAgent) ? "amd64" : "unknown";
    return { os: "linux", architecture: linuxArchitecture };
  }
  return { os: "other", architecture: "unknown" };
}

function showSuggestedDownload(section, platform) {
  const link = section.querySelector(`.platform-row a[data-platform="${platform.os}"]`);
  const suggested = section.querySelector(".primary-download");
  const message = section.querySelector(".platform-message");
  const unsupportedLinux = platform.os === "linux" && platform.architecture === "arm";
  const unsupportedMac = section.id === "termset" && platform.os === "mac" && platform.architecture === "intel";

  if (!link || unsupportedLinux || unsupportedMac) {
    message.textContent = "There is no build for your detected platform yet. Available downloads are below.";
    message.hidden = false;
    return;
  }

  suggested.href = link.href;
  suggested.textContent = section.id === "mytunes"
    ? platform.os === "mac" ? "Download MyTunes for macOS" : "Download MyTunes for Linux AMD64"
    : platform.os === "mac" ? "Download termset for macOS Apple Silicon" : "Download termset for Linux AMD64";
  suggested.hidden = false;
}

detectedPlatform().then((platform) => {
  document.querySelectorAll(".product").forEach((section) => showSuggestedDownload(section, platform));
});

document.querySelectorAll(".copy-link").forEach((button) => {
  button.addEventListener("click", async () => {
    const url = button.parentElement.querySelector("a").href;
    try {
      await navigator.clipboard.writeText(url);
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = "Copy link"; }, 1800);
    } catch {
      button.textContent = "Copy failed";
    }
  });
});

const gallery = document.querySelector(".gallery");
const slides = [...gallery.querySelectorAll(".gallery-slide")];
const thumbnails = [...gallery.querySelectorAll(".gallery-thumbnails button")];
const count = gallery.querySelector(".gallery-count");
let currentSlide = 0;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => { slide.hidden = slideIndex !== currentSlide; });
  thumbnails.forEach((button, slideIndex) => {
    button.setAttribute("aria-pressed", String(slideIndex === currentSlide));
  });
  count.textContent = `${currentSlide + 1} / ${slides.length}`;
}

gallery.querySelector(".gallery-previous").addEventListener("click", () => showSlide(currentSlide - 1));
gallery.querySelector(".gallery-next").addEventListener("click", () => showSlide(currentSlide + 1));
thumbnails.forEach((button, index) => button.addEventListener("click", () => showSlide(index)));
gallery.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    showSlide(currentSlide + (event.key === "ArrowRight" ? 1 : -1));
    event.preventDefault();
  }
});
