"use client"

import { type Editor } from "@tiptap/react"
import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { Palette } from "lucide-react"

export interface UseTextColorConfig {
  /**
   * Tiptap editor instance
   */
  editor?: Editor | null
  /**
   * Target color to apply
   */
  color?: string
  /**
   * Hide button if not available
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback after toggling color
   */
  onToggled?: (isActive: boolean, color: string) => void
}

/**
 * Check if text color can be applied
 */
function canApplyColor(editor: Editor | null, color: string): boolean {
  if (!editor || !editor.isEditable) return false
  try {
    return editor.can().setColor(color)
  } catch {
    return false
  }
}

/**
 * Apply or toggle text color
 */
function toggleTextColor(editor: Editor | null, color: string, isActive: boolean) {
  if (!editor || !editor.isEditable) return false
  if (!canApplyColor(editor, color)) return false

  try {
    const chain = editor.chain().focus()
    if (isActive) {
      chain.unsetColor().run()
    } else {
      chain.setColor(color).run()
    }
    return true
  } catch {
    return false
  }
}

/**
 * Custom hook for text color buttons in Tiptap
 */
export function useTextColor(config?: UseTextColorConfig) {
  const {
    editor: providedEditor,
    color = "#ff0000",
    hideWhenUnavailable = false,
    onToggled,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)

  const isActive = editor?.isActive("textStyle", { color }) ?? false
  const canToggle = canApplyColor(editor, color)
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (!editor) return
      if (hideWhenUnavailable) {
        setIsVisible(canApplyColor(editor, color))
      } else {
        setIsVisible(true)
      }
    }

    handleUpdate()
    editor.on("selectionUpdate", handleUpdate)
    editor.on("transaction", handleUpdate)

    return () => {
      editor.off("selectionUpdate", handleUpdate)
      editor.off("transaction", handleUpdate)
    }
  }, [editor, color, hideWhenUnavailable])

  const handleToggle = React.useCallback(() => {
    if (!editor) return false

    const success = toggleTextColor(editor, color, isActive)
    if (success) {
      onToggled?.(!isActive, color)
    }
    return success
  }, [editor, color, isActive, onToggled])

  return {
    isVisible,
    isActive,
    canToggle,
    handleToggle,
    label: "Text Color",
    Icon: Palette,
    color,
  }
}
