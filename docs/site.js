const install = document.querySelector("[data-install]");

if (install) {
  const select = install.querySelector("#platform");
  const code = install.querySelector("#install-command");
  const copy = install.querySelector(".copy-command");

  function updateCommand() {
    const option = select.selectedOptions[0];
    const command = option.dataset.url
      ? `curl -fL -o ${option.dataset.file} ${option.dataset.url}`
      : "";
    code.textContent = command;
    copy.disabled = !command;
    copy.textContent = "Copy";
  }

  async function detectPlatform() {
    const platform = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
    const userAgent = navigator.userAgent;
    let architecture = "";
    if (navigator.userAgentData?.getHighEntropyValues) {
      try {
        ({ architecture } = await navigator.userAgentData.getHighEntropyValues(["architecture"]));
      } catch {
        architecture = "";
      }
    }
    if (/android|iphone|ipad/i.test(userAgent)) return "";
    if (/mac/i.test(platform)) {
      if (install.dataset.install === "termset" && architecture === "x86") return "";
      return "mac";
    }
    if (/linux/i.test(platform)) {
      if (architecture === "arm" || /arm64|aarch64/i.test(userAgent)) return "";
      return "linux";
    }
    return "";
  }

  select.addEventListener("change", updateCommand);
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      copy.textContent = "Copied";
      setTimeout(() => { copy.textContent = "Copy"; }, 1800);
    } catch {
      copy.textContent = "Failed";
    }
  });

  detectPlatform().then((platform) => {
    select.value = platform;
    updateCommand();
  });
}
