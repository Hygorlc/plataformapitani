import { ComingSoonTab } from "@/components/admin/ComingSoonTab";

export default function CourseCouponsPage() {
  return (
    <ComingSoonTab
      title="Cupons"
      description="Crie cupons de desconto para campanhas e promoções."
      planned={[
        "Criar cupons de valor fixo ou percentual",
        "Definir validade e limite de usos",
        "Aplicar o desconto automaticamente no checkout do Stripe",
      ]}
    />
  );
}
