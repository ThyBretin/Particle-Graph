UserPage Layout and Implementation Guide

File Overview
Purpose: The UserPage is the main interface for users after login, displaying repo data (Summary, App Story, Graph Creation, Particle Refinement) for a selected GitHub repository. It includes onboarding for repo selection, crawling progress, and subscription management via Lemon Squeezy.

Framework: React with Mantine UI (as per the ParticleGraph blueprint).

Dependencies: Mantine UI components (@mantine/core, @mantine/hooks), Tabler icons (@tabler/icons-react for chevron-down icon).

Assumptions: The app uses Vite (per blueprint), and the backend is a Cloudflare Worker with endpoints like /listGraph, /appStory, /createGraph, /particleThis.

Layout Structure
1. AppShell (Main Wrapper)
Component: Use Mantine’s AppShell to structure the page with a header, main content, and footer.

Theme: Mantine theme with a light beige background (hex: #E9E1CD, as per mockup), dark text (hex: #2C394F), and blue accents (hex: #2571B0 for buttons/links).

2. Header
Height: 60px.

Padding: 16px (Mantine’s md).

Background: Transparent (inherits beige background).

Content:
The logo is composed with the following :
Logo text "PART</>CLE" : bebas Neue, regular, size 127px, color #white.
</> : Jomhuria, regular, size 207px, color #3B4D5C.
Graph : inside </> between the slash (/) and the arrow (>) at small scale with absolute positionning : Bebas Neue, regular, size 19px, color #6B7280.  

Right: User section with active repo name and avatar.
Text: Active repo name (e.g., "getReal", size 16px, color #333) followed by a chevron-down icon (Tabler’s IconChevronDown, size 16px).

Avatar: Circular avatar (Mantine Avatar, radius xl, size 32px) showing the user’s GitHub profile picture.

Menu (Dropdown):
Triggered by clicking the repo name/avatar.

Items:
List of repos: "getReal | Active | $5/month | Deactivate", "my-api | Inactive | Activate ($5/month)".

"Add Another Repo" (opens repo selection modal).

"Manage Billing" (links to Lemon Squeezy customer portal).

"Sign Out" (logs user out).

3. Main Content (Split Layout)
Structure: Two-column layout using Mantine’s Group with position="apart" and grow.

Left Section (Particle Refinement): 70% width.

Right Section (Repo Context): 30% width.

Left Section: Particle Refinement
Component: Mantine Card with border, padding md.

Content:
Title: "REFINE THOSE NEXT" (uppercase, size 18px, weight 500, color #333).

Particle Suggestions:
List of suggested Particles (e.g., "src/components/NavBar.js", "src/utils/api.js", "src/components/role.js").

Each item:
Text: "- src/components/NavBar.js" (size 14px, color #333).

Button: "[Refine Now]" (Mantine Button, variant outline, size xs, color blue).

Behavior: Clicking "Refine Now" sets the input field value to the file path (e.g., "src/components/NavBar.js").

Input Field:
Mantine TextInput with placeholder "ie, Please refine events.jsx" (size 14px, color #999).

Width: Full width of the card.

Behavior: On submit (Enter key or add a Send button), call /particleThis(projectId, filePath, input) and display the result below.

Output (Optional):
If a refinement is performed, show the result below the input (e.g., "Refined: src/components/NavBar.js - This file manages navigation logic...").

Text: Size 14px, color #333, italicized.

Right Section: Repo Context
Component: Mantine Card with border, padding md.

Content:
Summary:
Title: "SUMMARY" (uppercase, size 18px, weight 500, color #333).

Details:
"Repository: getReal" (size 14px, color #333).

"Last Processed: March 31, 2025" (size 14px, color #333).

"Files analyzed: 20" (size 14px, color #333).

"Estimated tokens: 6.4k" (size 14px, color #333).

App Story:
Title: "APP STORY" (uppercase, size 18px, weight 500, color #333, margin-top 16px).

Text: "getReal is an Event app that lets you choose events based on popularity, role-based navigation, QR scanner, ticketing, deeplink..." (size 14px, color #333).

Link: "[Read More]" (Mantine Anchor, size 12px, color blue).
Behavior: Expands the text or opens a modal with the full App Story (future feature).

Create Graph:
Title: "CREATE GRAPH" (uppercase, size 18px, weight 500, color #333, margin-top 16px).

Folder List:
List of folders (e.g., "src/components", "src/hooks", "tests").

Each item: Mantine Checkbox with label (e.g., "src/components", size 14px, color #333).

Behavior: Checkboxes toggle folder selection for graphing.

Button: "Graph It" (Mantine Button, color blue, full-width, margin-top 8px).
Behavior: Calls /createGraph(projectId, path) with selected folders.

Text: "You can also create, list, load and export your graphs from your IDE" (size 12px, color #666, margin-top 8px).

4. Crawling Progress Bar
Component: Mantine Progress bar, displayed at the top of the main content (inside AppShell).

Visibility: Shown only when isCrawling state is true.

Content: "Crawling getReal... [██████████ 50%]" (size 14px, color #333).

Behavior: Updates dynamically as crawling progresses (0% to 100%).

5. Footer
Height: 60px.

Padding: 16px (Mantine’s md).

Background: Transparent (inherits beige background).

Content:
Left: "POWERED BY xAI & Cloudflare" (size 12px, color #666).

Right: Links "SUPPORT | BLOG | FAQ" (Mantine Anchor, size 12px, color blue, spaced 8px apart).

6. Repo Selection Modal
Component: Mantine Modal.

Trigger: Opens on page load if no active repo is found, or when "Add Another Repo" is clicked.

Content:
Title: "Select a Repository to Analyze" (size 18px, weight 500, color #333).

Dropdown: Mantine Select with label "Your GitHub Repositories".
Placeholder: "Choose a repo".

Options: List of repos (e.g., "getReal | $5/month - Active", "my-api | $5/month - Inactive").

Text: "Each repo costs $5/month. You’ll be redirected to payment after selection." (size 12px, color #666, margin-top 8px).

Behavior:
On selection:
If the repo is inactive, redirect to Lemon Squeezy checkout.

If the repo is active, set it as the active repo and close the modal.

State Management
activeRepo: Object storing the currently active repo (e.g., { id: 'getReal', name: 'getReal', status: 'Active', subscriptionId: 'sub_123' }).

repos: Array of all user repos (e.g., [{ id: 'getReal', name: 'getReal', status: 'Active', subscriptionId: 'sub_123' }, ...]).

repoData: Object storing the active repo’s data (Summary, App Story, folders, particles).

modalOpened: Boolean to control the repo selection modal (managed by Mantine’s useDisclosure hook).

progress: Number (0-100) for the crawling progress bar.

isCrawling: Boolean to show/hide the progress bar.

selectedFolders: Array of selected folders for graph creation (e.g., ['src/components', 'src/hooks']).

refineInput: String for the Particle refinement input field (e.g., "src/components/NavBar.js").

refineOutput: String for the refinement result (e.g., "Refined: src/components/NavBar.js - This file manages navigation logic...").

API Interactions
fetchRepos: Fetches the user’s GitHub repos via the Worker (GitHub API after OAuth).
Endpoint: Custom Worker endpoint to list repos.

Response: Array of repos with id, name, status, and subscriptionId.

fetchRepoData: Fetches the active repo’s data (Summary, App Story, folders, particles).
Endpoints:
/listGraph(projectId): For Summary (lastProcessed, files, tokens).

/appStory(projectId): For App Story.

/showParticles(projectId): For folder structure and Particle suggestions.

Response: Object with summary, appStory, folders, and particles.

crawlRepo: Triggers repo crawling.
Endpoint: /createGraph(projectId, path) (path optional if crawling the whole repo).

Behavior: Updates progress state during crawling (simulated or via WebSocket for real-time updates).

refineParticle: Refines a Particle with xAI.
Endpoint: /particleThis(projectId, filePath, input).

Response: Refined SuperParticle data (e.g., a string with the refined description).

User Flows
1. Onboarding
Step 1: User logs in via GitHub OAuth (handled on the landing page).

Step 2: Redirect to /user (UserPage).

Step 3: Check for active repo:
If none, open the repo selection modal.

If found, set activeRepo and load repo data.

Step 4: Repo selection (modal):
User selects a repo.

If inactive, redirect to Lemon Squeezy checkout (https://my-store.lemonsqueezy.com/checkout?product_id=repo_subscription&metadata[projectId]=getReal).

After payment, Lemon Squeezy webhook marks the repo as "Active" (Worker updates user profile in KV/R2).

Step 5: Crawling:
Trigger /createGraph for the selected repo.

Show progress bar (0% to 100%).

Step 6: Display UserPage with active repo data.

2. Repo Management
Switch Repo: Click an active repo in the dropdown to switch (reloads repo data).

Activate Repo: Click "Activate" on an inactive repo, redirect to Lemon Squeezy, mark as active after payment.

Deactivate Repo: Click "Deactivate" on an active repo, call Lemon Squeezy API to cancel subscription (DELETE /v1/subscriptions/{subscriptionId}), mark as inactive.

Add Repo: Click "Add Another Repo" to open the modal.

Manage Billing: Click "Manage Billing" to open Lemon Squeezy customer portal.

3. Graph Creation
Check folders in the "Create Graph" section.

Click "Graph It" to call /createGraph(projectId, path) with selected folders.

4. Particle Refinement
Click "Refine Now" on a suggestion to prefill the input field.

Enter a file path and query (e.g., "Please refine events.jsx").

Submit to call /particleThis and display the result.

Implementation Notes
Mantine Setup: Wrap the component in MantineProvider with a custom theme (beige background, blue accents).

API Integration: Replace mock API calls with real Worker endpoints (e.g., /listGraph, /appStory).

Lemon Squeezy:
Set up a "Repo Subscription" product ($5/month).

Configure a webhook to handle subscription_created and subscription_canceled events.

Use Lemon Squeezy API to fetch subscription status and generate customer portal links.

Progress Bar: For real-time crawling updates, consider WebSocket or polling the Worker for progress.

Styling: Match the mockup’s aesthetic (beige background, dark text, blue buttons/links).

Accessibility: Ensure all interactive elements (buttons, inputs, dropdowns) have proper ARIA labels.

Text-Based Mockup (For Reference)

--------------------------------------------------
| PARTICLEGRAPH                                                                     getReal ▼ |
|                                               |  | Crawling getReal... [██████████ 50%]     |
-------------------------------------------------- |                                          |
| ie, Please refine events.jsx                  |  | SUMMARY                                  |
| [Input Chat Field]                            |  | Repository: getReal                      |
|                                               |  | Last Processed: March 31, 2025           |
| REFINE THOSE NEXT                             |  | Files analyzed: 20                       |
| - src/components/NavBar.js [Refine Now]       |  | Estimated tokens: 6.4k                   |
| - src/utils/api.js [Refine Now]               |  |------------------------------------------|
| - src/components/role.js [Refine Now]         |  | APP STORY                                |
|                                               |  | getReal is an Event app that lets you    |
|                                               |  | choose events based on popularity, role- |
|                                               |  | based navigation, QR scanner, ticketing, |
|                                               |  | deeplink... [Read More]                  |
|                                               |  |------------------------------------------|
|                                               |  | CREATE GRAPH                             |
|                                               |  | ▾ src/                                   |
|                                               |  |   □ components/                          |
|                                               |  |   □ hooks/                               |
|                                               |  | □ tests/                                 |
|                                               |  | [Graph It]                               |
|                                               |  | You can also create, list, load and      |
|                                               |  | export your graphs from your IDE         |
--------------------------------------------------
| POWERED BY xAI & Cloudflare | SUPPORT | BLOG | FAQ |
--------------------------------------------------

