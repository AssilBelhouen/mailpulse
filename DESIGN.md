---
name: MailPulse
description: A quiet task interface for email image-request signals.
colors:
  primary: "#186352"
  background: "#f7f8f7"
  surface: "#ffffff"
  foreground: "#182824"
  muted-foreground: "#53645d"
  accent: "#e9efec"
  muted: "#eef2ef"
  border: "#d6dfda"
  input: "#bdcbc3"
  destructive: "#ae2929"
  selection: "#c6e6d7"
  scrollbar: "#a1b8aa"
typography:
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  brand:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  small:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  metadata:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
rounded:
  control: "6px"
  surface: "12px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "36px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "4px 12px"
    height: "44px"
  table-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.surface}"
  confirmation-dialog:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: MailPulse

## Overview

**Creative North Star: "Quiet task workspace"**

MailPulse is a quiet task interface for routine work. Offwhite page backgrounds, white working surfaces and restrained teal actions keep attention on forms, records and their state. Its system typography is an explicit product choice, used for headings as well as body text.

The visual language is compact, readable and literal. Borders organize data; spacing separates tasks. Status and uncertainty remain visible in ordinary text. There are no promotional graphics or decorative dashboard summaries.

The brand mark is an authored envelope whose lower edge forms a pulse, drawn in
white on the primary teal. `public/logo.svg` is its source; the same asset appears
beside the wordmark at 36px on login and dashboard and serves as the SVG favicon.
Keep its square aspect ratio and pair it with the visible MailPulse name in the
interface; the adjacent image is decorative for assistive technology.

**Key Characteristics:**

- Quiet offwhite and white surfaces with one teal action accent.
- System sans typography; monospace reserved for tracking URLs.
- Small rounded controls, bordered data regions and restrained depth.
- Visible keyboard focus, pending, error, empty and copied states.

## Colors

The palette combines soft neutral surfaces with a deep, muted teal action accent. The frontmatter is the normative source for color values.

### Primary

- **Deep Teal** (`primary`): brand, primary buttons, visible focus, instructional disclosure and positive operation feedback.

### Neutral

- **Offwhite Canvas** (`background`): page canvas, outline buttons and dialog surface.
- **Working White** (`surface`): input and table surfaces; reversed text on filled actions.
- **Deep Green Ink** (`foreground`): headings, labels and record content.
- **Quiet Gray Green** (`muted-foreground`): explanatory copy, timestamps and secondary metadata.
- **Soft Green Wash** (`accent`): hover treatment for outline and ghost buttons.
- **Pale Neutral Wash** (`muted`): table hover and selection treatment.
- **Gray Green Rule** (`border`): section borders and table dividers.
- **Field Stroke** (`input`): slightly stronger input boundaries.
- **Selection Wash** (`selection`): selected page text.
- **Scrollbar Green** (`scrollbar`): thin scrollbar thumb against the muted track.

Destructive red (`destructive`) is a semantic state color for errors, delete text and the final destructive action; it is not a second brand accent.

### Named Rules

**The Action Accent Rule.** Use teal for primary actions, the brand, instructional disclosure and success feedback; keep data and supporting text neutral.

## Typography

**Heading and Body Font:** System sans (`ui-sans-serif, system-ui, sans-serif`).
**URL Font:** The browser's monospace stack, inherited from the `code` element and Tailwind preflight.

**Character:** Familiar and practical, with medium-weight labels and semibold headings. There is no decorative display role. Normal sentence case keeps the task interface readable.

### Hierarchy

- **Headline:** Page headings use the `headline` token with tight tracking.
- **Brand:** The compact wordmark uses `brand`; its dashboard version marker uses muted metadata text.
- **Title:** Confirmation titles use `title`; table section headings inherit body size with semibold weight.
- **Body:** Default explanatory text uses `body`; supporting descriptions use `small`. Longer cautionary copy uses relaxed line height (1.625).
- **Label:** Form labels, buttons and table headers use `label`.
- **Metadata:** Timestamps, URL text, record totals and pagination context use `metadata`.
- **Input:** Text is 16px with 24px line height on narrow viewports and 14px with 20px line height from the medium breakpoint.

### Named Rules

**The Working Type Rule.** Use the system sans stack for interface text and headings. Reserve monospace for tracking URLs and tabular numerals for counts and timestamps.

## Layout

Use a centered task workspace. The dashboard container stops at 1440px with horizontal padding of 20px, increasing to 40px at 640px. Its header uses a thin bottom rule, a left wordmark and a right sign-out action. The page uses a single main heading followed by the recipient form, cautionary text, table region and disclosure instructions.

