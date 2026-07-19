import { ComingSoonTab } from "@/components/admin/ComingSoonTab";

export default function CourseTaxesPage() {
  return (
    <ComingSoonTab
      title="Coleta de impostos"
      description="Configure a retenção e o recolhimento de impostos sobre as vendas."
      planned={[
        "Informar dados fiscais do produtor",
        "Definir alíquotas por região de venda",
        "Emissão automática de nota fiscal",
      ]}
    />
  );
}
