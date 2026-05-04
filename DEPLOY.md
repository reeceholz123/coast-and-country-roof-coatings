# Deploy Guide · Coast and Country Roof Coatings

Step-by-step from local folder → live site at coastandcountryroofcoatings.com.au.

This is the **Claude Code → GitHub → Netlify** workflow. Once it's set up, every change you make in Claude Code can be pushed to GitHub with one command, and Netlify auto-deploys to the live site within ~30 seconds.

---

## 0. Prerequisites (one-time, takes ~10 minutes)

You'll need:

- **A GitHub account.** Free at [github.com](https://github.com). Sign up with the email you want associated with the project.
- **A Netlify account.** Free at [netlify.com](https://netlify.com). Sign up with **"Sign up with GitHub"** so the two are connected from day one.
- **Git installed.** On Mac it's already there. On Windows install [Git for Windows](https://git-scm.com/download/win). To check: open Terminal/PowerShell and run `git --version`.
- **Claude Code installed.** Run `npm install -g @anthropic-ai/claude-code` then `claude` in your project folder. Full setup at [docs.claude.com/claude-code](https://docs.claude.com/en/docs/claude-code).

---

## 1. Connect this folder to Claude Code

1. Unzip the project folder somewhere sensible (e.g. `~/Sites/coast-and-country-roof-coatings`).
2. In Terminal:

   ```bash
   cd ~/Sites/coast-and-country-roof-coatings
   claude
   ```

   That opens Claude Code in this folder. From here you can ask Claude to make any tweak — copy changes, image swaps, palette tuning, new suburb pages — and it'll edit the files directly.

3. Try a small test: ask Claude something like **"What's in this project?"** to confirm it's reading the codebase. Then move on.

---

## 2. Push the project to GitHub

The first time only. After this, every change is just `git add` + `git commit` + `git push`.

### 2a. Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `coast-and-country-roof-coatings`
3. **Visibility:** Private is fine. You can flip it public later if you want.
4. **Do NOT tick** "Add a README", "Add .gitignore", or "Choose a license" — we already have what we need.
5. Click **Create repository**.

GitHub will show you a screen with commands. Ignore most of it. The bits you need are below.

### 2b. Initialise and push from your local folder

In Terminal, from inside the project folder:

```bash
git init
git add .
git commit -m "Initial site build · Coast and Country Roof Coatings"

git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/coast-and-country-roof-coatings.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username. The first push may ask you to authenticate — easiest way is to install [GitHub CLI](https://cli.github.com/) (`brew install gh` on Mac) then run `gh auth login` once.

After the push completes, refresh your GitHub repo page. You should see all the files there.

---

## 3. Connect Netlify to the GitHub repo

1. Go to [app.netlify.com](https://app.netlify.com) and log in.
2. Click **Add new site → Import an existing project**.
3. Pick **GitHub** as the provider. Authorise Netlify if prompted.
4. Select the `coast-and-country-roof-coatings` repo.
5. **Branch to deploy:** `main`
6. **Build command:** *(leave blank)*
7. **Publish directory:** *(leave blank, or just `.`)*
8. Click **Deploy**.

About 30 seconds later Netlify gives you a live URL like `https://random-words-12345.netlify.app`. The site is live.

### 3a. Rename the Netlify subdomain (optional but tidier)

In Netlify: **Site configuration → Change site name** → make it `coast-and-country-roof-coatings` (or whatever's free). The URL becomes `https://coast-and-country-roof-coatings.netlify.app`. Useful for testing before the real domain points here.

---

## 4. Point coastandcountryroofcoatings.com.au at Netlify

1. In Netlify: **Domain management → Add a custom domain** → enter `coastandcountryroofcoatings.com.au`.
2. Netlify will tell you the DNS records to set. Two paths:

   **Easier — let Netlify host the DNS:** point your domain's nameservers at Netlify's. Netlify gives you four nameserver addresses; you set those at your registrar (e.g. Crazy Domains, GoDaddy, Namecheap, wherever the domain is registered). Takes ~24 hrs to propagate fully. After that, every DNS change is in Netlify.

   **Manual — keep DNS at your registrar:** add the records Netlify shows you (typically an `A` record pointing to a Netlify IP, plus a `CNAME` for `www`). Faster initial setup, but every future tweak means logging back into the registrar.

3. Once DNS resolves, Netlify auto-issues a free SSL certificate via Let's Encrypt. The site loads at `https://coastandcountryroofcoatings.com.au` without any extra setup.

---

## 5. The everyday workflow (after setup)

This is what you do every time you (or Claude Code) make a change:

```bash
# From inside the project folder:
git add .
git commit -m "Short description of what changed"
git push
```

Within ~30 seconds Netlify redeploys, and the live site reflects the change.

If you want Claude Code to push for you, just say **"commit and push these changes with the message 'updated reviews'"** and it'll run those three commands.

---

## 6. Hooking up Netlify Forms (quote form + popup)

The site already has Netlify Forms wired in. You don't need to do anything for it to start working — Netlify auto-detects the hidden `<form name="quote">` blocks at the top of `index.html` on first deploy.

To see submissions:

1. In Netlify: **Forms** in the left nav.
2. You'll see two forms: `quote` and `lead-popup`.
3. Submissions appear here. You can also enable **Email notifications** (Forms → Notifications → Add notification → Email) so Bryce gets an email every time someone submits.

**Set up the email notification:**
- Notification type: **Email notification**
- Form: `quote` (then repeat for `lead-popup`)
- Email to notify: `bstewart2009@live.com.au`
- Save. Test by submitting the form on the live site.

---

## 7. Pre-launch checklist

Before pointing the domain over, walk through this list:

- [ ] **Logo finalised.** Bryce picks one of the 20 mockups. Drop the PNG/SVG into `images/` and replace the wordmark in the header (`<span class="brand-text">Coast &amp; Country<small>Roof Coatings</small></span>` → `<img src="images/logo.png" alt="Coast and Country Roof Coatings">`). Same swap in the mobile drawer and footer.
- [ ] **Favicon set generated.** Use [favicon.io](https://favicon.io) — drop the logo in, download the `.zip`, drop the files into `images/`.
- [ ] **ABN supplied.** Search the codebase for `ABN XX XXX XXX XXX` and replace.
- [ ] **Auto-playing video supplied** (the clip from the old C&C site Bryce mentioned). Drop into `images/process-video.mp4`. Already wired into the source — will start playing automatically once the file exists.
- [ ] **Facebook URL confirmed.** Search for `facebook.com/coastandcountryroofcoatings` and replace if the real handle differs.
- [ ] **Instagram URL confirmed.** Search for `instagram.com/coastandcountryroofcoatings` and replace if needed.
- [ ] **Image compression.** Several photos are over 1 MB. Run them through [Squoosh](https://squoosh.app) or ImageOptim before launch. Target 200-400 KB each, 1600px max width.
- [ ] **Test the form.** Submit a real quote on the live site, confirm the email lands in `bstewart2009@live.com.au`.
- [ ] **Test on mobile.** Open the live URL on Bryce's phone, scroll the whole site, tap the call button, tap "Get a Quote", make sure the popup works.
- [ ] **301 redirects from the old site.** The old C&C site has these URLs indexed by Google: `/news/`, `/specials/`, `/testimonials/`, `/dulux-accredited-painter-roof-restoration-hunter-valley/`, `/roof-and-driveway-restoration-package-newcastle/`. Set up `_redirects` in the project root mapping them all to `/`:

   ```
   /news/                                                     /  301
   /specials/                                                 /  301
   /testimonials/                                             /  301
   /dulux-accredited-painter-roof-restoration-hunter-valley/  /  301
   /roof-and-driveway-restoration-package-newcastle/          /  301
   /winter-roofing-restoration-special/                       /  301
   /roof-restoration-dulux-acratex-roofing-system-info/       /  301
   /index.php                                                 /  301
   /about.php                                                 /#about  301
   /services.php                                              /#services  301
   /gallery.php                                               /#work  301
   /cpage.php                                                 /#quote  301
   ```

   Commit, push, done. Old Google links will land on the new site without a 404.

---

## 8. Common Claude Code commands you'll use a lot

```bash
# Edit a specific file with Claude
claude "update the hero copy to lead with 'Hunter-region roof restoration done properly'"

# Add a new suburb landing page
claude "create a new service-area page for Newcastle, mirroring the Raymond Terrace one"

# Swap the palette
claude "the final logo is locked in — change --brand to #1A3A6B and --accent to #3DA5E0"

# Compress all images in /images
claude "run an image compression pass on /images using cwebp; target 250KB each"
```

Claude Code will edit the files directly. Then `git add . && git commit -m "..." && git push` and you're live.

---

## 9. If something breaks

- **Site shows a 404 after deploy.** Check the Netlify build log (Site overview → Deploys → click the latest one). Usually a typo in a filename or a missing folder. Fix locally, commit, push.
- **Form submissions aren't arriving.** Check Netlify Forms is enabled (Site configuration → Forms → toggle on). Then check the email notification is set up (step 6).
- **CSS or JS not loading.** Likely a relative-path issue. The site uses `css/main.css` and `js/main.js` — those paths are relative, so they only work if the visitor is at `/` or a same-level page. Don't move files to subfolders without updating the paths.
- **DNS not resolving.** Allow 24 hours for full propagation. Use [whatsmydns.net](https://whatsmydns.net) to check from multiple regions.

---

## 10. Files in this project that are safe to share publicly

If the GitHub repo goes public, this is what visitors will see:

✅ All HTML, CSS, JS — fine to be public
✅ Images in `/images` — already going to be public on the live site
✅ README.md, DEPLOY.md — fine

❌ Do NOT commit anything containing:
- API keys, passwords, or tokens
- Real customer data (names + addresses + phone numbers in plain text)
- The actual ABN if Bryce considers it sensitive

The current build has zero secrets. You're safe to push as-is.

---

That's the whole pipeline. Once steps 0-4 are done once, every future change is `git push` and you're live in 30 seconds.
