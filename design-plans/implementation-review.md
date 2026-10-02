# Portfolio implementation review

Completed locally on 2 October 2026 in `ask-dev`.

## Changes

- Rebuilt the French and English Home, About and Contact views around Alexandre Tostivint's professional identity, supplied portrait and approved copy.
- Added equally prominent hiring and consulting paths, three existing work examples, consulting areas and a direct résumé link.
- Made career details and older certifications expandable. Retained education, talks, verification links and legacy section links.
- Added fragment navigation, browser history support and language switching that retains the current view and enquiry type.
- Replaced the old contact interaction with an editable draft, explicit Send action and suggestions that only prepare a draft.
- Deferred Crisp loading until explicit use. Preserved drafts on failures or unconfirmed sending, prevented duplicate sends and waited for a matching SDK confirmation before clearing the draft.
- Added direct contact links, visible focus, native controls, reduced motion handling and readable content when site scripts fail.
- Updated `PRODUCT.md` and local preview instructions. Kept static HTML/CSS/JavaScript with the existing local Alpine dependency.

Copy approval and confirmation of six active certifications are recorded in `copy-review.md`.

## Verification

- All 14 Node interaction tests pass, covering both languages with a simulated Crisp SDK.
- Actual browser review of all three views in both languages at 320, 390, 768 and 1440 px: 24 responsive checks passed, with no horizontal overflow and visible controls at least 44 px in each dimension.
- Reviewed desktop and mobile screenshots, expanded career details, history navigation, project deep links and language switching.
- Verified keyboard focus, skip navigation and multiline Enter without sending or loading Crisp.
- Verified the live Crisp widget opens on request. No real message was sent.
- A script-failure preview with site scripts omitted retained readable content and direct contact links. This simulated failed scripts, rather than disabling JavaScript in browser settings.
- Checked HTML nesting, unique IDs, aligned bilingual section IDs and external links, and local asset paths.
- Checked text and button contrast; the textarea boundary is 3.53:1 against its surrounding card.
- No new console errors during the final refreshed page check. JavaScript syntax and `git diff --check` pass.

Local validation screenshots and responsive reports are in `validation/`, which is ignored by Git. Key captures:

- `validation/desktop-home-fr.png`
- `validation/mobile-home.png`
- `validation/mobile-contact-fr.png`
- `validation/desktop-about.png`
- `validation/responsive-fr.json`
- `validation/responsive-en.json`

## Preview and remaining limits

Preview: <http://127.0.0.1:8765/> and <http://127.0.0.1:8765/en/> while the local server is running.

The send flow is verified with a simulated SDK. Real message delivery and receipt still need an explicitly authorized live check. The SDK's sent event does not prove Alexandre has read the message.

No commit, push or deployment was performed. Production publication requires Alexandre's explicit approval.
