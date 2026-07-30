"use client";

import { deleteStudent } from "@/lib/actions/admin/users";
import { Button } from "@/components/ui/Button";

export function DeleteStudentButton({
  userId,
  studentName,
}: {
  userId: string;
  studentName: string;
}) {
  return (
    <form
      action={deleteStudent.bind(null, userId)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Excluir o aluno ${studentName}? O acesso e as matrículas serão removidos permanentemente.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        Excluir aluno
      </Button>
    </form>
  );
}
