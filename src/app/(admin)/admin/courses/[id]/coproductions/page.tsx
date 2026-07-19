import { ComingSoonTab } from "@/components/admin/ComingSoonTab";

export default function CourseCoproductionsPage() {
  return (
    <ComingSoonTab
      title="Coproduções"
      description="Divida a receita e a gestão do curso com outros produtores."
      planned={[
        "Convidar coprodutores por e-mail",
        "Definir percentual de divisão da receita",
        "Controlar o nível de acesso de cada coprodutor",
      ]}
    />
  );
}
