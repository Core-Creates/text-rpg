# Security

## Reporting

Open a private security advisory through the repository's Security tab, or open
an issue if the problem is not sensitive. There is no formal response window on a
project this size.

## What this application actually handles

Text RPG is a static single-page game served from GitHub Pages. It is worth
stating the shape of the attack surface plainly, because it is small:

- No backend, no server, no database
- No user accounts, sessions, cookies or tokens
- No user-supplied text is accepted anywhere, so nothing is echoed back
- No `localStorage`, `sessionStorage` or IndexedDB
- No `fetch` or `XMLHttpRequest` calls
- No `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `new Function`
- No secrets or credentials in the repository or the bundle

The only outbound requests are static asset loads: audio files and the custom
cursor, both from S3 buckets. Fonts are self-hosted, so there is no third-party
origin in the page at all. Verified by loading the built bundle in a real browser
and recording every request.

The realistic risk is therefore not to a visitor playing the game. It is supply
chain risk in the build and deploy pipeline, and that is where the controls below
are aimed.

## Controls in place

### Content Security Policy

Delivered as a `<meta http-equiv>` tag, because GitHub Pages cannot set response
headers. The policy is defined in `vite.config.js` and injected into `index.html`
at build time only: the dev server needs to inject its own stylesheets and HMR
client, which a production-grade policy blocks.

Scripts are restricted to the site's own origin, plugins are denied outright,
audio is limited to the single S3 bucket that serves it, and form submission is
blocked entirely.

`style-src` and `style-src-attr` are split deliberately:

```
style-src 'self';
style-src-attr 'unsafe-inline';
```

Inline style *attributes* have to be allowed, because `react-confetti` sets one
on its canvas and the health meter sets its own width. Splitting the directive
means inline `<style>` *elements* stay blocked, which a blanket
`style-src 'unsafe-inline'` would have permitted. The build is checked for inline
`<script>` and `<style>` tags: there are none.

One limitation is not fixable here: `frame-ancestors` and `report-uri` are
ignored when a policy is delivered by meta tag. Clickjacking protection needs a
real response header, which means a host other than GitHub Pages.

### Dependency management

The project was migrated from Create React App to Vite. CRA has been unmaintained
since early 2025, and its build toolchain accounted for all 57 advisories
(3 critical) that `npm audit` reported against this repository, none of which
`npm audit fix` could resolve. The current tree audits clean.

`npm audit --audit-level=high` runs on every push and pull request, so the build
fails if a high or critical advisory appears.

Dependabot is configured for both npm packages and workflow actions, on a weekly
schedule.

### Workflow hardening

- Every action is pinned to a full commit SHA rather than a mutable tag, so a
  retargeted or compromised tag cannot introduce new code into the pipeline. The
  version each SHA corresponds to is recorded in a trailing comment.
- The default token permission is `contents: read`. Jobs opt into `pages: write`
  and `id-token: write` individually, and only the deploy job holds both.
- `actions/checkout` runs with `persist-credentials: false`, so the workflow
  token is not written into `.git/config` where later steps could read it.

### Static analysis

CodeQL runs against JavaScript on every push and pull request, and weekly on a
schedule so that newly published queries reach unchanged code.

### Fonts

UnifrakturMaguntia, Cinzel and EB Garamond are self-hosted from
`src/assets/fonts` rather than loaded from Google. That removes the last
third-party origin, lets both `style-src` and `font-src` sit at `'self'`, and
stops handing every visitor's IP address to Google on page load. Subresource
Integrity becomes moot, since nothing is fetched cross-origin.

### Linting

`npm run lint` runs ESLint 9 on every push and pull request, restoring the check
that Create React App used to perform as part of its build and that was lost in
the Vite migration.

## Known gaps

- The S3 buckets serving audio and the custom cursor are outside this repository.
  Their bucket policies and CORS configuration are not covered here, and they are
  the only remaining cross-origin requests the page makes.
- `frame-ancestors` cannot be enforced from a meta tag, so the page can still be
  framed. Fixing it means a host that can set response headers.
