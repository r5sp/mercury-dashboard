# Mercury design system

The brief for this dashboard was "do not look like every other generated site."
That is a real constraint, so it is written down here as rules rather than left to
taste. Read this before changing anything visual.

## The reference point

Mercury is set as an **editorial financial instrument**: warm paper, black ink,
one accent, hairlines instead of shadows, and a dense table as the primary
surface. The lineage is the financial press and the trading desk - the Financial
Times' pink paper and black charts, Stripe's ledger tables, a Bloomberg terminal's
respect for tabular numerals - not a SaaS marketing page.

The consequence: **the data is the only thing allowed to carry colour or weight.**
Chrome recedes to hairlines and muted ink.

## Banned

These are the tells of a generated interface. None of them appear here.

| Banned | Instead |
|---|---|
| Inter, Geist, Space Grotesk | IBM Plex Sans + IBM Plex Mono |
| Indigo/violet/purple anything | Ink on paper, one claret accent |
| Gradients, glows, coloured shadows | Flat fills, hairline rules |
| Rounded cards floating on grey | Bordered regions flush to a hairline grid |
| `border-radius` above 4px | 0 to 3px, and mostly 0 |
| A row of identical stat cards | One divided summary band |
| Emoji as icons | A hand-drawn 16px stroke icon set |
| All-caps everywhere | Mono micro-labels, sentence case elsewhere |
| Dark mode as the only mode | Light is the default; dark is fully specified |

## Typography

**IBM Plex Sans** for language, **IBM Plex Mono** for every number. A superfamily
keeps the two voices related; the mono is what makes columns of figures line up
and reads as instrument rather than webpage.

| Role | Face | Size | Tracking |
|---|---|---|---|
| Wordmark | Mono 600 | 13px | 0.18em |
| Micro-label (column heads, field labels) | Mono 500 | 10px | 0.08em |
| Body / UI | Sans 400-500 | 13px | 0 |
| Table figure | Mono 500 | 13px | 0 |
| Summary figure | Mono 500 | 30px | -0.02em |
| Section heading | Sans 550 | 14px | -0.005em |

Every numeral in the interface - figures, table cells, axis ticks, timestamps,
percentages - is mono and tabular. No exceptions: a proportional digit in a column
is the single fastest way to look unconsidered.

## Colour

Light is the default mode. The palette is warm-neutral with one accent; nothing
here is a framework default.

| Role | Light | Dark |
|---|---|---|
| Paper (page) | `#f4f1ea` | `#100f0d` |
| Surface | `#fbfaf6` | `#191814` |
| Ink (primary text, data) | `#14130f` | `#f6f3ec` |
| Ink secondary | `#46433b` | `#c2bdb0` |
| Muted | `#6c6759` | `#8d8879` |
| Rule (hairline) | `#dcd6c8` | `#2c2a25` |
| Accent (claret) | `#8c2237` | `#d4667c` |
| Positive | `#1c6b45` | `#3f9e70` |
| Negative | `#a32b2b` | `#dd7070` |
| Caution | `#8a5a08` | `#c9932f` |

**Charts are ink, not colour.** The plotted series is the ink token; the
comparison series is a muted hairline. Claret is reserved for the brand mark,
selection, and focus. Status is never colour alone - a dot always sits beside its
written label.

## Structure

- A fixed **216px rail** on the left holds identity, navigation, the reporting
  period, and the theme control. The work surface gets everything else.
- The four headline figures are **one band divided by hairlines**, not four cards.
- Regions are separated by **1px rules**, never by shadow. The only shadow in the
  system is on the two things that genuinely float: the drawer and the command
  palette.
- Table rows are 40px, hairline-separated, no zebra striping. Numbers right, text
  left, and the header is sticky.
- Corner radius is 2px on controls and 0 on regions.

## Interaction

The interface is keyboard-first, which is most of what separates a tool from a
page:

| Key | Action |
|---|---|
| `Cmd/Ctrl K` | Command palette - jump to any rep, switch period, toggle theme |
| `/` | Focus the roster search |
| `1` `2` `3` | 7 / 30 / 90 day reporting period |
| `t` | Toggle theme |
| `Esc` | Close the palette or the detail panel |

Rows are focusable and open on Enter. Focus is always visible: a 2px claret ring.

## Motion

Motion is functional and short: 140ms on overlays, none on data. Charts do not
animate in - an animated bar is a bar you cannot read yet. All of it is disabled
under `prefers-reduced-motion`.
