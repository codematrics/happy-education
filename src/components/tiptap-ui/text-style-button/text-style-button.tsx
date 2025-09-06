"use client";

import { Button } from "@/components/ui/button";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { Editor } from "@tiptap/react";
import { Palette } from "lucide-react";
import React from "react";

type TextColorPickerButtonProps = {
  editor?: Editor;
  hideWhenUnavailable?: boolean;
} & React.ComponentProps<"button">;

export const TextColorPickerButton = React.forwardRef<
  HTMLButtonElement,
  TextColorPickerButtonProps
>(
  (
    { editor: providedEditor, hideWhenUnavailable = false, ...buttonProps },
    ref
  ) => {
    const tiptap = useTiptapEditor(providedEditor);
    const editor = tiptap?.editor;
    const inputRef = React.useRef<HTMLInputElement>(null);

    if (!editor) return null;

    // ✅ Always sanitize color
    const rawColor = editor.getAttributes("textStyle").color;
    const currentColor =
      typeof rawColor === "string" ? rawColor : "currentColor";

    const canToggle = !!editor.can().setColor?.("#000000");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      editor.chain().focus().setColor(color).run();
    };

    if (hideWhenUnavailable && !canToggle) {
      return null;
    }

    return (
      <>
        <Button
          type="button"
          role="button"
          data-style="ghost"
          aria-pressed={!!currentColor}
          disabled={!canToggle}
          onClick={() => inputRef.current?.click()}
          {...buttonProps}
          ref={ref}
        >
          <Palette
            className="tiptap-button-icon"
            style={{ color: currentColor }}
          />
        </Button>

        {/* ✅ controlled color input */}
        <input
          ref={inputRef}
          type="color"
          value={currentColor === "currentColor" ? "#000000" : currentColor}
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </>
    );
  }
);

TextColorPickerButton.displayName = "TextColorPickerButton";
