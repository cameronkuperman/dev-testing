import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { Activity } from "lucide-react";

export default function AragornPage() {
  return (
    <FeaturePlaceholder
      title="Aragorn/Strider"
      description="Emergency health guidance and wilderness medicine assistant"
      gradient="from-red-500 to-orange-500"
      icon={<Activity className="w-12 h-12" />}
    />
  );
}