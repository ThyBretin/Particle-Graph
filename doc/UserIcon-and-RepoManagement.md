User Icon and Repo Management
User Icon Updates
Current Design: The user icon is in the top-right corner (as seen in your draft).

Proposed Enhancements:
Active Repo Indicator: Next to the user icon, show the active repo’s name (e.g., "my-project ▼").

Dropdown Menu:
Active Repo: "my-project | Active | $5/month".

Manage Repos: A list of all repos the user has access to, with their status:

my-project | Active | $5/month
my-api     | Inactive | Activate ($5/month)
my-app     | Inactive | Activate ($5/month)

Add New Repo: "Add Another Repo" (triggers the repo selection modal again).

Sign Out: Standard logout option.

Behavior:
Clicking "Activate" on an inactive repo redirects to Lemon Squeezy for payment, then marks the repo as active.

Clicking an active repo switches the UserPage to that repo’s data (fetches new data via /listGraph, /appStory, etc.).

"Add Another Repo" reopens the repo selection modal.

Include/Exclude Repos
Logic: The "Manage Repos" dropdown effectively handles inclusion/exclusion:
Include: Activating a repo (via payment) adds it to the user’s active list.

Exclude: Add a "Deactivate" option next to active repos in the dropdown (e.g., "my-project | Active | Deactivate").
Deactivating cancels the Lemon Squeezy subscription for that repo (via API) and marks it as inactive.

Why: This keeps repo management in one place (the user icon dropdown) without cluttering the UI.

