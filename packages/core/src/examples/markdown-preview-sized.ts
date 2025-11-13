#!/usr/bin/env bun

/**
 * Markdown Preview with ACTUAL Text Sizing Protocol
 *
 * This demo writes directly to the terminal using OSC 66 escape sequences
 * to demonstrate real variable font sizes for headers.
 *
 * Unlike the markdown-editor-demo (which uses OpenTUI's styling system),
 * this outputs RAW ANSI sequences to show actual text scaling.
 *
 * Requirements: Kitty v0.40+ for text sizing support
 */

import { ANSI } from "../ansi"

const EXAMPLE_MARKDOWN = `# Welcome to Text Sizing Protocol

This preview demonstrates **actual** variable font sizes!

## Features

- Headers rendered at different scales
- Direct terminal output (not OpenTUI renderables)
- OSC 66 escape sequences

### Technical Details

The text sizing protocol allows:
- Scaled text (2x, 3x, etc.)
- Fractional scaling (superscripts)
- Explicit width control

#### Implementation

This writes directly to stdout, bypassing OpenTUI's rendering system.

##### Note

Regular text appears at normal size.

###### Reference

See https://sw.kovidgoyal.net/kitty/text-sizing-protocol

---

## How It Works

Regular paragraphs appear at normal size. But headers use
the **ANSI.scaledText()** function to generate OSC 66 sequences.

For example: E = mc${ANSI.fractionalText(1, 2, "²")}

Pretty cool, right? 🚀
`

function parseMarkdownWithSizing(markdown: string): string {
  const lines = markdown.split("\n")
  const output: string[] = []
  let inCodeBlock = false

  for (const line of lines) {
    // Code blocks
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      output.push(`  ${line}`)
      continue
    }

    // Headers with ACTUAL text sizing
    const h1Match = line.match(/^# (.+)$/)
    if (h1Match) {
      output.push(ANSI.scaledText(3, h1Match[1]))
      output.push("") // Extra line for spacing
      output.push("")
      continue
    }

    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      output.push(ANSI.scaledText(2, h2Match[1]))
      output.push("")
      continue
    }

    const h3Match = line.match(/^### (.+)$/)
    if (h3Match) {
      output.push(ANSI.scaledText(2, h3Match[1]))
      output.push("")
      continue
    }

    const h4Match = line.match(/^#### (.+)$/)
    if (h4Match) {
      output.push(`\x1b[1m${h4Match[1]}\x1b[0m`)
      output.push("")
      continue
    }

    const h5Match = line.match(/^##### (.+)$/)
    if (h5Match) {
      output.push(`\x1b[1m${h5Match[1]}\x1b[0m`)
      continue
    }

    const h6Match = line.match(/^###### (.+)$/)
    if (h6Match) {
      output.push(`\x1b[2m${h6Match[1]}\x1b[0m`)
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      output.push("─".repeat(60))
      continue
    }

    // Blockquotes
    if (line.startsWith("> ")) {
      output.push(`\x1b[2m│ ${line.slice(2)}\x1b[0m`)
      continue
    }

    // Lists
    if (line.match(/^[\s]*[-*+] /)) {
      const indentMatch = line.match(/^([\s]*)/)
      const indent = indentMatch ? indentMatch[0] : ""
      const content = line.slice(indent.length + 2)
      output.push(indent + "• " + processInline(content))
      continue
    }

    // Regular paragraph
    if (line.trim()) {
      output.push(processInline(line))
    } else {
      output.push("")
    }
  }

  return output.join("\n")
}

function processInline(text: string): string {
  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, "\x1b[1m$1\x1b[0m")

  // Italic *text*
  text = text.replace(/\*(.+?)\*/g, "\x1b[3m$1\x1b[0m")

  // Inline code `code`
  text = text.replace(/`(.+?)`/g, "\x1b[2m$1\x1b[0m")

  return text
}

async function main() {
  // Clear screen and hide cursor
  process.stdout.write("\x1b[2J\x1b[H\x1b[?25l")

  try {
    // Render the markdown with actual text sizing
    const rendered = parseMarkdownWithSizing(EXAMPLE_MARKDOWN)
    process.stdout.write(rendered)
    process.stdout.write("\n\n")

    // Footer
    process.stdout.write("\x1b[2m")
    process.stdout.write("This demo uses actual OSC 66 text sizing protocol.\n")
    process.stdout.write("Compare with markdown-editor-demo.ts (which uses OpenTUI styling).\n")
    process.stdout.write("\x1b[0m")

    // Wait for user input
    process.stdout.write("\nPress any key to exit...")
    await new Promise((resolve) => {
      process.stdin.setRawMode(true)
      process.stdin.once("data", () => {
        process.stdin.setRawMode(false)
        resolve(null)
      })
    })
  } finally {
    // Show cursor and clear
    process.stdout.write("\x1b[?25h\x1b[2J\x1b[H")
  }
}

main()
