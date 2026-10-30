# Vedant — Creative Portfolio Website

A responsive, no-build-step portfolio starter for a video editor, cinematographer and graphic designer. Built with HTML, CSS and vanilla JavaScript. It works locally with starter project data and can optionally load published projects from Supabase (PostgreSQL).

## 1. What is included

- Responsive one-page portfolio layout for desktop, tablet and mobile.
- Home/intro, selected work, about, services/tools and contact sections.
- Project category filters: editing, cinematography, graphic design and photography.
- Project preview dialog with YouTube embedding and image previews.
- Starter project cards and locally stored SVG thumbnails.
- Contact/social links editable in `js/config.js`.
- Optional Supabase/PostgreSQL integration.
- SQL schema and read-only public access policy in `sql/supabase-setup.sql`.
- No npm, bundler or local database installation required.

## 2. Open it in VS Code

1. Extract `vedant-portfolio.zip`.
2. Open VS Code.
3. Select **File → Open Folder**.
4. Choose the extracted `vedant-portfolio` folder.
5. Open `index.html` and install the VS Code extension **Live Server** if you do not already have it.
6. Right-click `index.html` and choose **Open with Live Server**.
7. Your browser should open the local preview, usually at `http://127.0.0.1:5500`.

You can also open `index.html` directly in a browser, but Live Server is recommended while developing.

## 3. Personalise the website first

### A. Update contact and social links

Open `js/config.js` and change:

- `contactEmail`
- `instagramUrl`
- `youtubeUrl`
- `linkedinUrl`

Use your actual profile URLs. These details are displayed in the footer/contact section.

### B. Add your photograph

The About section currently uses a designed placeholder with the letter V. To use your own photograph:

1. Copy your photo into `assets/images/`.
2. Name it `profile.jpg` (or another name you prefer).
3. In `index.html`, find `<div class="portrait-placeholder">` and replace that block with:

```html
<div class="portrait-photo">
  <img src="assets/images/profile.jpg" alt="Portrait of Vedant">
</div>
```

4. Add this CSS to the bottom of `css/style.css`:

```css
.portrait-photo {
  aspect-ratio: .82 / 1;
  max-height: 500px;
  overflow: hidden;
}
.portrait-photo img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
```

### C. Replace starter projects

Open `js/projects.js`. Each project object has:

- `title`: project name.
- `category`: `editing`, `cinematography`, `graphic-design` or `photography`.
- `description`: short project description.
- `client` and `year`: optional supporting information.
- `thumbnailUrl`: thumbnail image path or URL.
- `mediaType`: `video` or `image`.
- `mediaUrl`: YouTube URL for video projects; image URL/path for image projects.

For a YouTube project, paste a normal link such as `https://www.youtube.com/watch?v=VIDEO_ID`. The site converts it to an embed link in the preview dialog. For a YouTube Short, paste its normal Shorts URL.

For an image project, set `mediaType` to `image` and `mediaUrl` to the image path, for example `assets/images/my-poster.webp`.

Copy image files into `assets/images/`. Prefer compressed WebP or JPG images; avoid unnecessarily large files.

The supplied projects and graphics are starter examples, not actual client work. Replace their names, descriptions, thumbnails and links before sharing the portfolio professionally.

## 4. Optional: connect PostgreSQL with Supabase

You can skip this section initially. The site works with `js/projects.js` without a database.

1. Create a free Supabase account at https://supabase.com/.
2. Create a new project and save the database password securely.
3. In the Supabase dashboard, open **SQL Editor**.
4. Open `sql/supabase-setup.sql` in VS Code, copy its contents and run them in the Supabase SQL Editor.
5. Open the project **Connect** dialog, or go to **Settings → API Keys**. Copy the Project URL and the **publishable key** (older projects may label the public browser key as `anon`).
6. Open `js/config.js` and paste them into `supabaseUrl` and `supabasePublishableKey`.
7. In Supabase, open **Table Editor → portfolio_projects → Insert row**.
8. Add a project. Set `is_published` to `true` when it is ready to appear. Use one of the allowed category values and `media_type` must be `video` or `image`.
9. Reload the website. When Supabase credentials are configured and there are published rows, the site loads those rows. If credentials are blank, a request fails, or there are no published rows, it uses the local starter projects.

