import FeaturePlaceholder from "../../components/FeaturePlaceholder";
import { Search } from "lucide-react";

export default function ConsiliumReconPage() {
  return (
    <FeaturePlaceholder
      title="Consilium - Recon Mode"
      description="Deep investigation and research mode for insurance policy analysis and claim optimization"
      gradient="from-green-500 to-emerald-500"
      icon={<Search className="w-12 h-12" />}
    />
  );
}