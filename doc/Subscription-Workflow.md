Subscription Workflow with Lemon Squeezy
Why Lemon Squeezy?
Lemon Squeezy is a great choice—it’s developer-friendly, handles payments, subscriptions, and tax compliance, and provides a simple API for managing subscriptions. It’s perfect for a lean MVP.
Lean Subscription Workflow
Here’s a straightforward approach to manage subscriptions without overcomplicating the system:
Repo Selection:
User selects a repo in the modal (or via "Add Another Repo").

If the repo isn’t active, they’re redirected to Lemon Squeezy.

Lemon Squeezy Checkout:
Redirect: Use Lemon Squeezy’s hosted checkout. Redirect the user to a pre-configured checkout URL (e.g., https://my-store.lemonsqueezy.com/checkout?product_id=repo_subscription&metadata[projectId]=my-project).

Product Setup: In Lemon Squeezy, create a product called "Repo Subscription" ($5/month).

Metadata: Pass the projectId (e.g., "my-project") in the checkout URL to tie the subscription to the repo.

User Experience: The user enters payment details on Lemon Squeezy’s secure page and subscribes.

Webhook for Confirmation:
Setup: Configure a webhook in Lemon Squeezy to notify your backend (Cloudflare Worker) when a subscription is created, updated, or canceled.

Event: On subscription_created, the webhook sends data (e.g., subscription_id, projectId from metadata).

Backend: Your Worker updates the user’s profile (e.g., in KV or R2) to mark the repo as "Active" and stores the subscription_id for future management.

Deactivation:
User Action: User clicks "Deactivate" in the dropdown.

Backend: Worker calls Lemon Squeezy API (DELETE /v1/subscriptions/{subscription_id}) to cancel the subscription.

Webhook: Lemon Squeezy notifies your backend (subscription_canceled), and you mark the repo as "Inactive".

User Management:
Subscription Status: Fetch the user’s active subscriptions via Lemon Squeezy API (GET /v1/subscriptions) to display in the dropdown (e.g., "Active" or "Inactive").

Self-Service: Lemon Squeezy provides a customer portal (you can generate a portal URL via API). Add a "Manage Billing" link in the dropdown that redirects to the portal, where users can update payment methods, view invoices, or cancel subscriptions themselves.

