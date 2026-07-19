import { ComingSoonTab } from "@/components/admin/ComingSoonTab";

export default function CourseAffiliatesPage() {
  return (
    <ComingSoonTab
      title="Programa de afiliados"
      description="Permita que outras pessoas divulguem seu curso e ganhem comissão por venda."
      planned={[
        "Definir percentual de comissão por afiliado",
        "Gerar links de rastreamento por afiliado",
        "Relatório de vendas e comissões a pagar",
      ]}
    />
  );
}
