import { PersonalPanelStatic } from "@/components/card/PersonalPanelStatic";

export async function PersonalSlot({ slug }: { slug: string }) {
  if (process.env.API_MODE === "static") {
    return <PersonalPanelStatic slug={slug} />;
  }
  const { PersonalPanel } = await import("@/components/card/PersonalPanel");
  return <PersonalPanel slug={slug} />;
}
