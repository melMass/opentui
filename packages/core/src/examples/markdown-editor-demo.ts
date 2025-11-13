#!/usr/bin/env bun

/**
 * Markdown Editor with Live Preview and Variable Font Sizes
 *
 * A split-view markdown editor demonstrating OpenTUI's text sizing protocol:
 * - Left panel: Raw markdown with vim bindings
 * - Right panel: Live preview with ACTUAL variable font sizes using OSC 66!
 *
 * Features:
 * - Vim-inspired keybindings (i=insert, Esc=normal, h/j/k/l navigation)
 * - Real-time markdown preview using StyledText
 * - Headers rendered with OSC 66 text sizing protocol (H1=3x, H2/H3=2x)
 * - Colors and bold styling
 * - Modal editing with visual feedback
 *
 * Requirements: Kitty v0.40+ or Ghostty for text sizing support
 */

import {
  CliRenderer,
  createCliRenderer,
  TextareaRenderable,
  BoxRenderable,
  TextRenderable,
  KeyEvent,
  RGBA,
  TextAttributes,
} from "../index"
import { StyledText, bold } from "../lib/styled-text"
import type { TextChunk } from "../text-buffer"

const INITIAL_MARKDOWN = `# Welcome to OpenTUI Markdown Editor

This editor showcases **OpenTUI's styling system**!

## Features

- Split view with live preview
- Vim-inspired keybindings
- Styled headers with colors and bold
- Real-time rendering

### Getting Started

Press \`i\` to enter insert mode, \`Esc\` for normal mode.
Navigate with \`h j k l\` in normal mode.

#### Small Header

Regular text can contain **bold** and *italic* text.

> Blockquotes are supported too!

##### Tiny Header

###### The Smallest Header

Try editing this document and watch the preview update!

---

## Styled Preview

The right panel uses OpenTUI's StyledText to render:
- # H1 headers in bold blue
- ## H2 headers in bold green
- ### H3 headers in bold pink
- Regular text at normal styling

Pretty cool, right? 🚀

For actual text sizing protocol demos, see:
- text-sizing-simple.ts
- text-sizing-demo.ts
`

type VimMode = "normal" | "insert"

let renderer: CliRenderer | null = null
let editor: TextareaRenderable | null = null
let editorPanel: BoxRenderable | null = null
let previewText: TextRenderable | null = null
let statusBar: TextRenderable | null = null
let vimMode: VimMode = "normal"
let previewContent: string = ""

export async function run(rendererInstance: CliRenderer): Promise<void> {
  renderer = rendererInstance
  renderer.start()
  renderer.setBackgroundColor(RGBA.fromInts(13, 17, 23)) // GitHub dark

  const mainContainer = new BoxRenderable(renderer, {
    id: "main-container",
    flexDirection: "column",
    flexGrow: 1,
  })
  renderer.root.add(mainContainer)

  // Split container for editor and preview
  const splitContainer = new BoxRenderable(renderer, {
    id: "split-container",
    flexDirection: "row",
    flexGrow: 1,
  })
  mainContainer.add(splitContainer)

  // Left panel - Editor
  editorPanel = new BoxRenderable(renderer, {
    id: "editor-panel",
    width: "50%",
    border: true,
    borderStyle: "single",
    borderColor: "#6BCF7F",
    title: "Markdown Editor [NORMAL]",
    titleAlignment: "center",
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 1,
  })
  splitContainer.add(editorPanel)

  editor = new TextareaRenderable(renderer, {
    id: "editor",
    initialValue: INITIAL_MARKDOWN,
    textColor: "#E6EDF3",
    selectionBg: "#264F78",
    selectionFg: "#FFFFFF",
    wrapMode: "word",
    showCursor: true,
    cursorColor: "#4ECDC4",
  })
  editorPanel.add(editor)

  // Right panel - Preview
  const previewPanel = new BoxRenderable(renderer, {
    id: "preview-panel",
    width: "50%",
    border: true,
    borderStyle: "single",
    borderColor: "#F778BA",
    title: "Live Preview (Styled)",
    titleAlignment: "center",
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
  })
  splitContainer.add(previewPanel)

  previewText = new TextRenderable(renderer, {
    id: "preview",
    content: "",
    fg: "#E6EDF3",
    wrapMode: "word",
  })
  previewPanel.add(previewText)

  // Status bar
  statusBar = new TextRenderable(renderer, {
    id: "status-bar",
    content: "",
    height: 1,
    fg: "#A5D6FF",
    bg: "#0D1117",
  })
  mainContainer.add(statusBar)

  // Set up vim keybindings (before setting mode)
  setupVimBindings(renderer)

  // Focus editor and set initial mode to normal
  editor.focus()
  setVimMode("normal")

  // Initial preview render - set content directly
  const initialPreview = parseMarkdown(INITIAL_MARKDOWN)
  previewText.content = initialPreview
  previewContent = INITIAL_MARKDOWN

  // Update preview on every frame
  renderer.setFrameCallback(() => {
    if (editor && !editor.isDestroyed) {
      const markdown = editor.value
      if (markdown && markdown !== previewContent) {
        previewContent = markdown
        updatePreview(markdown)
      }
      updateStatusBar()
    }
  })
}

