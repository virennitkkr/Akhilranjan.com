Ask Akhil AI — Offline in-browser assistant

Overview
--------
This adds an offline, production-grade AI-style assistant for the Akhil Ranjan website. Widget logic lives in vanilla JS/CSS: `askakhil-chat.js` + `askakhil-chat.css`, loaded directly by every page.

Key properties
- Runs entirely in the browser (no server, no external API)
- Uses a structured local knowledge base (59 entries)
- Lightweight deterministic search + fuzzy matching
- Bilingual (English / Hindi), with an opt-in localStorage persistence toggle
- Export button: copies the transcript to the clipboard and downloads it as a `.txt` file

Files
- `askakhil-chat.js` — self-contained IIFE: knowledge base, search engine, DOM building, event wiring
- `askakhil-chat.css` — BEM-styled CSS for the widget, using the site's existing `--gold`/`--blue` CSS variables

How it works
------------
1. User asks a question in the widget.
2. The search engine normalizes and tokenizes the query.
3. Each knowledge entry is scored by token overlap, title phrase match and priority.
4. A lightweight fuzzy check (Levenshtein) augments scores for low-confidence queries.
5. The widget renders the best answer with a confidence-based framing and suggested related topics.

Customization
-------------
- Extend the knowledge base with more entries — follow the existing structure in the `ASKAKHIL_KB` array in `askakhil-chat.js`.
- Tune the scoring weights in `askakhil-chat.js` to change matching sensitivity.
- Translate answers by populating `answer_hi` fields in entries.

Accessibility & Privacy
-----------------------
- Keyboard access, ARIA landmarks (`role="dialog"`, `role="log"`, `aria-live`) and `prefers-reduced-motion` support.
- No chat data leaves the browser; export and copy are user-initiated.

Next steps (suggested)
- Add a small indexed search for instant suggestions while typing.
- Replace the simple matching engine with a small on-device embedding model later if needed.
