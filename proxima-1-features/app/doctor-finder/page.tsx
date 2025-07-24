import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { MapPin } from "lucide-react";

export default function DoctorFinderPage() {
  return (
    <FeaturePlaceholder
      title="Doctor Finder"
      description="Locate nearby healthcare providers with AI-matched specialties"
      gradient="from-green-500 to-emerald-500"
      icon={<MapPin className="w-12 h-12" />}
    />
  );
}