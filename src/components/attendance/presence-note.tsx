"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PresenceNote({
  eventId,
  note,
  onNoteChange,
  disabled,
}: {
  eventId: string;
  note: string | null;
  onNoteChange: (note: string | null) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("presence");
  const tCommon = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = draft.trim();
    const newNote = trimmed || null;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });
      if (res.ok) {
        onNoteChange(newNote);
        setEditing(false);
      }
    } catch {
      // error handled silently, state not changed
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: null }),
      });
      if (res.ok) {
        onNoteChange(null);
        setDraft("");
        setEditing(false);
      }
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("notePlaceholder")}
          maxLength={500}
          rows={2}
          disabled={saving}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {tCommon("save")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(false);
              setDraft(note ?? "");
            }}
            disabled={saving}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </div>
    );
  }

  if (note) {
    return (
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{note}</p>
        {!disabled && (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label={t("editNote")}
              onClick={() => {
                setDraft(note);
                setEditing(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              aria-label={t("deleteNote")}
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={() => setEditing(true)}
      disabled={disabled}
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      {t("addNote")}
    </Button>
  );
}
