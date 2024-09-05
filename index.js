function cycleTabs(callback) {
  const tabs = document.querySelector(".tabs");
  Array.from(tabs.children).forEach((node) => {
    // element
    if (node.nodeType === 1) {
      callback(node);
    }
  });
}

/**
 * @param {HTMLElement} tab
 */
function showTab(tab) {
  if (tab.classList.contains("selected")) {
    return;
  }

  cycleTabs((item) => item.classList.remove("selected"));

  const template = document.getElementById(tab.dataset.template);

  const main = document.querySelector(".main");
  while (main.firstChild) {
    main.removeChild(main.firstChild);
  }

  main.appendChild(template.content.cloneNode(true));
  tab.classList.add("selected");
}

function initTabs() {
  let firstTab;

  cycleTabs((tab) => {
    tab.addEventListener("click", (event) => showTab(event.currentTarget));

    if (!firstTab) {
      firstTab = tab;
    }
  });

  firstTab.click();
}

function initSettings() {}



const getActiveTab = () =>
  new Promise((resolve, reject) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      function ([activeTab]) {
        if (!activeTab) {
          reject(new Error("Active tab could not be retrieved."));
          return;
        }

        resolve(activeTab);
      }
    );
  });


const getAnalystInfo = (tab) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "get-tab-data-info", data: { tabId: tab.id } },
      resolve
    );
  });

const getTabDataForActiveTab = () => getActiveTab().then(getAnalystInfo);

function initTest() {
  document.getElementById("get-tab-data-data").addEventListener("click", () => {
    console.log("get-login-data CLICKED!");
    // <!---- TEST CODE ON

    getTabDataForActiveTab().then(console.log);

    // <!---- TEST CODE OFF
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTest();

  initTabs();
  initSettings();
});

/**
 * Use Bootstrap for UI and Codemirror for code editor, build UI with react
 *
 */
