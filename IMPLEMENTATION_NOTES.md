# Paul Drycleaners POS – Feature Update

This update implements the seven requested feature groups:

1. Saved receipt editing and cancellation.
2. Item-level delivery status in generated WhatsApp delivery messages.
3. Customer address suggestions and address-only customer matching.
4. Steam Press default pricing at 50% of Dryclean price, rounded up to the next ₹10.
5. Customer address display in Orders and queue cards.
6. Garment search while adding items.
7. Men's, Women's and Unisex garment categories, including Settings assignment controls.

## Important behavior

- Cancelled receipts are retained in the order history; they are not physically deleted.
- Cancellation removes the outstanding balance for that receipt from the customer's aggregate balance and excludes cancelled orders from operational queues and dashboard counts.
- Payments already collected are not automatically refunded or deleted when a receipt is cancelled. Handle any refund separately in the shop's accounting records.
- Editing a receipt preserves its receipt number, creation timestamp, paid amount, and delivery flags for item rows retained at the same row position. Review the item list carefully when editing a partially delivered receipt.
- Existing garment categories are seeded for common men's and women's garments. Items without an explicit mapping default to Unisex and can be reassigned in Settings.
- The existing JSON/local persistence model is retained; no database reset or data-file migration is required.

## Validation

All TypeScript/TSX source files passed syntax transpilation. A full `npm run build` could not be completed in this environment because dependencies were not installed; `npm ci` timed out. Run `npm ci` and then `npm run build` locally before deploying.
