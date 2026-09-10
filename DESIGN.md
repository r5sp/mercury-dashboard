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
| Dark mode as the only mode | Three themes, each separately specified |
| Indigo `#6366f1` on white | Aubergine ink on lilac paper |

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

Three themes ship: **Lilac** (the default), **Paper**, and **Dark**. Each is
specified in full rather than derived from the others, and every token in each
clears WCAG AA against its own surfaces.

Paper and Dark are warm-neutral with a claret accent; nothing there is a
framework default.

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

### Lilac

The light purple theme was asked for by name. Purple is the single loudest tell
of a generated interface, so the answer is not to refuse it and not to reach for
`#6366f1` either - it is to treat the hue with the same discipline as the rest of
the system. Lilac is **aubergine ink on lilac paper**: the ground carries real
tint, the data is a deep violet-black rather than a saturated brand purple, and
the accent stays one held-back colour. Reds shift to a plum-crimson so they sit
in the hue family instead of fighting the ground.

| Role | Lilac |
|---|---|
| Paper (page) | `#e4daf4` |
| Surface | `#f1eafb` |
| Ink | `#1d1630` |
| Ink secondary | `#4b4066` |
| Muted | `#635a7d` |
| Rule | `#cdbde8` |
| Accent | `#6d3f9e` |
| Data ink | `#2a1f45` |
| Positive | `#146b4c` |
| Negative | `#a32b4a` |
| Caution | `#7c5510` |

Worst contrast in the set is 4.75:1 for muted text against paper, which clears AA
at the 10px label size it is used for. The muted token is a darker step here than
in the other two themes precisely because the lilac ground is deeper than theirs.

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
| `t` | Step through Lilac, Paper, Dark |
| `Esc` | Close the palette or the detail panel |

Rows are focusable and open on Enter. Focus is always visible: a 2px claret ring.

## Motion

Motion is functional and short: 140ms on overlays, none on data. Charts do not
animate in - an animated bar is a bar you cannot read yet. All of it is disabled
under `prefers-reduced-motion`.
