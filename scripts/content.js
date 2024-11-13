// Kiểm tra xem script đã được nạp trước đó hay chưa
if (window.isPinningScriptLoaded) {
    console.log("Script đã được nạp trước đó.");
  } else {
    window.isPinningScriptLoaded = true;
  
    let pinTimeoutId = null;
    let unpinTimeoutId = null;
    let contextMenuHandler = null;
  
    // Lắng nghe tin nhắn từ background.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "startPinning") {
        startPinningProcess();
      } else if (message.action === "stopPinning") {
        stopPinningProcess();
      }
    });
  
    function startPinningProcess() {
      chrome.storage.local.get("isRunning", (data) => {
        if (!data.isRunning) return;
  
        if (contextMenuHandler) return;
  
        contextMenuHandler = (event) => {
          event.preventDefault();
          const element = event.target;
          const pinElement = element.closest(".arco-icon-pin");
          if (pinElement) {
            const pinButton = pinElement.closest("div.cursor-pointer");
            if (pinButton) {
              alert("Bắt đầu ghim nhé!");
              clickPinContinuously(pinButton);
            }
          } else {
            alert("Chưa trúng nút ghim ní ơi!!");
          }
        };
  
        document.addEventListener("contextmenu", contextMenuHandler);
      });
    }
  
    function clickPinContinuously(pinButton) {
      chrome.storage.local.get("isRunning", (data) => {
        if (!data.isRunning) {
          clearTimeout(pinTimeoutId);
          clearTimeout(unpinTimeoutId);
          console.log("Đã dừng pin.");
          return;
        }
  
        console.log("Bắt đầu chu kỳ pin/unpin...");
        pinButton.click();
        console.log("Pinned!");
  
        unpinTimeoutId = setTimeout(() => {
          pinButton.click();
          console.log("Unpinned!");
  
          pinTimeoutId = setTimeout(() => {
            pinButton.click();
            console.log("Repinned!");
            clickPinContinuously(pinButton);
          }, 500);
        }, 20000);
      });
    }
  
    function stopPinningProcess() {
      clearTimeout(pinTimeoutId);
      clearTimeout(unpinTimeoutId);
      if (contextMenuHandler) {
        document.removeEventListener("contextmenu", contextMenuHandler);
        contextMenuHandler = null;
        console.log("Đã dừng pin và gỡ bỏ sự kiện context menu.");
      }
    }
  }
  