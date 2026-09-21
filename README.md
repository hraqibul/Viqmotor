# VIQ Motor Empire

A lightweight, mobile-first static car rental website for VIQ Motor Empire.

The website is designed to convert visitors into WhatsApp enquiries and car rental bookings.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript

Fleet and booking data are provided by the Google Apps Script Web App in `backend/Code.gs`. The frontend remains a static HTML/CSS/JavaScript site, and booking conversations happen through WhatsApp.

## Backend setup

1. Create a Google Sheet with `Fleet` and `Bookings` tabs.
2. Add this header row to `Fleet`: `Car Name`, `Category`, `Price Per Day`, `Deposit`, `Pickup Location(s)`, `Image URL`, `Status`, `Description`. Optional compatibility columns are `Year`, `Transmission`, `Fuel`, `Seats`, and `Tags`.
3. Add this header row to `Bookings`: `Timestamp`, `Booking ID`, `Car Name`, `Requested Dates`, `Pickup Location`, `Customer Name`, `Customer Phone`, `Status`, `UID`, `Deposit Status`, `Payment Status`.
4. Replace `SHEET_ID` in `backend/Code.gs`, deploy it as a Web App, and allow access for anyone who needs to inquire.
5. Replace `FLEET_WEB_APP_URL` in `js/script.js` with the deployed `/exec` URL.

For `Image URL`, use a direct public image URL where possible. Public Google Drive links are converted automatically from common sharing formats, and Google Photos share links are resolved when Google exposes a public image asset. For Drive, set the file's General access to **Anyone with the link / Viewer**. Google Photos links can be less reliable than direct hosted image files, so GitHub-hosted images or a dedicated image CDN are preferred for production.

The Web App serves fleet JSON from `?action=fleet` and stores WhatsApp booking attempts through `POST`. WhatsApp opens immediately without waiting for the booking POST. The `UID` column is retained only for compatibility with existing Sheet data.

## GitHub Pages deployment

This is a static site and can be hosted directly from GitHub Pages.

1. Create a new GitHub repository. Keep it private until you have reviewed the public files, then choose **Public** if you are using GitHub Pages on your plan.
2. Upload the contents of this folder to the repository root. `index.html` must be in the root.
3. Open **Settings > Pages** in the repository.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main`, choose `/ (root)`, and save.
5. Wait for the deployment. GitHub will provide a temporary `github.io` URL.

### Custom domain

For an apex domain such as `example.com`, add these DNS records at your domain provider:

```text
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
```

For `www.example.com`, add:

```text
CNAME  www    YOUR-USERNAME.github.io
```

Then enter the custom domain under **Settings > Pages > Custom domain** and enable **Enforce HTTPS** after GitHub verifies the DNS records. Do not add a proxy or redirect that downgrades HTTPS.

After the domain is known, add a root-level file named `CNAME` containing only the hostname, for example `www.example.com`. Replace every `example.com` placeholder in `index.html`, `contact.html`, `robots.txt`, and `sitemap.xml` with the real domain, then submit the sitemap in Google Search Console.

### Security checklist

- Never commit Google account credentials, service-account keys, passwords, or private tokens. The Sheet ID and Apps Script Web App URL are not secret credentials.
- Keep the Apps Script deployed as **Execute as: Me** and **Who has access: Anyone** only because the public site needs it. Validate POST fields and reject oversized or malformed requests before writing to Sheets.
- Keep the Apps Script URL on HTTPS and use `fetch` with `keepalive`; do not add HTTP endpoints.
- Enable **Enforce HTTPS** in GitHub Pages and use HTTPS for the custom domain, image URLs, maps, WhatsApp, and social links.
- Review the public repository before publishing. Remove drafts, exports, credentials, and unrelated files.
- GitHub Pages does not provide custom response headers such as CSP, HSTS, or `X-Frame-Options`. For stronger header-based protection, put the domain behind Cloudflare and configure HSTS, a restrictive CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and frame protection there.
- The Apps Script endpoint is public and can be abused for spam. Add server-side validation, rate limiting, and/or a honeypot before treating the Sheet as a trusted booking system.
## Project Structure

```text
viq-motor-empire/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   ├── hero-car.webp
│   ├── myvi.webp
│   ├── altis.webp
│   ├── city.webp
│   └── saga.webp
├── robots.txt
├── sitemap.xml
└── README.md