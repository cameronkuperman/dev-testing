import FeaturePlaceholder from "../components/FeaturePlaceholder";
import { Bell } from "lucide-react";

export default function MedicationRemindersPage() {
  return (
    <FeaturePlaceholder
      title="Medication Reminders"
      description="Smart medication tracking with interaction warnings and adherence monitoring"
      gradient="from-pink-500 to-purple-500"
      icon={<Bell className="w-12 h-12" />}
    />
  );
}