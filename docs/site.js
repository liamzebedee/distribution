const install = document.querySelector("[data-install]");

if (install) {
  const select = install.querySelector("#platform");
  const code = install.querySelector("#install-command");
  const copy = install.querySelector(".copy-icon");
  const copyImage = copy.querySelector(".icon-copy");
  const checkImage = copy.querySelector(".icon-check");
  const download = document.querySelector(".download-cta");

  function updateCommand() {
    const option = select.selectedOptions[0];
    let command = "";
    if (option.dataset.url) {
      const downloadCommand = `curl -fL -o ${option.dataset.file} ${option.dataset.url}`;
      command = install.dataset.install === "mytunes" && option.value === "mac"
        ? `${downloadCommand} && tar -xzf MyTunes.tar.gz && open MyTunes.app`
        : `${downloadCommand} && chmod +x ${option.dataset.file} && ./${option.dataset.file}`;
    }
    code.textContent = command || "Select a platform";
    copy.disabled = !command;
    copy.setAttribute("aria-label", "Copy command");
    copy.title = "Copy command";
    copyImage.hidden = false;
    checkImage.hidden = true;
    download.textContent = option.value
      ? `Download for ${option.value === "mac" ? "macOS" : "Linux"}`
      : "Choose a platform";
  }

  function detectPlatform() {
    const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
    const userAgent = navigator.userAgent;
    if (/android|iphone|ipad/i.test(userAgent)) return "";
    if (/mac/i.test(platform)) return "mac";
    if (/linux/i.test(platform)) return "linux";
    return "";
  }

  select.addEventListener("change", updateCommand);
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      copy.setAttribute("aria-label", "Copied");
      copy.title = "Copied";
      copyImage.hidden = true;
      checkImage.hidden = false;
      setTimeout(() => {
        copy.setAttribute("aria-label", "Copy command");
        copy.title = "Copy command";
        copyImage.hidden = false;
        checkImage.hidden = true;
      }, 1800);
    } catch {
      copy.setAttribute("aria-label", "Copy failed");
      copy.title = "Copy failed";
    }
  });

  select.value = detectPlatform();
  updateCommand();
}

const gallery = document.querySelector(".product-gallery");
if (gallery) {
  const images = [...gallery.querySelectorAll(".product-shot")];
  const dots = [...gallery.querySelectorAll(".gallery-dots button")];
  let current = 0;

  function showImage(index) {
    current = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => { image.hidden = imageIndex !== current; });
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === current) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  gallery.querySelector(".gallery-previous").addEventListener("click", () => showImage(current - 1));
  gallery.querySelector(".gallery-next").addEventListener("click", () => showImage(current + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showImage(index)));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      showImage(current + (event.key === "ArrowRight" ? 1 : -1));
      event.preventDefault();
    }
  });
}
