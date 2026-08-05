"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Check, X, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { VariableInput } from "./variable-input";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MultipartItem {
  key: string;
  value: string;       // text value OR data-URL for files
  type: "text" | "file";
  fileName?: string;   // original filename for file fields
  enabled?: boolean;
}

interface MultipartFormEditorProps {
  initialData?: MultipartItem[];
  onSubmit: (data: MultipartItem[]) => void;
  className?: string;
}

type FormValues = {
  items: MultipartItem[];
};

// ─── Component ───────────────────────────────────────────────────────────────

const MultipartFormEditor: React.FC<MultipartFormEditorProps> = ({
  initialData = [],
  onSubmit,
  className,
}) => {
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const form = useForm<FormValues>({
    defaultValues: {
      items:
        initialData.length > 0
          ? initialData.map((item) => ({ ...item, enabled: item.enabled ?? true }))
          : [{ key: "", value: "", type: "text", enabled: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // ── Auto-save ──────────────────────────────────────────────────────────────

  const lastSavedRef = useRef<string | null>(null);

  const saveIfChanged = useCallback(
    (items: MultipartItem[]) => {
      const filtered = items.filter(
        (item) => item.enabled && (item.key?.trim() || item.value?.trim())
      );
      const serialized = JSON.stringify(filtered);
      if (serialized !== lastSavedRef.current) {
        lastSavedRef.current = serialized;
        onSubmit(filtered);
      }
    },
    [onSubmit]
  );

  useEffect(() => {
    const subscription = form.watch((value) => {
      const items = (value as FormValues)?.items || [];
      saveIfChanged(items as MultipartItem[]);
    });
    return () => subscription.unsubscribe();
  }, [form, saveIfChanged]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addRow = () =>
    append({ key: "", value: "", type: "text", enabled: true });

  const removeRow = (index: number) => {
    if (fields.length > 1) remove(index);
  };

  const toggleEnabled = (index: number) => {
    const current = form.getValues(`items.${index}.enabled`);
    form.setValue(`items.${index}.enabled`, !current);
  };

  const handleTypeChange = (index: number, newType: "text" | "file") => {
    form.setValue(`items.${index}.type`, newType);
    // Clear value when switching types
    form.setValue(`items.${index}.value`, "");
    form.setValue(`items.${index}.fileName`, "");
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) {
      form.setValue(`items.${index}.value`, "");
      form.setValue(`items.${index}.fileName`, "");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      form.setValue(`items.${index}.value`, e.target?.result as string);
      form.setValue(`items.${index}.fileName`, file.name);
      // Trigger save
      const items = form.getValues("items");
      saveIfChanged(items);
    };
    reader.readAsDataURL(file);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn("w-full p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">
          Form Fields
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="h-8 w-8 p-0 hover:bg-zinc-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {fields.map((field, index) => {
          const isEnabled = form.watch(`items.${index}.enabled`);
          const fieldType = form.watch(`items.${index}.type`) || "text";
          const fileName = form.watch(`items.${index}.fileName`);

          return (
            <div
              key={field.id}
              className={cn(
                "grid gap-2 p-3 rounded-lg border transition-all",
                isEnabled
                  ? "bg-zinc-900 border-zinc-700"
                  : "bg-zinc-800/50 border-zinc-800 opacity-60"
              )}
              style={{ gridTemplateColumns: "1fr 80px 1fr auto auto" }}
            >
              {/* Key */}
              <VariableInput
                value={form.watch(`items.${index}.key`)}
                onChange={(e) =>
                  form.setValue(`items.${index}.key`, e.target.value)
                }
                placeholder="Key"
                disabled={!isEnabled}
                className="bg-transparent border-0 focus:ring-0 focus:border-0 text-sm placeholder:text-zinc-500"
              />

              {/* Type selector */}
              <Select
                value={fieldType}
                onValueChange={(val) =>
                  handleTypeChange(index, val as "text" | "file")
                }
                disabled={!isEnabled}
              >
                <SelectTrigger className="h-8 text-xs bg-zinc-800 border-zinc-600 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600">
                  <SelectItem value="text" className="text-xs">
                    Text
                  </SelectItem>
                  <SelectItem value="file" className="text-xs">
                    File
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Value / File */}
              {fieldType === "file" ? (
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    className="hidden"
                    disabled={!isEnabled}
                    onChange={(e) =>
                      handleFileChange(index, e.target.files?.[0] ?? null)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!isEnabled}
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="h-8 text-xs bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-300 gap-1.5 shrink-0"
                  >
                    <FileUp className="h-3 w-3" />
                    Choose File
                  </Button>
                  <span
                    className="text-xs text-zinc-400 truncate"
                    title={fileName || "No file chosen"}
                  >
                    {fileName || (
                      <span className="text-zinc-600 italic">No file chosen</span>
                    )}
                  </span>
                </div>
              ) : (
                <VariableInput
                  value={form.watch(`items.${index}.value`)}
                  onChange={(e) =>
                    form.setValue(`items.${index}.value`, e.target.value)
                  }
                  placeholder="Value"
                  disabled={!isEnabled}
                  className="bg-transparent border-0 focus:ring-0 focus:border-0 text-sm placeholder:text-zinc-500"
                />
              )}

              {/* Enable/Disable toggle */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleEnabled(index)}
                className={cn(
                  "h-6 w-6 p-0 rounded-sm border-2 transition-colors",
                  isEnabled
                    ? "bg-green-600 border-green-600 text-white hover:bg-green-700"
                    : "border-red-500 text-red-500 hover:border-red-400"
                )}
              >
                {isEnabled ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>

              {/* Remove */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(index)}
                disabled={fields.length <= 1}
                className={cn(
                  "h-6 w-6 p-0 transition-colors",
                  fields.length <= 1
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                )}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 pr-1">
        <span className="text-xs text-zinc-500">Changes saved automatically</span>
      </div>
    </div>
  );
};

export default MultipartFormEditor;
