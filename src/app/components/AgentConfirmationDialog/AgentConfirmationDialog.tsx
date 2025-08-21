import React from "react";
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
import type { Agent } from "@/app/types/types";

interface AgentConfirmationDialogProps {
  agent: Agent | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AgentConfirmationDialog: React.FC<AgentConfirmationDialogProps> = ({
  agent,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Switch to {agent.name}?
          </DialogTitle>
          <DialogDescription>
            You are about to switch from your current agent to{" "}
            <span className="font-semibold">{agent.name}</span>.
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Switch Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};