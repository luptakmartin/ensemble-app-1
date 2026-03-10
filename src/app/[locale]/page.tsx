import { redirect } from "@/lib/i18n/routing";

export default function HomePage() {
  redirect({ href: "/events", locale: "cs" });
}
