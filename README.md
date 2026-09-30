# StyleAI — Personalized Outfit Recommendation

This version is configured as a **static GitHub Pages website focused only on outfit recommendations**.

## Changes made
- Removed the Room AI / room-design UI completely.
- Removed room navigation, room cards, room forms and room result screens.
- Fixed outfit selection so the selected **Occasion + Outfit Type + Preferred Color** are read fresh every time the user clicks **Find My Outfit**.
- Added validation for all three selections.
- Added a visible selection summary before submission.
- Added deterministic recommendation rules for Casual, College, Office, Party, Wedding and Date.
- The selected color is now reflected in the final recommendation.
- The result page displays the exact choices used to create the recommendation.
- Kept photo upload/preview working.
- Improved mobile layout and form styling.
- No external API or backend is required for the recommendation flow.

## GitHub Pages
Upload the contents of this folder to the repository root and make sure `index.html` is in the published root.

> Note: this static version provides a rule-based personalized recommendation. It does not generate an AI-edited/virtual-try-on image by itself.
