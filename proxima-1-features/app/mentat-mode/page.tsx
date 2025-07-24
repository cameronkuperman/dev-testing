import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { Brain } from "lucide-react";

export default function MentatModePage() {
  return (
    <FeaturePlaceholder
      title="Mentat Mode"
      description="Enhanced cognitive analysis for complex health pattern recognition"
      gradient="from-amber-500 to-yellow-500"
      icon={<Brain className="w-12 h-12" />}
    />
  );
}