function setVimMode(mode: VimMode) {
  vimMode = mode

  if (!editor || !editorPanel) return

  if (mode === "insert") {
    editor.showCursor = true
    editor.focus()
    editorPanel.title = "Markdown Editor [INSERT]"
    editorPanel.borderColor = "#58A6FF" // Blue for insert mode
  } else {
    // Normal mode: keep cursor visible but don't focus (vim-like behavior)
    editor.showCursor = true
    // Note: We keep focus so cursor stays visible, just change the border color
    editorPanel.title = "Markdown Editor [NORMAL]"
    editorPanel.borderColor = "#6BCF7F" // Green for normal mode
  }
}

function setupVimBindings(renderer: CliRenderer) {
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    if (vimMode === "normal") {
      handleNormalMode(key)
    } else if (vimMode === "insert") {
      handleInsertMode(key)
    }
  })
}

function handleNormalMode(key: KeyEvent) {
  if (!editor) return

  // Prevent ALL keys from being typed in normal mode
  // Only allow specific vim commands through

  // Switch to insert mode
  if (key.name === "i" && !key.ctrl && !key.alt && !key.shift) {
    key.preventDefault()
    setVimMode("insert")
    return
  }

  // Vim navigation - prevent default for all navigation keys
  if (key.name === "h" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorLeft()
    return
  }
  if (key.name === "j" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorDown()
    return
  }
  if (key.name === "k" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorUp()
    return
  }
  if (key.name === "l" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorRight()
    return
  }

  // Word navigation
  if (key.name === "w" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveWordForward()
    return
  }
  if (key.name === "b" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveWordBackward()
    return
  }

  // Line navigation
  if (key.name === "0" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveToLineStart()
    return
  }
  if (key.name === "$" && !key.shift && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveToLineEnd()
    return
  }

  // Page navigation
  if (key.name === "g" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.editBuffer.setCursor(0, 0)
    return
  }
  if (key.name === "G" && key.shift && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.gotoBufferEnd()
    return
  }

  // Prevent ALL other keys from being typed in normal mode
  if (key.sequence && !key.ctrl) {
    key.preventDefault()
  }
}

function handleInsertMode(key: KeyEvent) {
  // Exit insert mode
  if (key.name === "escape") {
    key.preventDefault()
    setVimMode("normal")
  }
}

function updateStatusBar() {
  if (!statusBar || !editor || editor.isDestroyed) return

  try {
    const cursor = editor.logicalCursor
    const line = cursor.row + 1
    const col = cursor.col + 1
    const value = editor.value
    const lines = value ? value.split("\n").length : 1

    const caps = renderer?.getCapabilities()
    const textSizingSupport = caps?.scaled_text ? "✓" : "✗"

    statusBar.content = `Line ${line}/${lines}, Col ${col} | Mode: ${vimMode.toUpperCase()} | Text Sizing: ${textSizingSupport} | Ctrl+C: Exit | i: Insert | Esc: Normal`
  } catch (error) {
    // Ignore errors during shutdown
  }
}

/**
 * Simple markdown parser that converts markdown to StyledText
 * Uses OpenTUI's built-in styling (bold, colors) to differentiate headers
 *
 * Note: Full text sizing protocol support would require integration at the
 * Zig renderer level, not at the renderable level. This demo uses OpenTUI's
 * styling system to approximate the effect.
 */
