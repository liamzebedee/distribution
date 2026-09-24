document.querySelectorAll(".command button").forEach((button) => {
  button.addEventListener("click", async () => {
    const command = button.parentElement.querySelector("code").textContent;
    await navigator.clipboard.writeText(command);
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy"; }, 1800);
  });
});
