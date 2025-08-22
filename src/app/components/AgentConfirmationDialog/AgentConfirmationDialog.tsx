import React, { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Agent, AgentParameter } from "@/app/types/types";

interface AgentConfirmationDialogProps {
  agent: Agent | null;
  isOpen: boolean;
  onConfirm: (parameters?: Record<string, any>) => void;
  onCancel: () => void;
}

export const AgentConfirmationDialog: React.FC<AgentConfirmationDialogProps> = ({
  agent,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});

  // Reset parameters when agent changes or dialog opens
  useEffect(() => {
    if (agent?.parameters && isOpen) {
      // Initialize parameters with default values from schema
      const initialParams: Record<string, any> = {};
      Object.entries(agent.parameters).forEach(([key, parameterSchema]) => {
        // Use default value from schema, fallback to appropriate type defaults
        if (parameterSchema.default !== undefined) {
          initialParams[key] = parameterSchema.default;
        } else {
          // Set appropriate default based on type
          switch (parameterSchema.type) {
            case "boolean":
              initialParams[key] = false;
              break;
            case "integer":
              initialParams[key] = 0;
              break;
            case "string":
              initialParams[key] = "";
              break;
            case "file":
              initialParams[key] = null;
              break;
            default:
              initialParams[key] = "";
          }
        }
      });
      setParameters(initialParams);
    }
  }, [agent, isOpen]);

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleConfirm = () => {
    onConfirm(agent?.parameters ? parameters : undefined);
  };

  const renderParameterInput = (key: string, parameterSchema: AgentParameter) => {
    const label = parameterSchema.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const value = parameters[key];

    switch (parameterSchema.renderType) {
      case "switch":
        return (
          <div key={key} className="flex items-center justify-between">
            <label htmlFor={key} className="text-sm font-medium">
              {label}
            </label>
            <Switch
              id={key}
              checked={value || false}
              onCheckedChange={(checked) => handleParameterChange(key, checked)}
            />
          </div>
        );

      case "select":
        if (!parameterSchema.enum || parameterSchema.enum.length === 0) {
          return (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-red-600">
                {label} - Configuration Error: No options provided
              </label>
            </div>
          );
        }
        return (
          <div key={key} className="space-y-2">
            <label htmlFor={key} className="text-sm font-medium">
              {label}
            </label>
            <Select
              value={value || parameterSchema.default || parameterSchema.enum[0]}
              onValueChange={(selectedValue) => handleParameterChange(key, selectedValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {parameterSchema.enum.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "file":
        return (
          <div key={key} className="space-y-2">
            <label htmlFor={key} className="text-sm font-medium">
              {label}
            </label>
            <Input
              id={key}
              type="file"
              accept={parameterSchema.mimeType || "*"}
              multiple={parameterSchema.isMultipleFiles || false}
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const fileValue = parameterSchema.isMultipleFiles ? Array.from(files) : files[0];
                  handleParameterChange(key, fileValue);
                }
              }}
              className="w-full"
            />
            {parameterSchema.mimeType && (
              <p className="text-xs text-muted-foreground">
                Accepted file type: {parameterSchema.mimeType}
              </p>
            )}
          </div>
        );

      case "input":
      default:
        // Handle different input types based on parameter type
        if (parameterSchema.type === "integer") {
          return (
            <div key={key} className="space-y-2">
              <label htmlFor={key} className="text-sm font-medium">
                {label}
              </label>
              <Input
                id={key}
                type="number"
                value={value !== undefined ? value : parameterSchema.default || 0}
                onChange={(e) => handleParameterChange(key, parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          );
        } else {
          return (
            <div key={key} className="space-y-2">
              <label htmlFor={key} className="text-sm font-medium">
                {label}
              </label>
              <Input
                id={key}
                type="text"
                value={value !== undefined ? value : parameterSchema.default || ""}
                onChange={(e) => handleParameterChange(key, e.target.value)}
                className="w-full"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          );
        }
    }
  };

  if (!agent) return null;

  const hasParameters = agent.parameters && Object.keys(agent.parameters).length > 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className={`sm:max-w-[500px] ${hasParameters ? 'max-h-[80vh] overflow-y-auto' : ''}`}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Switch to {agent.name}?
          </DialogTitle>
          <DialogDescription>
            You are about to switch from your current agent to{" "}
            <span className="font-semibold">{agent.name}</span>.
            {hasParameters && " Please configure the parameters below."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <Bot className="h-5 w-5 mt-0.5 text-primary" />
            <div>
              <h4 className="font-medium text-sm">{agent.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {agent.description}
              </p>
            </div>
          </div>

          {hasParameters && (
            <div className="mt-6 space-y-4">
              <h5 className="text-sm font-medium text-foreground">Agent Parameters</h5>
              <div className="space-y-4 p-4 border rounded-lg">
                {Object.entries(agent.parameters || {}).map(([key, parameterSchema]) => 
                  renderParameterInput(key, parameterSchema)
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Switch Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};