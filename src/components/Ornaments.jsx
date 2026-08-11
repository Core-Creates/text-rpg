// ********************************** Ornaments **********************************
// Gilt flourishes drawn as inline SVG rather than shipped as images.
//
// Three reasons for SVG over a raster asset sheet: it scales to any frame size,
// it inherits colour through currentColor so one shape serves every accent, and
// it needs no img-src entry in the Content Security Policy. These are drawn from
// scratch rather than traced from stock artwork, which keeps the repository
// clear of third-party asset licensing.
import React, { useId } from 'react';

// ********************************** Deckle Filter **********************************
// A torn vellum edge, from the EaTemp reference where every panel ends raggedly
// rather than on a clean rule.
//
// Turbulence displaces the edge of whatever it is applied to. It is deliberately
// NOT applied to the leaf itself: filtering an element rasterises its subtree and
// softens the text. styles.css puts it on .codex::before, a bare parchment sheet
// sitting behind the content, so the tearing is real and the type stays crisp.
export function DeckleFilter() {
  return (
    <svg className="defs" aria-hidden="true" focusable="false">
      <filter id="deckle" x="-4%" y="-2%" width="108%" height="104%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.022 0.055"
          numOctaves="4"
          seed="7"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="9"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

// ********************************** Vine Border **********************************
// The ruled border of an illuminated page: a cream band carrying rosettes in
// vermilion and lapis with gilt centres, strung on a green vine.
//
// There is no viewBox on purpose. Without one, SVG user units equal CSS pixels,
// so the pattern tiles at a fixed size along an edge of any length instead of
// stretching the flowers to fit.
export function VineBorder({ orientation = 'horizontal' }) {
  const vertical = orientation === 'vertical';
  // Four strips are rendered, so the pattern id has to be unique per instance.
  // Duplicate ids would make every strip resolve to whichever was parsed first.
  const id = `vine-${useId()}`;

  return (
    <svg className={`vine vine-${orientation}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={vertical ? 22 : 48}
          height={vertical ? 48 : 22}
          patternTransform={vertical ? 'rotate(90 11 11)' : undefined}
        >
          {/* The vine, running the length of the band. */}
          <path
            d="M0 11 C 8 4, 16 18, 24 11 C 32 4, 40 18, 48 11"
            fill="none"
            stroke="var(--vine)"
            strokeWidth="1.2"
          />
          {/* Leaves either side of it. */}
          <path
            d="M12 8 C 9 3, 15 2, 14 7 Z M36 14 C 33 19, 39 20, 38 15 Z"
            fill="var(--vine)"
          />
          {/* Rosettes, alternating vermilion and lapis. */}
          <g>
            <circle cx="24" cy="11" r="4.6" fill="var(--vermilion)" />
            <circle cx="24" cy="11" r="1.7" fill="var(--gold-lit)" />
            <circle cx="0" cy="11" r="4.6" fill="var(--lapis)" />
            <circle cx="0" cy="11" r="1.7" fill="var(--gold-lit)" />
            <circle cx="48" cy="11" r="4.6" fill="var(--lapis)" />
            <circle cx="48" cy="11" r="1.7" fill="var(--gold-lit)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ********************************** Corner Flourish **********************************
// One shape, rotated by CSS into each of the four corners of the leaf.
export function CornerFlourish() {
  return (
    <svg className="corner" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M2 2 L26 2 M2 2 L2 26" />
        <path d="M6 6 L18 6 M6 6 L6 18" opacity="0.65" />
        <path d="M10 22 C10 14, 14 10, 22 10" />
        <path d="M22 10 C28 10, 30 13, 30 16 C30 19, 27 21, 24 20 C21 19, 21 15, 24 15" />
        <path d="M10 22 C10 28, 13 30, 16 30 C19 30, 21 27, 20 24 C19 21, 15 21, 15 24" />
        <circle cx="31.5" cy="21.5" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="21.5" cy="31.5" r="1.1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

// ********************************** Divider **********************************
// A rule that swells to a centred lozenge, closing one movement of the page.
export function Divider() {
  return (
    <svg
      className="divider"
      viewBox="0 0 320 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M4 10 L118 10" />
        <path d="M202 10 L316 10" />
        <path d="M124 10 C132 4, 140 4, 146 10 C140 16, 132 16, 124 10 Z" />
        <path d="M196 10 C188 4, 180 4, 174 10 C180 16, 188 16, 196 10 Z" />
      </g>
      <path
        d="M160 3 L166 10 L160 17 L154 10 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ********************************** Heraldic Mark **********************************
// A shield over crossed swords, set above the title.
export function HeraldicMark() {
  return (
    <svg className="heraldry" viewBox="0 0 96 72" aria-hidden="true" focusable="false">
      <g stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round">
        {/* Crossed blades */}
        <path d="M18 62 L74 14 M22 58 L20 66 L28 64" />
        <path d="M78 62 L22 14 M74 58 L76 66 L68 64" />
        <path d="M70 10 L80 20 M26 10 L16 20" />

        {/* Shield */}
        <path
          d="M48 16 L72 24 C72 44, 62 56, 48 62 C34 56, 24 44, 24 24 Z"
          fill="var(--hall)"
        />
        <path d="M48 22 L66 28 C66 43, 58 52, 48 57 C38 52, 30 43, 30 28 Z" opacity="0.55" />
      </g>
      {/* Fleur, the charge on the shield */}
      <path
        d="M48 30 C45 34, 44 38, 48 43 C52 38, 51 34, 48 30 Z M40 38 C43 39, 45 41, 46 44 M56 38 C53 39, 51 41, 50 44 M42 46 L54 46"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}
