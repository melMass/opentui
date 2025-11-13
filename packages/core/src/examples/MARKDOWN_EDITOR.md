# Markdown Demos

Two complementary demos showcasing markdown rendering in OpenTUI:

## 1. Markdown Editor (markdown-editor-demo.ts)

A full-featured TUI markdown editor with split-view and vim bindings.

### Features

- **Split-view interface**: Edit markdown on the left, see preview on the right
- **Vim-inspired bindings**: Familiar navigation and editing
- **Live preview**: Real-time markdown rendering with OpenTUI's styled text
- **OpenTUI styling**: Headers rendered with colors and bold text

**Note**: This demo uses OpenTUI's built-in `StyledText` system, which supports colors, bold, italic, and other text attributes, but not the OSC 66 text sizing protocol.

## 2. Markdown Preview with Text Sizing (markdown-preview-sized.ts)

A simple markdown preview demonstrating the actual text sizing protocol.

### Features

- **Actual text sizing**: Headers rendered at different scales (3x, 2x, bold) using OSC 66
- **Direct terminal output**: Writes to stdout bypassing OpenTUI's rendering system
- **Protocol demonstration**: Shows the text sizing protocol in action

**Note**: This demo writes directly to the terminal to demonstrate actual variable font sizes. It's not a full editor, just a preview of the protocol capabilities.

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
# Markdown Editor (full TUI with vim bindings)
bun run packages/core/src/examples/markdown-editor-demo.ts

# Markdown Preview with Text Sizing (actual OSC 66 protocol)
bun run packages/core/src/examples/markdown-preview-sized.ts

# Or from examples menu
bun run packages/core/src/examples/index.ts
# Then select either:
# - "Markdown Editor" (styled text)
# - "Markdown Preview with Text Sizing" (actual protocol)
```

## Requirements

- **Terminal**: Kitty v0.40+ or Ghostty for full text sizing support
  - In other terminals, headers will display as bold text instead of scaled
- **Runtime**: Bun (for running TypeScript directly)

## How They Work

### Markdown Editor (markdown-editor-demo.ts)

Uses OpenTUI's rendering system:

1. **Parsing markdown**: Simple regex-based parser extracts headers, formatting, etc.
2. **Creating TextChunks**: Headers are converted to `TextChunk` objects with colors and bold
3. **Real-time updates**: Preview refreshes on every frame when content changes
4. **OpenTUI rendering**: Uses `StyledText` and `TextRenderable` for display

**Styling approach**:
- `#` H1 headers: Bold + Blue color
- `##` H2 headers: Bold + Green color
- `###` H3 headers: Bold + Pink color
- `####` H4 headers: Bold text
- Regular text: Normal styling

### Markdown Preview with Text Sizing (markdown-preview-sized.ts)

Writes directly to terminal stdout:

1. **Parsing markdown**: Same regex-based parser
2. **Generating OSC 66 sequences**: Headers are wrapped in `\x1b]66;s=N;text\x1b\\`
3. **Direct output**: Writes to `process.stdout` bypassing OpenTUI

**Text sizing scales**:
- `#` H1 headers: 3x scale (OSC 66)
- `##` H2 headers: 2x scale (OSC 66)
- `###` H3 headers: 2x scale (OSC 66)
- `####` H4 headers: Bold text (ANSI)
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

### Markdown Editor
- Uses `TextareaRenderable` for the editor (full text buffer with cursor)
- Uses `TextRenderable` for the preview (styled text output with `StyledText`)
- Modal editing inspired by vim (normal/insert modes)
- Border colors change based on mode (green=normal, blue=insert)
- Real-time preview updates via frame callback

### Markdown Preview with Text Sizing
- Writes directly to `process.stdout` using raw ANSI escape sequences
- Uses `ANSI.scaledText()` for OSC 66 text sizing protocol
- Bypasses OpenTUI's rendering system to demonstrate actual variable font sizes
- Simple single-page preview (not interactive)

## Future Enhancements

Potential improvements:
- Syntax highlighting in the editor panel
- More markdown features (tables, images, links)
- Export to HTML
- Load/save files
- Search and replace
- Line numbers

## Why Two Separate Demos?

OpenTUI's rendering architecture uses a typed `StyledText` system with `TextChunk` objects that support:
- Foreground/background colors (RGBA)
- Text attributes (bold, italic, dim, underline, etc.)
- Text content

However, the OSC 66 text sizing protocol requires raw ANSI escape sequences that can't be represented in this typed system. To actually demonstrate variable font sizes, we need to write directly to the terminal using `process.stdout`, bypassing OpenTUI's rendering.

**For real TUI apps**: Use the Markdown Editor approach with `StyledText` for a fully integrated experience.

**To demonstrate text sizing**: Use the Preview demo or write directly to stdout like it does.

**Future enhancement**: The text sizing protocol could be integrated at the Zig renderer level, allowing `TextChunk` objects to have a `scale` property that gets rendered using OSC 66.

## See Also

- [Text Sizing Protocol Documentation](../TEXT_SIZING_PROTOCOL.md)
- [Simple text sizing demo](./text-sizing-simple.ts)
- [Full text sizing demo](./text-sizing-demo.ts)
