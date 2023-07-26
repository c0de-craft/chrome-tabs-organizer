chrome.action.onClicked.addListener(async (tab) => {
  let domain;
  let isNewTab = false;

  if (!tab.url || tab.url.startsWith('chrome://')) {
    // Handle new tab (empty page) case separately
    isNewTab = true;
  } else {
    try {
      domain = new URL(tab.url).hostname;
    } catch (_) {
      // Not a valid URL, do nothing
      return;
    }
  }

  const tabs = await chrome.tabs.query({});
  let domainTabs = tabs.filter((tab) => {
    if (isNewTab) {
      // Collect all new tabs (empty pages)
      return !tab.url || tab.url.startsWith('chrome://');
    } else {
      // Collect all tabs with the same domain
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
    const newWindow = await chrome.windows.create({});
    // Move the first tab to the new window
    await chrome.tabs.move(tabIds[0], {
      windowId: newWindow.id,
      index: -1
    });
    // Remove the default tab in the new window
    await chrome.tabs.remove(newWindow.tabs[0].id);
    // If there are more tabs, move them to the new window
    if (tabIds.length > 1) {
      await chrome.tabs.move(tabIds.slice(1), {
        windowId: newWindow.id,
        index: -1
      });
    }
  }
});
