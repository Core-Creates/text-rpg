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

The only outbound requests are static asset loads: audio files from an S3 bucket
and web fonts from Google Fonts.

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
style-src 'self' https://fonts.googleapis.com;
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

## Known gaps

- No Subresource Integrity on the Google Fonts stylesheet. Self-hosting
  UnifrakturMaguntia, Cinzel and EB Garamond would remove the third-party origin
  entirely and let both `style-src` and `font-src` drop their remote entries. It
  would also stop leaking visitor IP addresses to a third party on every load.
- The S3 buckets serving audio and the custom cursor are outside this repository.
  Their bucket policies and CORS configuration are not covered here.
- No linter runs in CI. Create React App used to lint as part of its build, and
  that check was lost in the Vite migration.
