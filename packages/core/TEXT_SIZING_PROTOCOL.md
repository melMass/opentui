# Kitty Text Sizing Protocol Support

OpenTUI now supports [Kitty's Text Sizing Protocol](https://sw.kovidgoyal.net/kitty/text-sizing-protocol), which allows terminal applications to display text in multiple font sizes. This feature is available in Kitty v0.40+ and compatible terminals like Ghostty.

## Features

- **Scaled text**: Display text at 2x, 3x, or larger sizes
- **Fractional scaling**: Render superscripts, subscripts, and smaller text
- **Explicit width control**: Precise control over character cell width (useful for emoji)
- **Alignment options**: Vertical and horizontal alignment for sized text
- **Full parameter support**: Complete implementation of OSC 66 protocol

## API

### TypeScript API

The ANSI module provides several functions for generating text sizing escape sequences:

```typescript
import { ANSI } from "@opentui/core"

// Simple scaled text (2x, 3x, etc.)
console.log(ANSI.scaledText(2, "Double size"))
console.log(ANSI.scaledText(3, "Triple size"))

// Fractional text (for superscripts/subscripts)
console.log(`E = mc${ANSI.fractionalText(1, 2, "²")}`)
console.log(`H${ANSI.fractionalText(1, 2, "₂")}O`)

// Explicit width (useful for emoji)
console.log(ANSI.explicitWidth(2, "🐈")) // Emoji with 2-cell width

// Combined width and scale
console.log(ANSI.textSizingWithWidth(2, 2, "🚀")) // 2x scale, 2-cell width

// Full control with all parameters
console.log(
  ANSI.textSizing(
    {
      scale: 2,
      horizontalAlign: "center",
      verticalAlign: "center",
    },
    "Centered text",
  ),
)
```

### TypeScript Types

```typescript
interface TextSizingParams {
  scale?: number // 1-7, default 1
  width?: number // 0-7, 0=auto
  numerator?: number // 0-15, for fractional scaling
  denominator?: number // 0-15, must exceed numerator
  verticalAlign?: "top" | "bottom" | "center"
  horizontalAlign?: "left" | "right" | "center"
}
```

### Zig API

For Zig-level control, the ANSI module exposes:

```zig
const ansi = @import("ansi.zig");

// Simple scaled text
try ansi.ANSI.scaledTextOutput(writer, 2, "Hello");

// Full control
const params = ansi.TextSizingParams{
    .scale = 2,
    .width = 0,
    .vertical_align = .top,
    .horizontal_align = .left,
};
try ansi.ANSI.textSizingOutput(writer, params, "Hello");
```

## Terminal Capability Detection

OpenTUI automatically detects text sizing protocol support during terminal initialization:

```typescript
const renderer = await createCliRenderer()
const caps = renderer.getCapabilities()

console.log("Explicit width support:", caps.explicit_width)
console.log("Scaled text support:", caps.scaled_text)
```

### Capabilities

- `explicit_width`: Terminal supports the `w=` parameter for explicit width control
- `scaled_text`: Terminal supports the `s=` parameter for text scaling

## Examples

### Running the Examples

```bash
# Simple test
bun run packages/core/src/examples/text-sizing-simple.ts

# Full interactive demo
bun run packages/core/src/examples/text-sizing-demo.ts
```

### Example: Math Formulas

```typescript
// Display math with superscripts
console.log(`x${ANSI.fractionalText(1, 2, "²")} + y${ANSI.fractionalText(1, 2, "²")} = z${ANSI.fractionalText(1, 2, "²")}`)
```

### Example: Headers and Titles

```typescript
// Large banner text
console.log(ANSI.scaledText(3, "★ WELCOME ★"))
```

### Example: Mixed Sizes

```typescript
// Normal text with inline size changes
console.log(`This is ${ANSI.scaledText(2, "BIG")} and this is ${ANSI.fractionalText(1, 2, "small")}`)
```

## Protocol Details

The text sizing protocol uses OSC (Operating System Command) code 66:

```
ESC ] 66 ; parameters ; text ESC \
```

### Parameters

- `s=N`: Scale factor (1-7), text occupies N×w by N cells
- `w=N`: Width in cells (0-7, 0=auto)
- `n=N:d=M`: Fractional scale (N/M)
- `v=N`: Vertical alignment (0=top, 1=bottom, 2=center)
- `h=N`: Horizontal alignment (0=left, 1=right, 2=center)

Parameters are separated by colons (`:`) within a single parameter group, and multiple groups can be separated by semicolons (`;`).

## Terminal Compatibility

### Supported Terminals

- **Kitty** v0.40+: Full support
- **Ghostty** v1.1+: Full support
- Other terminals may add support in the future

### Unsupported Terminals

In terminals without support, the escape sequences are ignored, and text appears at normal size. The protocol is designed to be backwards-compatible.

### Checking Support

```typescript
// Check if running in a supported terminal
const termProgram = process.env.TERM_PROGRAM
const isKitty = termProgram === "kitty"
const isGhostty = termProgram === "ghostty"

if (isKitty || isGhostty) {
  console.log(ANSI.scaledText(2, "Your terminal supports text sizing!"))
} else {
  console.log("Text sizing may not be supported in your terminal")
}
```

## Performance Considerations

- The text sizing protocol incurs approximately 10% performance overhead in the terminal due to additional bookkeeping for multicell characters
- Use text sizing judiciously for best performance
- Consider caching sized text escape sequences if used repeatedly

## Implementation Details

The implementation spans multiple layers:

1. **Zig ANSI module** (`src/zig/ansi.zig`): Low-level escape sequence generation
2. **Zig Terminal module** (`src/zig/terminal.zig`): Capability detection via CPR queries
3. **TypeScript ANSI module** (`src/ansi.ts`): High-level API for JavaScript/TypeScript
4. **TypeScript types**: Type-safe interfaces for text sizing parameters

## Contributing

This feature was implemented to support the upstream OpenTUI project. When contributing improvements:

1. Ensure compatibility with the Kitty protocol specification
2. Add tests for new functionality
3. Update documentation
4. Test in both Kitty and Ghostty terminals

## References

- [Kitty Text Sizing Protocol Specification](https://sw.kovidgoyal.net/kitty/text-sizing-protocol)
- [Kitty Protocol Extensions](https://sw.kovidgoyal.net/kitty/protocol-extensions/)
- [Kitty v0.40 Release Notes](https://sw.kovidgoyal.net/kitty/changelog/#id1)
- [GitHub Discussion: Variable Font Sizes](https://github.com/kovidgoyal/kitty/issues/8226)

## License

This implementation is part of OpenTUI and follows the same license terms.
