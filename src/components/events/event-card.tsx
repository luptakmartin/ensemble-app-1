"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { cs, sk, enUS } from "date-fns/locale";
import { Calendar, Clock, MapPin, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventTypeBadge } from "./event-type-badge";
import type { Event } from "@/lib/db/repositories";
import { Link } from "@/lib/i18n/routing";
import { toast } from "sonner";

const dateLocales: Record<string, Locale> = { cs, sk, en: enUS };
const dateFormats: Record<string, string> = {
  cs: "EEEE d. MMMM yyyy",
  sk: "EEEE d. MMMM yyyy",
  en: "EEEE, MMMM d, yyyy",
};

export function EventCard({
  event,
  canEdit,
}: {
  event: Event;
  canEdit: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = format(new Date(event.date), dateFormats[locale] || dateFormats.en, {
    locale: dateLocales[locale] || dateLocales.en,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || t("toast.error"));
      } else {
        toast.success(t("toast.deleteSuccess"));
        router.refresh();
      }
    } catch {
      toast.error(t("toast.networkError"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <CardTitle className="text-lg hover:underline">
              {event.name}
            </CardTitle>
          </Link>
          <div className="flex items-center gap-2">
            <EventTypeBadge type={event.type} />
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      {t("events.edit")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    {t("events.deleteEvent")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Link href={`/events/${event.id}`}>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.place}</span>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("events.deleteEvent")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("events.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
