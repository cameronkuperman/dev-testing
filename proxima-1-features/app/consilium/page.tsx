import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { Shield } from "lucide-react";

export default function ConsiliumPage() {
  return (
    <FeaturePlaceholder
      title="Consilium Insurance Helper"
      description="AI-powered insurance navigation and claim assistance with advanced analysis modes"
      gradient="from-blue-500 to-cyan-500"
      icon={<Shield className="w-12 h-12" />}
    />
  );
}