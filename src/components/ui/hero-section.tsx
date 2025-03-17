
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaAction?: () => void;
  secondaryCtaText?: string;
  secondaryCtaAction?: () => void;
  rightContent?: ReactNode;
  gradient?: boolean;
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaAction,
  secondaryCtaText,
  secondaryCtaAction,
  rightContent,
  gradient = true,
}: HeroSectionProps) {
  return (
    <div className={`w-full px-4 py-16 md:py-24 ${gradient ? 'bg-gradient-to-br from-purple-50 to-indigo-100' : ''}`}>
      <div className="container mx-auto flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-1/2 pr-0 lg:pr-16 mb-10 lg:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {ctaText && (
              <Button
                onClick={ctaAction}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-full px-8 py-3 text-lg"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            {secondaryCtaText && (
              <Button
                variant="outline"
                onClick={secondaryCtaAction}
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium rounded-full px-8 py-3 text-lg"
              >
                {secondaryCtaText}
              </Button>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          {rightContent}
        </div>
      </div>
    </div>
  );
}
