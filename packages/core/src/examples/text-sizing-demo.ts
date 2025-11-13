#!/usr/bin/env bun

/**
 * Kitty Text Sizing Protocol Demo
 *
 * This demo showcases Kitty's variable font size protocol (OSC 66).
 * It demonstrates various text sizing capabilities including:
 * - Scaled text (larger sizes)
 * - Fractional text (smaller sizes for superscripts/subscripts)
 * - Explicit width control
 * - Alignment options
 *
 * Requirements:
 * - Kitty terminal v0.40+ or another terminal with text sizing protocol support
 * - For best results, ensure your terminal is in full-screen or has enough space
 *
 * Note: This demo writes raw escape sequences directly to stdout.
 * If your terminal doesn't support the protocol, you'll see the escape sequences
 * as-is without any size changes.
 */

import { ANSI } from "../ansi"

const RESET = "\x1b[0m"
const CLEAR = "\x1b[2J\x1b[H"
const BOLD = "\x1b[1m"
const DIM = "\x1b[2m"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runDemo() {
  // Clear screen and hide cursor
  process.stdout.write(CLEAR + "\x1b[?25l")

  try {
    // Title
    process.stdout.write(BOLD + "Kitty Text Sizing Protocol Demo\n" + RESET)
    process.stdout.write(DIM + "Press Ctrl+C to exit\n\n" + RESET)
    await sleep(1000)

    // Section 1: Basic Scaling
    process.stdout.write(BOLD + "1. Basic Text Scaling (s parameter)\n" + RESET)
    process.stdout.write("Normal text → ")
    process.stdout.write(ANSI.scaledText(2, "Double size"))
    process.stdout.write(" → ")
    process.stdout.write(ANSI.scaledText(3, "Triple size"))
    process.stdout.write("\n\n\n\n") // Extra lines for scaled text height
    await sleep(2000)

    // Section 2: Fractional Scaling
    process.stdout.write(BOLD + "2. Fractional Scaling (n:d parameters)\n" + RESET)
    process.stdout.write("Normal text with ")
    process.stdout.write(ANSI.fractionalText(1, 2, "half-size"))
    process.stdout.write(" text for superscripts/subscripts\n")
    process.stdout.write("Example: E = mc")
    process.stdout.write(ANSI.fractionalText(1, 2, "²"))
    process.stdout.write(" or H")
    process.stdout.write(ANSI.fractionalText(1, 2, "₂"))
    process.stdout.write("O\n\n")
    await sleep(2000)

    // Section 3: Explicit Width Control
    process.stdout.write(BOLD + "3. Explicit Width Control (w parameter)\n" + RESET)
    process.stdout.write("Emoji with explicit width: ")
    process.stdout.write(ANSI.explicitWidth(2, "🐈"))
    process.stdout.write(ANSI.explicitWidth(2, "🦀"))
    process.stdout.write(ANSI.explicitWidth(2, "🚀"))
    process.stdout.write("\n")
    process.stdout.write("Regular text: 🐈🦀🚀 (for comparison)\n\n")
    await sleep(2000)

    // Section 4: Combined Width and Scale
    process.stdout.write(BOLD + "4. Combined Width and Scale\n" + RESET)
    process.stdout.write("Emoji at different scales:\n")
    process.stdout.write("Scale 1: " + ANSI.textSizingWithWidth(1, 2, "🐈") + "\n")
    process.stdout.write("Scale 2: " + ANSI.textSizingWithWidth(2, 2, "🐈") + "\n\n\n")
    process.stdout.write("Scale 3: " + ANSI.textSizingWithWidth(3, 2, "🐈") + "\n\n\n\n")
    await sleep(2000)

    // Section 5: Advanced Parameters
    process.stdout.write(BOLD + "5. Advanced Parameters (alignment)\n" + RESET)
    process.stdout.write("Left-aligned scaled text:\n")
    process.stdout.write(
      ANSI.textSizing(
        {
          scale: 2,
          horizontalAlign: "left",
        },
        "LEFT",
      ),
    )
    process.stdout.write("\n\n")

    process.stdout.write("Center-aligned scaled text:\n")
    process.stdout.write(
      ANSI.textSizing(
        {
          scale: 2,
          horizontalAlign: "center",
        },
        "CENTER",
      ),
    )
    process.stdout.write("\n\n\n")
    await sleep(2000)

    // Section 6: Creative Examples
    process.stdout.write(BOLD + "6. Creative Examples\n" + RESET)

    // Big header
    process.stdout.write(ANSI.scaledText(3, "BIG HEADER"))
    process.stdout.write("\n\n\n")
    await sleep(1000)

    // Math formula with subscripts/superscripts
    process.stdout.write("Math: x")
    process.stdout.write(ANSI.fractionalText(1, 2, "²"))
    process.stdout.write(" + y")
    process.stdout.write(ANSI.fractionalText(1, 2, "²"))
    process.stdout.write(" = z")
    process.stdout.write(ANSI.fractionalText(1, 2, "²"))
    process.stdout.write("\n\n")
    await sleep(1000)

    // ASCII art with scaling
    process.stdout.write("ASCII art banner:\n")
    process.stdout.write(ANSI.scaledText(2, "★ OpenTUI ★"))
    process.stdout.write("\n\n\n")
    await sleep(1000)

    // Section 7: Terminal Capability Detection
    process.stdout.write("\n" + BOLD + "7. Terminal Capability Detection\n" + RESET)
    process.stdout.write(
      DIM +
        "The text sizing protocol is supported in Kitty v0.40+ and compatible terminals.\n" +
        "If you don't see size differences above, your terminal may not support this protocol.\n" +
        RESET,
    )
    await sleep(3000)

    // Footer
    process.stdout.write("\n\n" + BOLD + "Demo Complete!\n" + RESET)
    process.stdout.write(
      DIM + "This demo showcased Kitty's variable font size protocol (OSC 66).\n" + RESET,
    )
    process.stdout.write(DIM + "For more info: https://sw.kovidgoyal.net/kitty/text-sizing-protocol\n" + RESET)
  } finally {
    // Show cursor and restore terminal
    process.stdout.write("\x1b[?25h")
  }
}

// Handle cleanup on exit
process.on("SIGINT", () => {
  process.stdout.write("\x1b[?25h" + RESET + CLEAR)
  process.exit(0)
})

process.on("SIGTERM", () => {
  process.stdout.write("\x1b[?25h" + RESET + CLEAR)
  process.exit(0)
})

// Run the demo
runDemo().then(() => {
  process.exit(0)
})
