import { toggleLessonComplete } from "@/lib/actions/lessons";
import { Button } from "@/components/ui/Button";

export function MarkCompleteButton({
  lessonId,
  courseId,
  courseSlug,
  completed,
}: {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  completed: boolean;
}) {
  const action = async () => {
    "use server";
    await toggleLessonComplete(lessonId, courseId, courseSlug, !completed);
  };

  return (
    <form action={action}>
      <Button type="submit" variant={completed ? "secondary" : "primary"}>
        {completed ? "Concluída ✓" : "Marcar como Concluída"}
      </Button>
    </form>
  );
}
