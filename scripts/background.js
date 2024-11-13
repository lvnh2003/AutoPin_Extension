// Tạo menu chuột phải khi cài đặt extension
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
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "startPinning") {
      chrome.storage.local.set({ isRunning: true }, () => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: startPinningProcess
        });
      });
    } else if (info.menuItemId === "stopPinning") {
      chrome.storage.local.set({ isRunning: false }, () => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: stopPinningProcess
        });
      });
    }
  });
  
  let pinTimeoutId = null;
  let unpinTimeoutId = null;
  
  function startPinningProcess() {
    chrome.storage.local.get("isRunning", (data) => {
      if (!data.isRunning) return;
  
      const targetElement = document.activeElement;
  
      if (targetElement && targetElement.tagName.toLowerCase() === "button") {
        console.log("Đã tìm thấy nút cần pin!");
  
        
  
        function clickPinContinuously() {
          chrome.storage.local.get("isRunning", (data) => {
            if (!data.isRunning) {
              clearTimeout(pinTimeoutId);
              clearTimeout(unpinTimeoutId);
              console.log("Đã dừng pin.");
              return;
            }
  
            console.log("Bắt đầu chu kỳ pin/unpin...");
            targetElement.click();
            console.log("Pinned!");
  
            unpinTimeoutId = setTimeout(() => {
              targetElement.click();
              styleUnpinned(targetElement);
              console.log("Unpinned!");
  
              pinTimeoutId = setTimeout(() => {
                targetElement.click();
                stylePinned(targetElement);
                console.log("Repinned!");
  
                clickPinContinuously();
              }, 500);
            }, 20000);
          });
        }
  
        clickPinContinuously();
      } else {
        console.log("Không tìm thấy nút cần pin.");
      }
    });
  }
  
  function stopPinningProcess() {
    chrome.storage.local.set({ isRunning: false }, () => {
      clearTimeout(pinTimeoutId);
      clearTimeout(unpinTimeoutId);
      console.log("Đã dừng pin.");
    });
  }