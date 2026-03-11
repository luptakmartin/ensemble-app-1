"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Composition } from "@/lib/db/repositories";

const formSchema = z.object({
  name: z.string().min(1),
  author: z.string().min(1),
  duration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CompositionForm({
  composition,
  mode,
}: {
  composition?: Composition;
  mode: "create" | "edit";
}) {
  const t = useTranslations();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: composition
      ? {
          name: composition.name,
          author: composition.author,
          duration: composition.duration ?? "",
        }
      : {},
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const body = {
      name: data.name,
      author: data.author,
      duration: data.duration || undefined,
    };

    const url =
      mode === "create"
        ? "/api/compositions"
        : `/api/compositions/${composition!.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      setServerError(error.error || "An error occurred");
      return;
    }

    router.push("/compositions");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">{t("compositions.name")}</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">{t("compositions.author")}</Label>
        <Input id="author" {...register("author")} />
        {errors.author && (
          <p className="text-sm text-destructive">{errors.author.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">{t("compositions.duration")}</Label>
        <Input id="duration" {...register("duration")} placeholder="3:45" />
      </div>

      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("common.loading")
            : mode === "create"
              ? t("compositions.create")
              : t("compositions.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/compositions")}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
