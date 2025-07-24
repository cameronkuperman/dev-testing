import FeaturePlaceholder from "../../components/FeaturePlaceholder";
import { Brain } from "lucide-react";

export default function ConsiliumMentatPage() {
  return (
    <FeaturePlaceholder
      title="Consilium - Mentat Mode"
      description="Enhanced cognitive analysis for complex insurance claims and policy understanding"
      gradient="from-amber-500 to-yellow-500"
      icon={<Brain className="w-12 h-12" />}
    />
  );
}