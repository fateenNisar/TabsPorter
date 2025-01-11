const tabs = document.querySelectorAll(".tab-content");
const triggers = document.querySelectorAll(".tab");
const copiedUrls = document.querySelector("#copiedUrls");
const pasteUrls = document.querySelector("#pastedUrls");
const fileInput = document.querySelector("#fileInput");
const importButton = document.querySelector("#importButton");
const openTabsButton = document.querySelector("#openTabsButton");
const exportButton = document.querySelector("#exportButton");
const copyButton = document.querySelector("#copyAll");
const toast = document.querySelector(".toast");

// File input h
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return showToast("No file selected");

  const reader = new FileReader();
  reader.onload = () => {
    pasteUrls.value = reader.result;
    showToast("File imported successfully");
  };
  reader.readAsText(file);
});

// all Open tabs
openTabsButton.addEventListener("click", async () => {
  const  unsanitizedUrls = pasteUrls.value.split("\n").map((url) => url.trim());
  const urlList = unsanitizedUrls.filter((url) => url !== "");
  const invalidUrls = urlList.filter((url) => !isValidUrl(url));
// console.log(urlList)    
  if (invalidUrls.length > 0) {
    return showToast(`Invalid URL(s): ${invalidUrls.join(", ")}`);
  }

  await Promise.all(
    urlList.map(async (url) => chrome.tabs.create({ url }))
  );
  showToast("Tabs opened successfully");
});

// Export URLs to file
exportButton.addEventListener("click", exportToFile);

function exportToFile() {
  const urls = getUrlsFromCopied();
  if (urls.length === 0) return showToast("No URLs to export");

  const blob = new Blob([urls.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "tabs.txt";
  link.href = url;
  link.click();
  showToast("Exported to file");
}

// Copy URLs to clipboard
copyButton.addEventListener("click", async () => {
  const urls = getUrlsFromCopied();
  if (urls.length === 0) return showToast("No URLs to copy");

  await navigator.clipboard.writeText(urls.join("\n"));
  showToast("Copied to clipboard");
});

// Fetch and display all tabs
(async () => {
  const chromeTabs = await chrome.tabs.query({ currentWindow: true });
  chromeTabs.forEach((tab) => addUrlToCopied(tab.url));
})();

// Add URL to the copied URLs section
function addUrlToCopied(url) {
  const linkElement = document.createElement("p");
  linkElement.textContent = url;
  linkElement.classList.add("link");
  copiedUrls.appendChild(linkElement);
}

// Get all URLs from the copied section
function getUrlsFromCopied() {
  return Array.from(document.querySelectorAll(".link")).map(
    (link) => link.textContent
  );
}

// switching tabss
triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    tabs.forEach((tab) => tab.classList.remove("active"));
    triggers.forEach((btn) => btn.classList.remove("active"));

    trigger.classList.add("active");
    document.getElementById(`${trigger.dataset.tab}Tab`).classList.add("active");
  });
});

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("toast-show");
  toast.classList.remove("toast-close");

  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-close");
  }, 2000);
}

// Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
