# Ran Studio — GitHub → Vercel

This is a static site. Upload the files in this folder to the root of your GitHub repository and push the commit. Vercel can deploy the repository directly with no build command required.

Important fixes in this version:
- Scroll reveal animation system removed completely.
- Deferred `content-visibility` rendering removed.
- Jasa Website / Template no longer uses a 200% horizontal slider.
- Switching to Template does not call `scrollTo()` or force a page jump.
- Template and agency panels use a stable single-panel layout on desktop and mobile.
- Existing pricing, checkout, domain options, WhatsApp flow, portfolio, and theme toggle are preserved.

Recommended Vercel settings for this static repository:
- Framework Preset: Other
- Build Command: leave empty
- Output Directory: leave empty
