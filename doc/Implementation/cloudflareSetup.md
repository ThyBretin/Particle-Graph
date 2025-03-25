

Add a Domain (Optional):
ParticleGraph can run on Cloudflare’s free *.workers.dev and *.pages.dev subdomains, so this is optional.

If you have a domain (e.g., particlegraph.com):
Click “Add a Site” in the dashboard.

Enter your domain, select the free plan, and follow the DNS setup (you’ll update nameservers at your registrar—e.g., GoDaddy).

Skip this for now if you’re domain-less; we’ll use Cloudflare’s defaults.



Get Your Account ID and API Token:
From the dashboard, note your Account ID (right sidebar, under “Account Details”).
 
Go to “My Profile” (top right) > “API Tokens” > “Create Token”.
Use the “Edit Account” template.

Permissions: Include “Workers Scripts: Edit”, “R2: Edit”, “Pages: Edit”.

Click “Continue to summary” > “Create Token”.

Copy the token (e.g., abc123...) and save it somewhere safe (e.g., a text file).

Outcome: Cloudflare account ready, API token saved.
Step 2: Set Up Cloudflare Worker
Goal: Create a Worker to handle graph operations (/createGraph, /loadGraph, etc.).
Navigate to Workers:
From the dashboard, click “Workers & Pages” (left sidebar) > “Overview”.

Click “Create Worker”.

Name Your Worker:
Enter particlegraph-worker as the name.

Click “Deploy” (don’t edit the default code yet).

Test the Default Worker:
After deploying, you’ll see a URL like particlegraph-worker.your-subdomain.workers.dev.

Visit it in your browser; it should return “Hello World!” (default response).

Add Environment Variables:
Go to your Worker > “Settings” > “Variables”.

Add:
GITHUB_TOKEN: Your GitHub personal access token (create one at github.com/settings/tokens with “repo” scope).

Click “Encrypt” for security, then “Save”.

Prepare Worker Code:
For now, we’ll use a placeholder. In the Worker editor (click “Edit Code”):
javascript

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/createGraph') {
      return new Response('Graph creation placeholder', { status: 200 });
    }
    return new Response('Hello from ParticleGraph Worker!', { status: 200 });
  },
};

Click “Save and Deploy”.

Test by visiting https://particlegraph-worker.your-subdomain.workers.dev/createGraph—should see “Graph creation placeholder”.

Outcome: Worker deployed at particlegraph-worker.your-subdomain.workers.dev, ready for later code updates (Phase 2).
Step 3: Set Up Cloudflare R2
Goal: Create an R2 bucket to store graphs and library definitions.
Access R2:
Dashboard > “R2” (left sidebar) > “Overview”.

Click “Create Bucket”.

Name Your Bucket:
Enter particlegraph-data.

Click “Create”.

Test Manually (Optional):
Click into particlegraph-data > “Upload” > upload a test file (e.g., test.txt with “Hello R2”).

Note: You can’t access R2 files publicly yet—we’ll link it to the Worker later.

Bind R2 to Worker:
Go back to “Workers & Pages” > particlegraph-worker > “Settings” > “Bindings”.

Add a binding:
Type: “R2 Bucket”.

Name: R2 (this is how the Worker accesses it).

Bucket: particlegraph-data.

Click “Save”.

Update Worker Code:
Edit the Worker code:
javascript

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/createGraph') {
      await env.R2.put('graphs/test.json', JSON.stringify({ test: 'Hello R2' }));
      return new Response('Graph saved to R2', { status: 200 });
    }
    return new Response('Hello from ParticleGraph Worker!', { status: 200 });
  },
};

Save and deploy.

Visit /createGraph again—check R2 to see graphs/test.json created.

Outcome: R2 bucket particlegraph-data set up and linked to your Worker.
Step 4: Set Up Cloudflare Pages
Goal: Create a Pages project for your Vite + Mantine UI.
Create a GitHub Repo:
Go to github.com > “New Repository”.

Name: particlegraph-ui.

Public or private, initialize with a README, then click “Create Repository”.

Set Up Pages:
Dashboard > “Workers & Pages” > “Create Application” > “Pages” > “Connect to Git”.

Sign in with GitHub, authorize Cloudflare Pages.

Select particlegraph-ui repo > “Install & Authorize” > “Begin Setup”.

Configure Build:
Project Name: particlegraph-ui (auto-filled).

Production Branch: main.

Framework Preset: “Vite”.

Build Command: npm run build.

Build Output Directory: dist.

Click “Save and Deploy” (it’ll fail since the repo’s empty, but that’s fine for now).

Test the URL:
After setup, you’ll get a URL like particlegraph-ui.your-subdomain.pages.dev.

Visiting it now shows a 404 (no content yet)—we’ll add the UI in Phase 4.

Outcome: Pages project linked to particlegraph-ui repo, ready for UI deployment.
Step 5: Verify Setup
Goal: Ensure everything’s connected.
Worker: Visit particlegraph-worker.your-subdomain.workers.dev/createGraph—should save to R2.

R2: Check particlegraph-data in the dashboard for graphs/test.json.

Pages: Confirm particlegraph-ui.your-subdomain.pages.dev exists (404 is okay for now).

API Token: Keep it handy for later CLI use (optional).

