export default defineBackground(() => {
  // Track both current and previous tabs
  let nowTab: number | undefined;
  let prevTab: number | undefined;

  // Track tab changes
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    // Update previous tab to be the current tab before we change it
    prevTab = nowTab;
    // Set the new current tab
    nowTab = activeInfo.tabId;
  });

  // Handle CMD+W keyboard shortcut
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'close-tab') {
      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      if (!currentTab) return;

      // Check if tab is in "Favorites" group
      const isInFavorites = currentTab.groupId !== -1
        ? (await browser.tabGroups.get(currentTab.groupId))?.title === 'Favorites'
        : false;

      // If tab is pinned or in Favorites group
      if (currentTab.pinned || isInFavorites) {
        if (prevTab) {
          try {
            // switch to previous tab if it exists, and discard the current tab
            await browser.tabs.discard(currentTab.id!);
            // Suspend current tab
            await browser.tabs.update(prevTab, { active: true });
          } catch {
            // If previous tab no longer exists, go to first tab
            const [firstTab] = await browser.tabs.query({ index: 0 });
            if (firstTab) {
              await browser.tabs.update(firstTab.id!, { active: true });
            }
          }
        }
        // await browser.tabs.remove(currentTab.id!);
        return;
      } else {
        // Close tab
        await browser.tabs.remove(currentTab.id!);
      }
    }
  });
});