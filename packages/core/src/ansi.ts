/**
 * Vertical alignment for text sizing protocol
 */
export type VerticalAlign = "top" | "bottom" | "center"

/**
 * Horizontal alignment for text sizing protocol
 */
export type HorizontalAlign = "left" | "right" | "center"

/**
 * Parameters for Kitty Text Sizing Protocol (OSC 66)
 */
export interface TextSizingParams {
  /** Scale factor (1-7), default 1. Text occupies scale × width by scale cells */
  scale?: number
  /** Width in cells (0-7, 0=auto), default 0 */
  width?: number
  /** Fractional scale numerator (0-15), default 0 */
  numerator?: number
  /** Fractional scale denominator (0-15, must exceed numerator), default 0 */
  denominator?: number
  /** Vertical alignment */
  verticalAlign?: VerticalAlign
  /** Horizontal alignment */
  horizontalAlign?: HorizontalAlign
}

export const ANSI = {
  switchToAlternateScreen: "\x1b[?1049h",
  switchToMainScreen: "\x1b[?1049l",
  reset: "\x1b[0m",

  scrollDown: (lines: number) => `\x1b[${lines}T`,
  scrollUp: (lines: number) => `\x1b[${lines}S`,

  moveCursor: (row: number, col: number) => `\x1b[${row};${col}H`,
  moveCursorAndClear: (row: number, col: number) => `\x1b[${row};${col}H\x1b[J`,

  setRgbBackground: (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`,
  resetBackground: "\x1b[49m",

  // Bracketed paste mode
  bracketedPasteStart: "\u001b[200~",
  bracketedPasteEnd: "\u001b[201~",

  /**
   * Kitty Text Sizing Protocol - Full control with all parameters (OSC 66)
   *
   * @param params Text sizing parameters
   * @param text Text to render with sizing
   * @returns Escape sequence for sized text
   *
   * @example
   * // Double-sized text
   * console.log(ANSI.textSizing({ scale: 2 }, "BIG TEXT"));
   *
   * @example
   * // Superscript (half-sized)
   * console.log(ANSI.textSizing({ numerator: 1, denominator: 2 }, "x²"));
   *
   * @example
   * // Centered, triple-sized text
   * console.log(ANSI.textSizing({ scale: 3, horizontalAlign: "center" }, "HUGE"));
   */
  textSizing: (params: TextSizingParams, text: string): string => {
    const parts: string[] = []

    // Scale factor
    if (params.scale && params.scale > 1) {
      parts.push(`s=${params.scale}`)
    }

    // Width
    if (params.width && params.width > 0) {
      parts.push(`w=${params.width}`)
    }

    // Fractional scaling
    if (params.numerator && params.denominator && params.denominator > params.numerator) {
      parts.push(`n=${params.numerator}:d=${params.denominator}`)
    }

    // Vertical alignment
    if (params.verticalAlign && params.verticalAlign !== "top") {
      const v = params.verticalAlign === "bottom" ? 1 : 2
      parts.push(`v=${v}`)
    }

    // Horizontal alignment
    if (params.horizontalAlign && params.horizontalAlign !== "left") {
      const h = params.horizontalAlign === "right" ? 1 : 2
      parts.push(`h=${h}`)
    }

    // Build the OSC 66 sequence
    const paramsStr = parts.length > 0 ? parts.join(":") + ";" : ";"
    return `\x1b]66${paramsStr}${text}\x1b\\`
  },

  /**
   * Simplified text sizing - just scale factor
   *
   * @param scale Scale factor (1-7)
   * @param text Text to render
   * @returns Escape sequence for scaled text
   *
   * @example
   * console.log(ANSI.scaledText(2, "Double size"));
   */
  scaledText: (scale: number, text: string): string => {
    return `\x1b]66;s=${scale};${text}\x1b\\`
  },

  /**
   * Fractional text sizing (for superscripts, subscripts, etc.)
   *
   * @param numerator Fractional scale numerator (0-15)
   * @param denominator Fractional scale denominator (0-15, must exceed numerator)
   * @param text Text to render
   * @returns Escape sequence for fractionally-sized text
   *
   * @example
   * // Half-sized text (superscript)
   * console.log(ANSI.fractionalText(1, 2, "²"));
   */
  fractionalText: (numerator: number, denominator: number, text: string): string => {
    return `\x1b]66;n=${numerator}:d=${denominator};${text}\x1b\\`
  },

  /**
   * Text sizing with explicit width and scale
   *
   * @param scale Scale factor (1-7)
   * @param width Width in cells (0-7)
   * @param text Text to render
   * @returns Escape sequence for text with explicit width and scale
   *
   * @example
   * // Emoji with explicit 2-cell width, double size
   * console.log(ANSI.textSizingWithWidth(2, 2, "🐈"));
   */
  textSizingWithWidth: (scale: number, width: number, text: string): string => {
    return `\x1b]66;s=${scale}:w=${width};${text}\x1b\\`
  },

  /**
   * Explicit width control (for emoji and wide characters)
   *
   * @param width Width in cells
   * @param text Text to render
   * @returns Escape sequence for text with explicit width
   *
   * @example
   * console.log(ANSI.explicitWidth(2, "🐈"));
   */
  explicitWidth: (width: number, text: string): string => {
    return `\x1b]66;w=${width};${text}\x1b\\`
  },
}
