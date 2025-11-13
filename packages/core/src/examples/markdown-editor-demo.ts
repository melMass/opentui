#!/usr/bin/env bun

/**
 * Markdown Editor with Kitty Text Sizing Protocol
 *
 * A split-view markdown editor showcasing the text sizing protocol:
 * - Left panel: Raw markdown with vim bindings
 * - Right panel: Live preview with variable font sizes for headers
 *
 * Features:
 * - Vim-inspired keybindings (i=insert, Esc=normal, h/j/k/l navigation)
 * - Real-time markdown preview
 * - Headers rendered at different sizes using OSC 66
 * - Syntax highlighting for markdown
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
import { ANSI } from "../ansi"
import type { TextSizingParams } from "../ansi"

const INITIAL_MARKDOWN = `# Welcome to OpenTUI Markdown Editor

This editor showcases **Kitty's Text Sizing Protocol**!

## Features

- Split view with live preview
- Vim-inspired keybindings
- Variable font sizes for headers
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

## Text Sizing in Action

The right panel uses OSC 66 to render:
- # Headers at 3x size
- ## Subheaders at 2.5x size
- ### Third level at 2x size
- Regular text at normal size

Pretty cool, right? 🚀
`

type VimMode = "normal" | "insert"

let renderer: CliRenderer | null = null
let editor: TextareaRenderable | null = null
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
  const editorPanel = new BoxRenderable(renderer, {
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
    title: "Live Preview (with Text Sizing)",
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

  // Set initial mode to normal (no cursor)
  setVimMode("normal")

  // Update preview on every frame
  renderer.setFrameCallback(() => {
    if (editor && !editor.isDestroyed) {
      const markdown = editor.value
      if (markdown !== previewContent) {
        previewContent = markdown
        updatePreview(markdown)
      }
      updateStatusBar()
    }
  })

  // Initial preview render
  updatePreview(INITIAL_MARKDOWN)

  // Set up vim keybindings
  setupVimBindings(renderer)
}

function setVimMode(mode: VimMode) {
  vimMode = mode

  if (!editor || !renderer) return

  const editorPanel = renderer.root.findById("editor-panel") as BoxRenderable | null

  if (mode === "insert") {
    editor.showCursor = true
    editor.focus()
    if (editorPanel) {
      editorPanel.title = "Markdown Editor [INSERT]"
      editorPanel.borderColor = "#58A6FF" // Blue for insert mode
    }
  } else {
    editor.showCursor = false
    editor.blur()
    if (editorPanel) {
      editorPanel.title = "Markdown Editor [NORMAL]"
      editorPanel.borderColor = "#6BCF7F" // Green for normal mode
    }
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

  // Switch to insert mode
  if (key.name === "i" && !key.ctrl && !key.alt && !key.shift) {
    key.preventDefault()
    setVimMode("insert")
    return
  }

  // Vim navigation
  if (key.name === "h" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorLeft()
  } else if (key.name === "j" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorDown()
  } else if (key.name === "k" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorUp()
  } else if (key.name === "l" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveCursorRight()
  }

  // Word navigation
  else if (key.name === "w" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveWordForward()
  } else if (key.name === "b" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveWordBackward()
  }

  // Line navigation
  else if (key.name === "0" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveToLineStart()
  } else if (key.name === "$" && !key.shift && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.moveToLineEnd()
  }

  // Page navigation
  else if (key.name === "g" && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.editBuffer.setCursor(0, 0)
  } else if (key.name === "G" && key.shift && !key.ctrl && !key.alt) {
    key.preventDefault()
    editor.gotoBufferEnd()
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
  if (!statusBar || !editor) return

  const cursor = editor.logicalCursor
  const line = cursor.row + 1
  const col = cursor.col + 1
  const lines = editor.value.split("\n").length

  const caps = renderer?.getCapabilities()
  const textSizingSupport = caps?.scaled_text ? "✓" : "✗"

  statusBar.content = `Line ${line}/${lines}, Col ${col} | Mode: ${vimMode.toUpperCase()} | Text Sizing: ${textSizingSupport} | Ctrl+C: Exit | i: Insert | Esc: Normal`
}

/**
 * Simple markdown parser that converts markdown to ANSI escape sequences
 * with text sizing for headers
 */
function parseMarkdown(markdown: string): string {
  const lines = markdown.split("\n")
  const output: string[] = []
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) {
      output.push(`  ${line}`)
      continue
    }

    // Headers with text sizing
    const h1Match = line.match(/^# (.+)$/)
    if (h1Match) {
      output.push(ANSI.scaledText(3, h1Match[1]))
      output.push("") // Extra spacing for large text
      output.push("") // Extra spacing for large text
      continue
    }

    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      // Use fractional sizing for 2.5x (we'll approximate with 2x for now)
      output.push(ANSI.scaledText(2, h2Match[1]))
      output.push("") // Extra spacing
      continue
    }

    const h3Match = line.match(/^### (.+)$/)
    if (h3Match) {
      output.push(ANSI.scaledText(2, h3Match[1]))
      output.push("") // Extra spacing
      continue
    }

    const h4Match = line.match(/^#### (.+)$/)
    if (h4Match) {
      output.push("\x1b[1m" + h4Match[1] + "\x1b[0m") // Bold
      output.push("")
      continue
    }

    const h5Match = line.match(/^##### (.+)$/)
    if (h5Match) {
      output.push("\x1b[1m" + h5Match[1] + "\x1b[0m")
      continue
    }

    const h6Match = line.match(/^###### (.+)$/)
    if (h6Match) {
      output.push("\x1b[2m\x1b[1m" + h6Match[1] + "\x1b[0m") // Dim + Bold
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      output.push("─".repeat(40))
      continue
    }

    // Blockquotes
    if (line.startsWith("> ")) {
      output.push("\x1b[2m│ " + line.slice(2) + "\x1b[0m")
      continue
    }

    // Lists
    if (line.match(/^[\s]*[-*+] /)) {
      const indentMatch = line.match(/^([\s]*)/)
      const indent = indentMatch ? indentMatch[0] : ""
      const content = line.slice(indent.length + 2)
      output.push(indent + "• " + processInlineFormatting(content))
      continue
    }

    // Regular paragraph
    if (line.trim()) {
      output.push(processInlineFormatting(line))
    } else {
      output.push("")
    }
  }

  return output.join("\n")
}

/**
 * Process inline markdown formatting (bold, italic, code)
 */
function processInlineFormatting(text: string): string {
  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, "\x1b[1m$1\x1b[0m")

  // Italic *text*
  text = text.replace(/\*(.+?)\*/g, "\x1b[3m$1\x1b[0m")

  // Inline code `code`
  text = text.replace(/`(.+?)`/g, "\x1b[2m\x1b[7m$1\x1b[0m")

  return text
}

function updatePreview(markdown: string) {
  if (!previewText) return

  const rendered = parseMarkdown(markdown)
  previewText.content = rendered
}

export function destroy(_renderer: CliRenderer): void {
  renderer = null
  editor = null
  previewText = null
  statusBar = null
}

if (import.meta.main) {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  })
  await run(renderer)
}
