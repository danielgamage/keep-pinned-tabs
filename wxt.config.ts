import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    "name": "Keep Pinned Tabs",
    "description": "Suspends pinned tabs and tabs in a 'Favorites' group instead of closing them.",
    "commands": {
      "close-tab": {
        "suggested_key": {
          "default": "Ctrl+W",
          "mac": "Command+W"
        },
        "description": "Close tab or switch to previous tab"
      }
    },
    "permissions": [
      "tabs",
      "tabGroups",
      "storage"
    ],
    "host_permissions": [
      "<all_urls>"
    ]
  }
});
