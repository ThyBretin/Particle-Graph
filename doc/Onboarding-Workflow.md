Onboarding Workflow
1. User Flow Overview
Here’s how I envision the onboarding process after the user signs up/logs in, based on your draft and requirements:
Landing Page → Sign Up/Login: The user starts on the landing page (already drafted), signs up or logs in via GitHub OAuth (as per the blueprint).

Redirect to UserPage: After successful login, the user is redirected to the UserPage.

First-Time Modal (Repo Selection): If the user hasn’t selected a repo yet (first-time user or no active repos), a modal pops up to select a repo.

Crawling Progress: Once a repo is selected, a progress bar appears (either in the modal or on the UserPage) to show the crawling status.

UserPage with Active Repo: After crawling completes, the UserPage loads with the active repo’s data (Summary, App Story, etc.).

2. Detailed Steps
Step 1: Redirect to UserPage
Behavior: After login, the user is immediately redirected to the UserPage (/user route, for example).

Why: This keeps the flow seamless—users expect to jump into the app after login, and the UserPage is the core of the experience.

Step 2: First-Time Modal for Repo Selection
Trigger: On UserPage load, check if the user has an active repo (e.g., via a backend call to /listGraph or a user profile flag).

Modal Content:
Title: "Select a Repository to Analyze"

Repo List: A dropdown or list of the user’s GitHub repos (fetched via GitHub API after OAuth).
Example: 

my-project | $5/month - Inactive
my-api     | $5/month - Inactive

Billing Note: "Each repo costs $5/month. You’ll be redirected to payment after selection."

Button: "Select and Activate" (disabled until a repo is chosen).

Post-Selection:
Redirect to Lemon Squeezy for payment (more on this below).

After payment, the repo is marked as "Active" and crawling begins.

Step 3: Crawling Progress
Where: On the UserPage (not in the modal, to keep the modal focused on selection).

UI: A progress bar at the top of the UserPage (or overlaying the content).
Example: 

Crawling my-project... [██████████ 50%] (100/200 files)

Backend: Triggered by /createGraph(projectId) after repo selection and payment.

Completion: Once crawling finishes, the progress bar disappears, and the UserPage populates with the repo’s data (Summary, App Story, Graph Picker, etc.).

Step 4: UserPage with Active Repo
The UserPage now shows the active repo’s data, as in your draft:
Summary: "Repository: my-project | Last Processed: March 31, 2025 | Files analyzed: 20 | Estimated tokens: 6.4k".

App Story: "my-project is an Event app that lets you choose events based on popularity, role-based navigation, QR scanner, ticketing, deeplink...".

Graph Picker: Folder tree for creating graphs.

Particle Refinement: Input field and suggestions

