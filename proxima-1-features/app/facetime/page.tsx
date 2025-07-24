import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { Phone } from "lucide-react";

export default function FacetimePage() {
  return (
    <FeaturePlaceholder
      title="FaceTime Health"
      description="Virtual health consultations with AI-enhanced video analysis"
      gradient="from-indigo-500 to-purple-500"
      icon={<Phone className="w-12 h-12" />}
    />
  );
}