import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar, adminNavItems } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/catalog");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={adminNavItems} brandLabel="Admin" />
      <div className="flex flex-1 flex-col">
        <Topbar userName={profile?.full_name ?? user.email ?? "Admin"} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
