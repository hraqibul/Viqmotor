const SHEET_ID = "13O_uls4-xLKQ7enYUTGCaNGbPkSeRk2gYQUAbolek40";
const FLEET_CACHE_KEY = "fleet-json-v3";
const FLEET_CACHE_SECONDS = 300;

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "fleet";

  return jsonOutput(getFleet_());
}

function doPost(e) {
  const body = (e && e.postData && e.postData.contents) || "";

  if (body.length > 10000) {
    return jsonOutput({ ok: false, error: "Request is too large." });
  }

  let payload;
  try {
    payload = JSON.parse(body || "{}");
  } catch (error) {
    return jsonOutput({ ok: false, error: "Invalid request format." });
  }

  const booking = {
    carName: safeText_(payload.carName, 160),
    requestedDates: safeText_(payload.requestedDates, 120),
    pickupLocation: safeText_(payload.pickupLocation, 160),
    customerName: safeText_(payload.customerName, 120),
    customerPhone: safeText_(payload.customerPhone, 40)
  };

  if (!booking.carName) {
    return jsonOutput({ ok: false, error: "Car name is required." });
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Bookings");

  if (!sheet) {
    throw new Error("Bookings sheet was not found.");
  }

  const bookingId = `VIQ-${Utilities.getUuid().slice(0, 8).toUpperCase()}`;
  sheet.appendRow([
    new Date(),
    bookingId,
    booking.carName,
    booking.requestedDates,
    booking.pickupLocation,
    booking.customerName,
    booking.customerPhone,
    "Inquiry Sent",
    "",
    "",
    ""
  ]);

  return jsonOutput({ ok: true, bookingId });
}

function safeText_(value, maxLength) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

function getFleet_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(FLEET_CACHE_KEY);

  if (cached) {
    return JSON.parse(cached);
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("Fleet");
  if (!sheet) {
    throw new Error("Fleet sheet was not found.");
  }

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) {
    return [];
  }

  const headers = values.shift();
  const fleet = values
    .map(row => headers.reduce((record, header, index) => {
      record[header] = row[index] || "";
      return record;
    }, {}))
    .filter(row => String(row.Status).trim().toLowerCase() !== "maintenance")
    .map(row => {
      row["Image URL"] = resolveImageUrl_(row["Image URL"]);
      return row;
    });

  cache.put(FLEET_CACHE_KEY, JSON.stringify(fleet), FLEET_CACHE_SECONDS);
  return fleet;
}

function resolveImageUrl_(imageUrl) {
  const url = String(imageUrl || "").trim();

  if (isGoogleDriveUrl_(url)) {
    return resolveGoogleDriveImage_(url);
  }

  if (isGooglePhotosUrl_(url)) {
    return resolveGooglePhotosImage_(url);
  }

  return url;
}

function resolveGoogleDriveImage_(shareUrl) {
  const fileIdMatch = shareUrl.match(/(?:\/file\/d\/|[?&]id=|[?&]id%3D)([a-zA-Z0-9_-]+)/);
  return fileIdMatch
    ? `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1600`
    : shareUrl;
}

function isGoogleDriveUrl_(value) {
  return String(value || "").includes("drive.google.com/");
}

function resolveGooglePhotosImage_(shareUrl) {
  try {
    const html = UrlFetchApp.fetch(shareUrl, {
      followRedirects: true,
      muteHttpExceptions: true
    }).getContentText();
    const matches = html.match(/https:\/\/(?:lh3\.googleusercontent\.com|photos\.fife\.usercontent\.google\.com)\/[^"'\\\s]+/g) || [];
    const imageUrl = matches.find(url => url.includes("=w") || url.includes("=s") || url.includes("authuser"));
    return imageUrl ? imageUrl.replace(/\\u003d/g, "=") : shareUrl;
  } catch (error) {
    return shareUrl;
  }
}

function isGooglePhotosUrl_(value) {
  const url = String(value || "");
  return url.includes("photos.google.com/share/")
    || url.includes("photos.app.goo.gl/");
}

function jsonOutput(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
