import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { ScanLine } from "lucide-react";

export default function DocumentScannerPage() {
  return (
    <FeaturePlaceholder
      title="Medical Document Scanner"
      description="Intelligent OCR and analysis of medical documents and prescriptions"
      gradient="from-cyan-500 to-blue-500"
      icon={<ScanLine className="w-12 h-12" />}
    />
  );
}