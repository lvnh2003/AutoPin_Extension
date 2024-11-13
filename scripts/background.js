chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "startPinning",
    title: "Chọn nút cần pin",
    contexts: ["all"]
  });
  chrome.contextMenus.create({
    id: "stopPinning",
    title: "Dừng pin",
    contexts: ["all"]
  });
});

// Lắng nghe sự kiện khi người dùng nhấp vào menu ngữ cảnh
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "startPinning") {
    chrome.storage.local.set({ isRunning: true }, async () => {
      await injectContentScript(tab.id);
      chrome.tabs.sendMessage(tab.id, { action: "startPinning" });
    });
  } else if (info.menuItemId === "stopPinning") {
    chrome.storage.local.set({ isRunning: false }, async () => {
      await injectContentScript(tab.id);
      chrome.tabs.sendMessage(tab.id, { action: "stopPinning" });
    });
  }
});

// Hàm nạp `content.js` vào tab hiện tại nếu chưa được nạp
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["scripts/content.js"]
    });
  } catch (error) {
    console.error("Lỗi khi nạp content script:", error);
  }
}
