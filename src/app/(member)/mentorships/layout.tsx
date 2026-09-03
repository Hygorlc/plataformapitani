import { MentorshipPortalNav } from "@/components/mentorships/MentorshipPortalNav";

export default function MentorshipLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px] flex-col lg:flex-row">
      <MentorshipPortalNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
