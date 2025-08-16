"use client";

import { CourseFormData, CourseUpdateData } from "@/types/schema";
import { Plus, X } from "lucide-react";
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const MaxBenefits = 8;

interface BenefitsManagerProps {
  form: UseFormReturn<CourseFormData | CourseUpdateData>;
}

const BenefitsManager: React.FC<BenefitsManagerProps> = ({ form }) => {
  const [newBenefit, setNewBenefit] = useState("");
  const benefits: string[] = form.watch("benefits") || [];

  const handleAddBenefit = () => {
    const trimmed = newBenefit.trim();
    if (
      trimmed &&
      !benefits.includes(trimmed) &&
      benefits.length < MaxBenefits
    ) {
      form.setValue("benefits", [...benefits, trimmed], {
        shouldValidate: true,
      });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    form.setValue(
      "benefits",
      benefits.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddBenefit();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Benefits</Label>

      {/* Input Section */}
      <div className="flex gap-2">
        <Input
          value={newBenefit}
          onChange={(e) => setNewBenefit(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Third Eye Activation"
          className="flex-1"
          disabled={benefits.length >= MaxBenefits}
        />
        <Button
          type="button"
          onClick={handleAddBenefit}
          disabled={!newBenefit.trim() || benefits.length >= MaxBenefits}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Benefits Display */}
      {benefits.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 text-sm"
              >
                <span>{benefit}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(index)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${benefit}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Counter */}
          <div className="text-xs text-muted-foreground">
            {benefits.length} of {MaxBenefits} benefits added
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Add benefits to highlight what learners will gain from this course
        </div>
      )}
    </div>
  );
};

export default BenefitsManager;
