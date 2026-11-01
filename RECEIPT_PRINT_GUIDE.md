# Pre-Printed Receipt Stationery Calibration Guide

This guide explains how receipt printing works for **Paul Drycleaners POS** with the pre-printed stationery pad, and where to adjust placements for any field.

---

## 1. How It Works

1. **Pre-printed Stationery Mode (Default)**:
   - When printing on the official Paul Drycleaners printed pad (A5 size), the application prints **only the dynamic text values** (Receipt Number, Dates, Customer Name, Mobile, Address, Garment Items, Notes, Total Amount).
   - No logos, blue borders, or labels are printed, preventing double-printing on top of your stationery pad.
   - On screen, a faint outline of the stationery pad is displayed to help you verify alignment before printing.

2. **Plain Paper Mode**:
   - If you ever run out of printed pads or want to print on blank A5 paper, click **"🖨️ Plain Paper (Full Design)"** on the print screen. This prints the complete design including logos, borders, headers, and footer.

---

## 2. Where to Make Changes to Field Placements

All field placements are configured in:
👉 [`src/print/preprinted.css`](file:///c:/Users/naman/Downloads/paul-drycleaners-pos-fixed-v2/paul-drycleaners-pos-main/src/print/preprinted.css)

Open this file and you will find clear CSS variables in millimeters (`mm`) for every single element on the receipt.

### Rules for Adjusting:
- **Move DOWN**: Increase the `top` value (e.g. `49.5mm` ➔ `51.5mm` moves down by 2mm).
- **Move UP**: Decrease the `top` value (e.g. `49.5mm` ➔ `47.5mm` moves up by 2mm).
- **Move RIGHT**: Increase the `left` value (e.g. `24mm` ➔ `26mm` moves right by 2mm).
- **Move LEFT**: Decrease the `left` value (e.g. `24mm` ➔ `22mm` moves left by 2mm).

---

## 3. Field Placement Reference Table

| Field on Pad | CSS Variable in `src/print/preprinted.css` | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **Receipt No** | `--po-receipt-no-top`<br>`--po-receipt-no-left` | `36mm`<br>`28mm` | Box under header, right of "RECEIPT NO." |
| **Date of Receipt** | `--po-date-receipt-top`<br>`--po-date-receipt-left` | `38.5mm`<br>`56mm` | Center box under "DATE OF RECEIPT" |
| **Date of Delivery** | `--po-date-delivery-top`<br>`--po-date-delivery-left` | `38.5mm`<br>`100mm` | Right box under "DATE OF DELIVERY" |
| **Customer Name** | `--po-name-top`<br>`--po-name-left`<br>`--po-name-max-width` | `49.5mm`<br>`24mm`<br>`64mm` | Top row of customer box, after "Name" label |
| **Customer Mobile** | `--po-mobile-top`<br>`--po-mobile-left`<br>`--po-mobile-max-width` | `49.5mm`<br>`103mm`<br>`38mm` | Top row of customer box, after "Mobile" label |
| **Customer Address** | `--po-address-top`<br>`--po-address-left`<br>`--po-address-max-width` | `57.5mm`<br>`28mm`<br>`112mm` | Second row of customer box, after "Address" label |
| **Items Table (Start)** | `--po-items-top`<br>`--po-item-row-height` | `75.5mm`<br>`6.8mm` | Top vertical position where item list begins, and line spacing |
| **Particulars Column** | `--po-col-particulars-left`<br>`--po-col-particulars-width` | `11mm`<br>`84mm` | Garment type and service column |
| **Quantity Column** | `--po-col-qty-left`<br>`--po-col-qty-width` | `98mm`<br>`15mm` | Item count column |
| **Amount Column** | `--po-col-amount-left`<br>`--po-col-amount-width` | `116mm`<br>`22mm` | Price column (aligned to right) |
| **Notes** | `--po-notes-top`<br>`--po-notes-left` | `170.5mm`<br>`26mm` | Bottom-left box after "Notes :" label |
| **Total Amount** | `--po-total-top`<br>`--po-total-left`<br>`--po-total-width` | `170mm`<br>`116mm`<br>`22mm` | Bottom-right box after "Total Amount" label |

---

## 4. Quick Whole-Sheet Calibration (Settings Page)

If every field prints slightly off in the same direction (e.g. your printer feeds paper 2mm too late or too early), you do **not** need to edit the CSS file:

1. In the app, navigate to **Settings** (`/settings`).
2. Click **Edit settings**.
3. Under **Pre-printed Stationery Calibration**:
   - **Receipt Global Top Offset (mm)**: Shifts the entire page up (negative) or down (positive).
   - **Receipt Global Left Offset (mm)**: Shifts the entire page left (negative) or right (positive).
4. Click **Save settings**.

