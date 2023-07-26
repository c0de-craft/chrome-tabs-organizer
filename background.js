chrome.action.onClicked.addListener((tab) => {
  let domain;
  if (tab.url === 'chrome://newtab/') {
    domain = 'empty';
  } else {
    try {
      domain = new URL(tab.url).hostname;
    } catch (_) {
      // Not a valid URL, do nothing
      return;
    }
  }

  chrome.tabs.query({}).then((tabs) => {
    let domainTabs = tabs.filter((tab) => {
      if (domain === 'empty') {
        return tab.url === 'chrome://newtab/';
      } else {
        let url;
        if (!tab.url || tab.url.startsWith('chrome://')) {
          // Not a valid URL or a special Chrome URL, skip this tab
          return false;
        }
        try {
          url = new URL(tab.url);
        } catch (_) {
          // Not a valid URL, skip this tab
          return false;
        }
        return url.hostname.includes(domain);
      }
    });

    if (domainTabs.length > 0) {
      let tabIds = domainTabs.map((tab) => tab.id);
      chrome.windows.create({}).then((window) => {
        chrome.tabs.move(tabIds, {
          windowId: window.id,
          index: -1
        });
      });
    }
  });
});