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
import type { Agent } from "@/app/types/types";

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
      // Initialize parameters with default values
      const initialParams: Record<string, any> = {};
      Object.entries(agent.parameters).forEach(([key, value]) => {
        initialParams[key] = value;
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

  const renderParameterInput = (key: string, value: any) => {
    const inputType = typeof value;

    if (inputType === 'boolean') {
      return (
        <div key={key} className="flex items-center space-x-2">
          <input
            id={key}
            type="checkbox"
            checked={parameters[key] || false}
            onChange={(e) => handleParameterChange(key, e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor={key} className="text-sm font-medium capitalize">
            {key.replace(/_/g, ' ')}
          </label>
        </div>
      );
    }

    if (inputType === 'number') {
      return (
        <div key={key} className="space-y-2">
          <label htmlFor={key} className="text-sm font-medium capitalize">
            {key.replace(/_/g, ' ')}
          </label>
          <Input
            id={key}
            type="number"
            value={parameters[key] || value}
            onChange={(e) => handleParameterChange(key, parseInt(e.target.value) || value)}
            className="w-full"
          />
        </div>
      );
    }

    // Default to string input
    return (
      <div key={key} className="space-y-2">
        <label htmlFor={key} className="text-sm font-medium capitalize">
          {key.replace(/_/g, ' ')}
        </label>
        <Input
          id={key}
          type="text"
          value={parameters[key] ?? value}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className="w-full"
          placeholder={`Enter ${key.replace(/_/g, ' ')}`}
        />
      </div>
    );
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
                {Object.entries(agent.parameters || {}).map(([key, value]) => 
                  renderParameterInput(key, value)
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