import { getAdminPlatformAnalytics } from "@/lib/actions/analytics";
import { AdminAnalyticsView } from "@/components/analytics/analytics-view";
import { notFound } from "next/navigation";

export default async function AdminAnalyticsPage() {
  const data = await getAdminPlatformAnalytics();
  if (!data) notFound();
  return <AdminAnalyticsView data={data} />;
}
