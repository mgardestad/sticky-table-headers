# Sticky Table Headers

Keeps table headers visible while you scroll through long tables in Obsidian. When a table's header row would scroll out of view, a copy of it stays pinned at the top of the viewport, so you always know what each column means.

Works in both Reading view and Live Preview, handles multiple tables on the same page, and follows horizontal scrolling on wide tables.

## Features

- **Sticky headers on scroll** — the header row stays visible as you scroll down a long table.
- **Multiple tables** — every table on the page is handled independently.
- **Horizontal scroll aware** — on wide tables, the pinned header scrolls sideways in sync with the table body, so columns stay aligned.
- **Theme-friendly** — the pinned header inherits your table's existing styling.
- **Zero configuration** — enable it and it just works.

## How it works

The plugin watches your tables and, when a header scrolls past the top of the scroll container, renders a lightweight pinned clone of just the header row. Column widths are measured from the real table so the clone stays perfectly aligned. Nothing is written to your notes — this is a display-only enhancement.

## Installation

### From Community Plugins (once approved)

Settings → Community plugins → Browse → search **Sticky Table Headers** → Install → Enable.

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/JWCzju/sticky-table-headers/releases).
2. Copy them into `<your-vault>/.obsidian/plugins/sticky-table-headers/`.
3. Reload Obsidian and enable the plugin in Settings → Community plugins.

## Support

If this plugin is useful to you, you can support development via [GitHub Sponsors](https://github.com/sponsors/JWCzju). Completely optional.

## License

[MIT](LICENSE) © Yinno
