// Kiểm tra xem script đã được nạp trước đó hay chưa
if (window.isPinningScriptLoaded) {
    console.log("Script đã được nạp trước đó.");
  } else {
    window.isPinningScriptLoaded = true;
  
    let pinTimeoutId = null;
    let unpinTimeoutId = null;
    let contextMenuHandler = null;
    let currentPinButton = null;

    // Lắng nghe tin nhắn từ background.js
    chrome.runtime.onMessage.addListener((message) => {
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
          const pinElement = element.closest("svg.arco-icon-pin");
          if (pinElement) {
            const pinButton = pinElement.closest("div.cursor-pointer");
            if (pinButton) {
              if (currentPinButton && currentPinButton !== pinButton) {
                clearTimeouts();
                unpinCurrentButton();
              }
              
              alert("Bắt đầu ghim");
              currentPinButton = pinButton;
              clickPinContinuously(currentPinButton);
            }
          } else {
            alert("Không phải nút ghim");
          }
        };
  
        document.addEventListener("contextmenu", contextMenuHandler);
      });
    }
  
    function clickPinContinuously(pinButton) {
      chrome.storage.local.get("isRunning", (data) => {
        if (!data.isRunning) {
          clearTimeouts();
          console.log("Đã dừng pin.");
          return;
        }
        pinButton.click();
        pinButton.style.backgroundColor = 'lightblue';
        console.log("Pinned!");
        
        unpinTimeoutId = setTimeout(() => {
          pinButton.click();
          pinButton.style.backgroundColor = 'red';
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
      clearTimeouts();
      if (contextMenuHandler) {
        document.removeEventListener("contextmenu", contextMenuHandler);
        contextMenuHandler = null;
        console.log("Đã dừng pin và gỡ bỏ sự kiện context menu.");
      }
    }
    // Hàm để unpin nút hiện tại
    function unpinCurrentButton() {
      if (currentPinButton) {
          currentPinButton.click();
          currentPinButton.style.backgroundColor = '';
          console.log("Đã unpin nút trước đó.");
      }
      currentPinButton = null;
    }
    function clearTimeouts() {
        if (pinTimeoutId) {
            clearTimeout(pinTimeoutId);
            pinTimeoutId = null;
        }
        if (unpinTimeoutId) {
            clearTimeout(unpinTimeoutId);
            unpinTimeoutId = null;
        }
    }
  }