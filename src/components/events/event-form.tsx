"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event } from "@/lib/db/repositories";
import { toast } from "sonner";

const eventTypes = [
  "regular_rehearsal",
  "exceptional_rehearsal",
  "general_rehearsal",
  "concert",
  "meeting",
] as const;

const formSchema = z.object({
  name: z.string().min(1),
  type: z.enum(eventTypes),
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  place: z.string().min(1),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function EventForm({
  event,
  mode,
}: {
  event?: Event;
  mode: "create" | "edit";
}) {
  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? {
          name: event.name,
          type: event.type,
          date: formatDateForInput(event.date),
          time: event.time,
          place: event.place,
          description: event.description ?? "",
        }
      : {
          type: "regular_rehearsal",
        },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FormValues) => {
    // Combine date + time into ISO datetime string
    const dateTime = new Date(`${data.date}T${data.time}:00`).toISOString();

    const body = {
      name: data.name,
      type: data.type,
      date: dateTime,
      time: data.time,
      place: data.place,
      description: data.description || undefined,
    };

    const url =
      mode === "create" ? "/api/events" : `/api/events/${event!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || t("toast.error"));
        return;
      }

      toast.success(t("toast.saveSuccess"));
      router.push("/events");
    } catch {
      toast.error(t("toast.networkError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">{t("events.name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">{t("events.type")}</Label>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setValue("type", value as FormValues["type"])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`events.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">{t("events.date")}</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">{t("events.time")}</Label>
          <Input id="time" type="time" {...register("time")} />
          {errors.time && (
            <p className="text-sm text-destructive">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="place">{t("events.place")}</Label>
        <Input id="place" {...register("place")} />
        {errors.place && (
          <p className="text-sm text-destructive">{errors.place.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("events.description")}</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("common.loading")
            : mode === "create"
              ? t("events.create")
              : t("events.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/events")}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
