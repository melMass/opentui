#!/usr/bin/env bun

/**
 * Simple Kitty Text Sizing Protocol Test
 *
 * A minimal example to quickly test if your terminal supports
 * the text sizing protocol.
 */

import { ANSI } from "../ansi"

console.log("Kitty Text Sizing Protocol - Simple Test\n")

// Test 1: Scaled text
console.log("1. Scaled Text:")
console.log("   Normal: Hello")
process.stdout.write("   Double: " + ANSI.scaledText(2, "Hello") + "\n\n")

// Test 2: Fractional text
console.log("2. Fractional Text (Superscript):")
process.stdout.write("   Formula: E = mc" + ANSI.fractionalText(1, 2, "²") + "\n\n")

// Test 3: Explicit width
console.log("3. Explicit Width (Emoji):")
process.stdout.write("   With width: " + ANSI.explicitWidth(2, "🐈") + "\n")
console.log("   Without: 🐈\n")

// Test 4: Large text
console.log("4. Large Text:")
process.stdout.write("   " + ANSI.scaledText(3, "BIG!") + "\n\n\n")

console.log("\nIf you see size differences above, your terminal supports the protocol!")
console.log("If not, you'll see the text at normal size with escape sequences visible.")
