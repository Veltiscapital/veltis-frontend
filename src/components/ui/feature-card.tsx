
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: string;
  onClick?: () => void;
}

export function FeatureCard({
  icon,
  title,
  description,
  gradient = "from-indigo-50 to-purple-50",
  onClick,
}: FeatureCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`p-6 bg-gradient-to-br ${gradient} border-0 hover:shadow-lg transition-all duration-300 h-full flex flex-col ${onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''}`}
    >
      <div className="flex flex-col h-full">
        <div className="rounded-full bg-white p-3 w-fit mb-4 shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 flex-grow">{description}</p>
      </div>
    </Card>
  );
}