function parseMarkdown(markdown: string): StyledText {
  // Handle undefined or null markdown
  if (!markdown) {
    return new StyledText([{ __isChunk: true, text: "" }])
  }

  const lines = markdown.split("\n")
  const chunks: TextChunk[] = []
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      const chunk: TextChunk = {
        __isChunk: true,
        text: `  ${line}\n`,
        attributes: TextAttributes.DIM,
      }
      chunks.push(chunk)
      continue
    }

    // Headers with bold, colors, AND TEXT SIZING!
    const h1Match = line.match(/^# (.+)$/)
    if (h1Match) {
      const chunk = bold(h1Match[1])
      if (chunk.fg === undefined) {
        chunk.fg = RGBA.fromHex("#58A6FF")
      }
      chunk.scale = 3 // 3x size using OSC 66!
      chunks.push(chunk)
      chunks.push({ __isChunk: true, text: "\n\n" })
      continue
    }

    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      const chunk = bold(h2Match[1])
      if (chunk.fg === undefined) {
        chunk.fg = RGBA.fromHex("#6BCF7F")
      }
      chunk.scale = 2 // 2x size using OSC 66!
      chunks.push(chunk)
      chunks.push({ __isChunk: true, text: "\n\n" })
      continue
    }

    const h3Match = line.match(/^### (.+)$/)
    if (h3Match) {
      const chunk = bold(h3Match[1])
      if (chunk.fg === undefined) {
        chunk.fg = RGBA.fromHex("#F778BA")
      }
      chunk.scale = 2 // 2x size using OSC 66!
      chunks.push(chunk)
      chunks.push({ __isChunk: true, text: "\n" })
      continue
    }

    const h4Match = line.match(/^#### (.+)$/)
    if (h4Match) {
      chunks.push(bold(h4Match[1]))
      chunks.push({ __isChunk: true, text: "\n" })
      continue
    }

    const h5Match = line.match(/^##### (.+)$/)
    if (h5Match) {
      const chunk = bold(h5Match[1])
      if (chunk.attributes === undefined) {
        chunk.attributes = 0
      }
      chunk.attributes = chunk.attributes | TextAttributes.DIM
      chunks.push(chunk)
      chunks.push({ __isChunk: true, text: "\n" })
      continue
    }

    const h6Match = line.match(/^###### (.+)$/)
    if (h6Match) {
      const chunk: TextChunk = {
        __isChunk: true,
        text: h6Match[1],
        attributes: TextAttributes.DIM,
      }
      chunks.push(chunk)
      chunks.push({ __isChunk: true, text: "\n" })
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      const chunk: TextChunk = {
        __isChunk: true,
        text: "─".repeat(40) + "\n",
        attributes: TextAttributes.DIM,
      }
      chunks.push(chunk)
      continue
    }

    // Blockquotes
    if (line.startsWith("> ")) {
      const chunk: TextChunk = {
        __isChunk: true,
        text: "│ " + line.slice(2) + "\n",
        attributes: TextAttributes.DIM,
      }
      chunks.push(chunk)
      continue
    }

    // Lists
    if (line.match(/^[\s]*[-*+] /)) {
      const indentMatch = line.match(/^([\s]*)/)
      const indent = indentMatch ? indentMatch[0] : ""
      const content = line.slice(indent.length + 2)
      chunks.push({ __isChunk: true, text: indent + "• " })
      chunks.push(...processInlineFormatting(content))
      chunks.push({ __isChunk: true, text: "\n" })
      continue
    }

    // Regular paragraph
    if (line.trim()) {
      chunks.push(...processInlineFormatting(line))
      chunks.push({ __isChunk: true, text: "\n" })
    } else {
      chunks.push({ __isChunk: true, text: "\n" })
    }
  }

  return new StyledText(chunks)
}

/**
 * Process inline markdown formatting (bold, italic, code)
 * Returns an array of TextChunks with appropriate styling
 */
function processInlineFormatting(text: string): TextChunk[] {
  const chunks: TextChunk[] = []
  let remaining = text

  // Simple regex-based parser for inline formatting
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      chunks.push({ __isChunk: true, text: text.slice(lastIndex, match.index) })
    }

    if (match[1]) {
      // Bold **text**
      chunks.push(bold(match[2]))
    } else if (match[3]) {
      // Italic *text*
      const chunk: TextChunk = {
        __isChunk: true,
        text: match[4],
        fg: RGBA.fromHex("#A5D6FF"),
      }
      chunks.push(chunk)
    } else if (match[5]) {
      // Inline code `code`
      const chunk: TextChunk = {
        __isChunk: true,
        text: match[6],
        attributes: TextAttributes.DIM,
      }
      chunks.push(chunk)
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    chunks.push({ __isChunk: true, text: text.slice(lastIndex) })
  }

  return chunks.length > 0 ? chunks : [{ __isChunk: true, text }]
}

function updatePreview(markdown: string) {
  if (!previewText) {
    console.error("previewText is null!")
    return
  }

  // Allow empty markdown to clear preview
  if (!markdown) {
    previewText.content = ""
    return
  }

  try {
    const rendered = parseMarkdown(markdown)
    console.log("Updating preview with", rendered.chunks.length, "chunks")
    previewText.content = rendered
  } catch (error) {
    console.error("Error rendering markdown:", error)
  }
}

export function destroy(rendererInstance: CliRenderer): void {
  rendererInstance.clearFrameCallbacks()
  renderer = null
  editor = null
  editorPanel = null
  previewText = null
  statusBar = null
}

if (import.meta.main) {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  })
  await run(renderer)
}
