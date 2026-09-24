const install = document.querySelector("[data-install]");

if (install) {
  const picker = install.querySelector(".platform-picker");
  const summary = picker.querySelector("summary");
  const selectedPlatform = picker.querySelector(".selected-platform");
  const selectedPlatformIcon = picker.querySelector(".selected-platform-icon");
  const platforms = [...picker.querySelectorAll(".platform-menu button")];
  const code = install.querySelector("#install-command");
  const copy = install.querySelector(".copy-icon");
  const copyImage = copy.querySelector(".icon-copy");
  const checkImage = copy.querySelector(".icon-check");
  const copyStatus = install.querySelector(".copy-status");
  let feedbackTimer;

  function resetCopyFeedback() {
    clearTimeout(feedbackTimer);
    copy.classList.remove("pending", "copied", "failed");
    copyStatus.classList.remove("failed");
    copyStatus.textContent = "";
    copy.setAttribute("aria-label", "Copy command");
    copy.title = "Copy command";
    copyImage.hidden = false;
    checkImage.hidden = true;
  }

  function selectPlatform(platform) {
    const option = platforms.find((item) => item.dataset.platform === platform) || platforms[0];
    const downloadCommand = `curl -fL -o ${option.dataset.file} ${option.dataset.url}`;
    const command = install.dataset.install === "mytunes" && option.dataset.platform === "mac"
      ? `${downloadCommand} && tar -xzf MyTunes.tar.gz && open MyTunes.app`
      : `${downloadCommand} && chmod +x ${option.dataset.file} && ./${option.dataset.file}`;

    const platformName = option.textContent.trim();
    const platformIcon = option.querySelector("img").src;
    selectedPlatform.textContent = platformName;
    selectedPlatformIcon.src = platformIcon;
    platforms.forEach((item) => {
      item.setAttribute("aria-current", String(item === option));
    });
    code.textContent = command;
    copy.disabled = false;
    if (install.dataset.install === "mytunes") {
      const gallery = install.querySelector(".product-gallery");
      const isMac = option.dataset.platform === "mac";
      gallery.dataset.platform = option.dataset.platform;
      gallery.querySelectorAll(".product-shot").forEach((image) => {
        const source = isMac ? image.dataset.macSrc : image.dataset.linuxSrc;
        if (image.getAttribute("src") !== source) image.src = source;
        const fullSizeLink = image.closest("a");
        if (fullSizeLink) fullSizeLink.href = image.src;
        image.width = isMac ? 1212 : 1362;
        image.height = isMac ? 815 : 836;
      });
    }
    picker.open = false;
    resetCopyFeedback();
  }

  function detectPlatform() {
    const requested = new URLSearchParams(window.location.search).get("platform")?.toLowerCase();
    if (requested === "macos") return "mac";
    if (requested === "linux") return "linux";
    const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
    if (/mac/i.test(platform)) return "mac";
    return "linux";
  }

  platforms.forEach((button) => button.addEventListener("click", () => {
    selectPlatform(button.dataset.platform);
    summary.focus();
  }));
  picker.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      picker.open = false;
      summary.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!picker.contains(event.target)) picker.open = false;
  });

  copy.addEventListener("click", async () => {
    copy.classList.remove("copied", "failed");
    copy.classList.add("pending");
    copyStatus.classList.remove("failed");
    copyStatus.textContent = "Copying…";
    try {
      await navigator.clipboard.writeText(code.textContent);
      copy.classList.replace("pending", "copied");
      copy.setAttribute("aria-label", "Copied");
      copy.title = "Copied";
      copyImage.hidden = true;
      checkImage.hidden = false;
      copyStatus.textContent = "Copied";
    } catch {
      copy.classList.replace("pending", "failed");
      copy.setAttribute("aria-label", "Copy blocked");
      copy.title = "Copy blocked";
      copyStatus.classList.add("failed");
      copyStatus.textContent = "Copy blocked";
    }
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(resetCopyFeedback, 2200);
  });

  selectPlatform(detectPlatform());
}

const gallery = document.querySelector(".product-gallery");
if (gallery) {
  const images = [...gallery.querySelectorAll(".product-shot")];
  const dots = [...gallery.querySelectorAll(".gallery-dots button")];
  let current = 0;

  function showImage(index) {
    current = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => {
      image.hidden = imageIndex !== current;
      const fullSizeLink = image.closest("a");
      if (fullSizeLink) fullSizeLink.hidden = image.hidden;
    });
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
