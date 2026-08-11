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

Delivered as a `<meta http-equiv>` tag in `index.html`, because GitHub Pages
cannot set response headers. The policy allows scripts only from the site's own
origin, denies plugins and framing sources, restricts audio to the one S3 bucket
that serves it, and blocks form submission entirely.

Two limitations are worth knowing:

- `frame-ancestors` and `report-uri` are ignored when a policy is delivered by
  meta tag. Clickjacking protection would need a real response header, which
  means moving off GitHub Pages to a host that can set one.
- `style-src` still permits `'unsafe-inline'`, because the game renders inline
  `style` attributes. Moving that styling into stylesheet classes will allow the
  directive to be tightened.

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

- No Subresource Integrity on the Google Fonts stylesheet. Self-hosting the fonts
  would remove the third-party origin entirely and allow both `style-src` and
  `font-src` to drop their remote entries.
- The S3 buckets serving audio and the custom cursor are outside this repository.
  Their bucket policies and CORS configuration are not covered here.
- No linter runs in CI. Create React App used to lint as part of its build, and
  that check was lost in the Vite migration.
