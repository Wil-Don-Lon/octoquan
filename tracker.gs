// ─────────────────────────────────────────────────────────────────
//  QR Scan Tracker — Google Apps Script
//  Paste this entire file into script.google.com, then Deploy.
//  See SETUP.md for step-by-step instructions.
// ─────────────────────────────────────────────────────────────────

// ← Paste your ticketing / show page URL here
var DESTINATION_URL = "https://your-show-ticketing-url.com";

// Friendly names for each variant (keep in sync with generate_qr.py)
var VARIANT_LABELS = {
  "poster1_on_campus":  { label: "Poster 1 — On Campus",  style: "1", location: "On Campus"  },
  "poster1_off_campus": { label: "Poster 1 — Off Campus", style: "1", location: "Off Campus" },
  "poster2_on_campus":  { label: "Poster 2 — On Campus",  style: "2", location: "On Campus"  },
  "poster2_off_campus": { label: "Poster 2 — Off Campus", style: "2", location: "Off Campus" },
  "poster3_on_campus":  { label: "Poster 3 — On Campus",  style: "3", location: "On Campus"  },
  "poster3_off_campus": { label: "Poster 3 — Off Campus", style: "3", location: "Off Campus" },
};

// ─────────────────────────────────────────────────────────────────
//  doGet — called every time a QR code is scanned
// ─────────────────────────────────────────────────────────────────
function doGet(e) {
  var variantId = e.parameter.variant || "unknown";
  var meta      = VARIANT_LABELS[variantId] || { label: variantId, style: "?", location: "?" };

  // log the scan to the sheet
  logScan(variantId, meta);

  // redirect the phone to the real destination
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
    // Note: Apps Script can't do a true HTTP redirect, so we use
    // an HTML meta-refresh instead:
}

// Apps Script can't return a 302, so we use an HTML redirect page
function doGet(e) {
  var variantId = e.parameter.variant || "unknown";
  var meta      = VARIANT_LABELS[variantId] || { label: variantId, style: "?", location: "?" };

  logScan(variantId, meta);

  var html = HtmlService.createHtmlOutput(
    '<html><head>' +
    '<meta http-equiv="refresh" content="0;url=' + DESTINATION_URL + '">' +
    '</head><body>' +
    '<p>Redirecting... <a href="' + DESTINATION_URL + '">click here if not redirected</a></p>' +
    '</body></html>'
  );
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

// ─────────────────────────────────────────────────────────────────
//  logScan — appends a row to the "Scans" sheet
// ─────────────────────────────────────────────────────────────────
function logScan(variantId, meta) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Scans") || ss.insertSheet("Scans");

  // write headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Variant ID", "Poster Style", "Location", "Label"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  var now = new Date();
  sheet.appendRow([
    Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    variantId,
    meta.style,
    meta.location,
    meta.label,
  ]);
}

// ─────────────────────────────────────────────────────────────────
//  setupSummarySheet — run this ONCE manually from the editor
//  (Run → setupSummarySheet) to create a live summary tab
// ─────────────────────────────────────────────────────────────────
function setupSummarySheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Summary") || ss.insertSheet("Summary");

  sheet.clearContents();

  // headers
  sheet.getRange("A1:D1").setValues([["Variant", "Style", "Location", "Scan Count"]]);
  sheet.getRange("A1:D1").setFontWeight("bold");
  sheet.setFrozenRows(1);

  var variants = Object.keys(VARIANT_LABELS);
  for (var i = 0; i < variants.length; i++) {
    var vid  = variants[i];
    var meta = VARIANT_LABELS[vid];
    var row  = i + 2;
    // COUNTIF formula that counts rows in Scans!B where variant matches
    sheet.getRange(row, 1).setValue(meta.label);
    sheet.getRange(row, 2).setValue(meta.style);
    sheet.getRange(row, 3).setValue(meta.location);
    sheet.getRange(row, 4).setFormula('=COUNTIF(Scans!B:B,"' + vid + '")');
  }

  // totals row
  var totalRow = variants.length + 2;
  sheet.getRange(totalRow, 1).setValue("TOTAL").setFontWeight("bold");
  sheet.getRange(totalRow, 4).setFormula('=SUM(D2:D' + (totalRow - 1) + ')').setFontWeight("bold");

  SpreadsheetApp.getUi().alert("Summary sheet ready! It updates automatically as scans come in.");
}