Forms and introductory copy stop at 42rem. The recipient form stacks vertically below 640px and becomes an end-aligned row above it; its gap is 12px. Login is one centered column, capped at 28rem, with 24px horizontal padding and full-viewport minimum height. Field groups separate labels from controls with 8px gaps, and login fields use 20px vertical spacing.

The bordered table region has a wrapping header and footer with 20px horizontal and 16px vertical padding. The table has a 1130px minimum width and scrolls horizontally inside its own region. Keep counts right-aligned and preserve local timestamp formatting. The surrounding page must remain usable at narrow widths. Instructions remain ordinary text in a disclosure below the table.

Use the frontmatter spacing steps for repeated control and surface spacing; larger page-specific gaps are composition choices rather than a new scale.

## Elevation & Depth

Depth is restrained. White input and table surfaces sit on the offwhite canvas, with thin rules doing most of the organizing. Outline buttons and inputs have the subtle Tailwind extra-small shadow. Confirmation dialogs use the larger library shadow and a half-opacity black backdrop. Keyboard focus is a state treatment, not decorative elevation.

### Shadow Vocabulary

- **Control edge:** `0 1px 2px 0 rgb(0 0 0 / 0.05)` on inputs and outline buttons.
- **Dialog lift:** `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` on the confirmation dialog.

### Named Rules

**The Quiet Surface Rule.** Let borders and white-on-offwhite layering organize the page. Reserve the larger shadow and dimmed backdrop for confirmation dialogs.

## Shapes

Controls use the `control` radius; the table shell and dialog use `surface`. Borders are thin and continuous. The table shell clips its contents to the rounded outline while the inner table scrolls. Buttons are modest rectangles with consistent text alignment and no decorative silhouette.

## Components

### Buttons

Compact and text-led. Primary actions use deep teal with white text; final deletion uses destructive red with white text. Outline buttons use a canvas fill, thin border and subtle shadow. Ghost buttons remain unfilled at rest; row deletion uses destructive text.

Base buttons are 36px high with 16px horizontal padding. Small table and pagination actions are 32px high with 12px horizontal padding; extra-small copy actions are 24px high with 8px padding and metadata-size text. Form submission buttons are 44px high. Filled actions use a 90% color hover; outline and ghost actions use the accent wash. Controls show a 3px half-opacity teal focus ring. Disabled controls halve opacity and suppress pointer interaction. Pending actions retain explicit text.

### Inputs / Fields

White, thin-stroked fields use the control radius and 12px horizontal padding. The shared primitive is 36px high; dashboard and login fields use 44px. Labels stay visible above inputs. Focus changes the border to teal and adds the same 3px ring as buttons. Placeholder text is muted. Disabled inputs halve opacity. Shared invalid styling uses the destructive border and a low-opacity red ring; errors in the current forms are also reported in ordinary alert text.

### Cards / Containers

The table shell is a white bordered working region with the surface radius. It has no ambient card shadow. Header, body and footer are separated by rules; table cells use compact padding, with additional vertical room around recipient rows. A neutral wash marks row hover.

### Navigation

The dashboard header is a single horizontal row with wordmark and ghost sign-out action. Pagination lives in the table footer, with outline previous and next buttons and an inline page count. Header and footer content may wrap rather than overlap. There is no sidebar or decorative navigation chrome.

### Confirmation Dialog

The deletion confirmation is a centered, bordered canvas-colored surface with 24px padding, 16px internal gap and a dimmed backdrop. Its maximum width is 32rem from 640px; narrow screens retain 16px viewport gutters. Title and description are centered on small screens and left-aligned at the small breakpoint. Cancel remains an outline button; confirmation is destructive. Action order stacks on mobile and aligns to the right on wider screens.

### Feedback and Disclosure

Success and copied feedback occupy a stable text status region. Errors use destructive text, and empty/loading states occupy the table's content region. The instructions disclosure uses a teal text summary and muted paragraphs. Keep all of these states literal and readable, without icons or illustrations added for ornament.

## Do's and Don'ts

### Do:

- **Do** preserve the single-column login form and direct task hierarchy.
- **Do** keep the data table horizontally scrollable within its own region on narrow screens.
- **Do** use visible labels, keyboard focus and explicit text for pending, empty, error and copied states.
- **Do** pair destructive actions with clear wording and the confirmation dialog.

### Don't:

- **Don't** add marketing illustrations, promotional graphics or summary cards to these task surfaces.
- **Don't** introduce a separate display font or ornamental type treatment.
- **Don't** hide uncertainty behind a positive-colored metric or visual claim of a confirmed human open.
- **Don't** shrink table text or collapse its columns to force a narrow viewport fit.