### Example database values

- `title`: Podcast Episode 01
- `category`: editing
- `description`: Multi-camera podcast edit and audio clean-up.
- `thumbnail_url`: https://your-image-host.com/podcast-cover.webp
- `media_url`: https://www.youtube.com/watch?v=YOUR_VIDEO_ID
- `media_type`: video
- `client_name`: Podcast / YouTube
- `year`: 2026
- `is_published`: true
- `sort_order`: 1

### Important database security

- The SQL enables Row Level Security (RLS) and permits public visitors to select only rows where `is_published = true`.
- Add, edit and delete portfolio records using your Supabase dashboard. This starter does not include a public admin panel.
- Only put the Supabase publishable key (or legacy anon public key) in `js/config.js`.
- Never put a Supabase secret key or `service_role` key in browser code. Those keys bypass normal protections.
- Keep the RLS policy enabled. Do not grant public visitors insert, update or delete access.

## 5. Publish it online for free using GitHub + Cloudflare Pages

### A. Put the project on GitHub

1. Create/sign in to a GitHub account: https://github.com/.
2. Create a new repository. Name it `vedant-portfolio`.
3. In VS Code, open **Terminal → New Terminal** in the project folder.
4. Run these commands one by one. Replace `YOUR_GITHUB_USERNAME` with your GitHub username:

```bash
git init
git add .
git commit -m "Initial portfolio website"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/vedant-portfolio.git
git push -u origin main
```

If Git asks you to identify yourself, configure your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Then repeat the commit/push commands if necessary. GitHub may ask you to sign in in a browser.

### B. Deploy through Cloudflare Pages

1. Create/sign in to Cloudflare: https://dash.cloudflare.com/.
2. Open **Workers & Pages** and choose to create an application/project.
3. Choose **Pages** and connect to Git.
4. Authorise GitHub and select the `vedant-portfolio` repository.
5. Set the production branch to `main`.
6. Set the framework preset to **None** (or **No framework**).
7. Set the build command to `exit 0` if the dashboard requires a command; otherwise leave it empty.
8. Set the build output directory to `/` or `.` as accepted by the dashboard. The root must contain `index.html`.
9. Deploy.
10. Cloudflare provides a public `*.pages.dev` URL. Open it on your phone using mobile data to test that it is publicly accessible.

Cloudflare's dashboard labels may change. Follow its current Pages flow and ensure the deployed output points to the repository root (where `index.html` is located).

### C. Publish later changes

After editing files in VS Code, run:

```bash
git add .
git commit -m "Update portfolio"
git push
```

Cloudflare Pages will automatically deploy the new commit.

## 6. Before sharing your portfolio

- Replace every starter project with real work you are allowed to show.
- Add your real portrait and contact information.
- Check all YouTube links in the project preview dialog.
- Test filters and the navigation menu.
- Check the site on a phone and a desktop browser.
- Test the public Cloudflare URL in a private/incognito window.
- Make sure your Supabase project has RLS enabled and only intended work is published.

## 7. Troubleshooting

**Projects do not appear:** Open browser developer tools (F12) and check Console. If using Supabase, verify the Project URL, publishable key, SQL setup and `is_published = true`. If Supabase has no published records, the local examples should be shown.

**YouTube preview is blank:** Use a normal YouTube watch URL or `youtu.be` URL and confirm that the video owner permits embedding.

**Images do not load:** Verify the path and capitalisation. A local image path should be relative to the website root, for example `assets/images/my-image.webp`.

**Cloudflare shows a 404:** Confirm the deployed repository root contains `index.html`, and that the Pages output directory points to that root.

**Changes are not online:** Check that `git push` completed successfully and that Cloudflare's latest deployment succeeded.

---

This project intentionally uses plain HTML, CSS and JavaScript. No Node.js or build command is required to run it.
#   v e d a n t - p o r t f o l i o  
 #   v e d a n t - p o r t f o l i o  
 