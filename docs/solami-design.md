# Evidence-panel design

Audience: researchers using market odds alongside on-chain evidence. Preserve the existing Oddsroom cream/ink desk, mono numeric labels, sharp dividers and orange forecast accent. Add a quiet sage evidence band, a two-column comparison, and a compact transaction table instead of another grid of promotional cards. No decorative motion or invented signal scores.

Sources reviewed 2026-09-21:

- [Solami Blur docs](https://solami.dev/docs/blur) and its [trade response schema](https://solami.dev/docs/api/get_data-token-trades): expose native signatures, timestamps, venue, side and USD volume. Use a table that lets people inspect specific rows and check transactions in the explorer.
- [Nielsen Norman Group: Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/): show source and freshness beside the metric; distinguish loading, Preview, empty, stale and unavailable; preserve a stale snapshot after refresh failure with a clear retry action.

The two percentages carry distinct labels and a plain-language warning: token demand does not determine the event outcome. Wrapped SOL is explicitly a default context, not an automatically discovered asset-to-market mapping. Narrow screens keep this comparison together; the transaction table can scroll within its own container. Focus outlines and reduced-motion support are explicit. This direction has been browser-inspected, not user-approved.
