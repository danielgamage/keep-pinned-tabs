export default defineBackground(() => {
  // Track recent tabs using a Set
  const recentTabs = new Set<number>();
  const MAX_RECENT_TABS = 10; // Keep track of last 10 tabs

  // Track tab changes
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    // Remove tab if it exists and add it to the end
    recentTabs.delete(activeInfo.tabId);
    recentTabs.add(activeInfo.tabId);
    
    // Keep only the most recent tabs
    if (recentTabs.size > MAX_RECENT_TABS) {
      const oldestTab = recentTabs.values().next().value;
      recentTabs.delete(oldestTab);
    }
  });

  // Handle CMD+W keyboard shortcut
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'close-tab') {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (!currentTab) return;

      // Check if tab is in "Favorites" group
      let isInPinnedGroup = false;
      if (currentTab.groupId !== -1) {
        const tabGroupTitle = (await browser.tabGroups.get(currentTab.groupId))?.title
        if (tabGroupTitle) {
          const { pinnedGroups } = await storage.getMeta('sync:preferences');
          isInPinnedGroup = (pinnedGroups ?? ['Favorites']).includes(tabGroupTitle);
        }
      }
      
      // If tab is pinned or in Favorites group
      if (currentTab.pinned || isInPinnedGroup) {
        // Remove current tab from recent tabs
        recentTabs.delete(currentTab.id!);
        
        // Get most recent tab that still exists
        for (const tabId of [...recentTabs].reverse()) {
          try {
            await browser.tabs.get(tabId); // Check if tab exists
            await browser.tabs.update(tabId, { active: true });
            await browser.tabs.discard(currentTab.id!);
            
            return;
          } catch {
            recentTabs.delete(tabId); // Remove if tab no longer exists
          }
        }
        
        // If no recent tabs exist, go to first tab
        const [firstTab] = await browser.tabs.query({ index: 0 });
        if (firstTab) {
          await browser.tabs.update(firstTab.id!, { active: true });
        }
        
        // Suspend current tab
        await browser.tabs.discard(currentTab.id!);
      } else {
        recentTabs.delete(currentTab.id!);
        // Close tab
        await browser.tabs.remove(currentTab.id!);
      }
    }
  });

  // Clean up closed tabs from the Set
  browser.tabs.onRemoved.addListener((tabId) => {
    recentTabs.delete(tabId);
  });
});