import { getClinicScopeAnalytics } from "@/lib/actions/analytics";
import { PortalAnalyticsView } from "@/components/analytics/analytics-view";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const data = await getClinicScopeAnalytics();
  if (!data) redirect("/login");
  return <PortalAnalyticsView data={data} />;
}
