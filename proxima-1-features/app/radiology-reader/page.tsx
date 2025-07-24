import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { Microscope } from "lucide-react";

export default function RadiologyReaderPage() {
  return (
    <FeaturePlaceholder
      title="Radiology & Labs Reader"
      description="Advanced medical imaging and laboratory results interpretation"
      gradient="from-emerald-500 to-green-500"
      icon={<Microscope className="w-12 h-12" />}
    />
  );
}