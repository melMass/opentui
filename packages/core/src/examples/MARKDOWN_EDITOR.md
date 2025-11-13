# Markdown Editor with Text Sizing Protocol

A full-featured markdown editor demonstrating Kitty's variable font size protocol in a practical TUI application.

## Features

- **Split-view interface**: Edit markdown on the left, see preview on the right
- **Vim-inspired bindings**: Familiar navigation and editing
- **Live preview**: Real-time markdown rendering with variable font sizes
- **Text sizing protocol**: Headers rendered at different scales (3x, 2x, bold)

## Keybindings

### Normal Mode (default)
- `i` - Enter insert mode
- `h/j/k/l` - Move cursor left/down/up/right
- `w/b` - Move forward/backward by word
- `0/$` - Jump to line start/end
- `g/G` - Jump to buffer start/end (top/bottom)

### Insert Mode
- `Esc` - Return to normal mode
- All standard text editing keys work

### Both Modes
- `Ctrl+C` - Exit the editor

## Running

```bash
# Standalone
bun run packages/core/src/examples/markdown-editor-demo.ts

# From examples menu
bun run packages/core/src/examples/index.ts
# Then select "Markdown Editor with Text Sizing"
```

## Requirements

- **Terminal**: Kitty v0.40+ or Ghostty for full text sizing support
  - In other terminals, headers will display as bold text instead of scaled
- **Runtime**: Bun (for running TypeScript directly)

## How it Works

The editor demonstrates the text sizing protocol by:

1. **Parsing markdown**: Simple regex-based parser extracts headers, formatting, etc.
2. **Generating OSC 66 sequences**: Headers are wrapped in `\x1b]66;s=N;text\x1b\\`
3. **Real-time updates**: Preview refreshes on every frame when content changes

### Text Sizing Scales

- `#` H1 headers: 3x scale
- `##` H2 headers: 2x scale
- `###` H3 headers: 2x scale
- `####` H4 headers: Bold text
- Regular text: Normal size

## Markdown Support

Currently supported:
- ✅ Headers (h1-h6)
- ✅ Bold (`**text**`)
- ✅ Italic (`*text*`)
- ✅ Inline code (`` `code` ``)
- ✅ Blockquotes (`> quote`)
- ✅ Lists (`- item`)
- ✅ Horizontal rules (`---`)

## Example Document

The editor comes with a sample document showcasing all supported features. Just start typing to see your markdown rendered in real-time!

## Technical Details

- Uses `TextareaRenderable` for the editor (full text buffer with cursor)
- Uses `TextRenderable` for the preview (styled text output)
- Modal editing inspired by vim (normal/insert modes)
- Border colors change based on mode (green=normal, blue=insert)

## Future Enhancements

Potential improvements:
- Syntax highlighting in the editor panel
- More markdown features (tables, images, links)
- Export to HTML
- Load/save files
- Search and replace
- Line numbers

## See Also

- [Text Sizing Protocol Documentation](../TEXT_SIZING_PROTOCOL.md)
- [Simple text sizing demo](./text-sizing-simple.ts)
- [Full text sizing demo](./text-sizing-demo.ts)
