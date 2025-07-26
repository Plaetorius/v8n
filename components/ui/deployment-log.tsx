import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Copy, CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DeploymentLogProps {
  logs: string[];
  success: boolean;
  details?: {
    flowName: string;
    nodeCount: number;
    connectionCount: number;
    authMethod: string;
    n8nStatus: boolean;
    workflowId?: string;
  };
  onClose?: () => void;
}

export function DeploymentLog({ logs, success, details, onClose }: DeploymentLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      setCopied(true);
      toast.success("Logs copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy logs");
    }
  };

  const getStatusIcon = () => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    return <XCircle className="h-5 w-5 text-error" />;
  };

  const getStatusColor = () => {
    return success 
      ? "bg-success-background border-success-border" 
      : "bg-error-background border-error-border";
  };

  return (
    <Card className={`${getStatusColor()} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-base text-foreground">
              {success ? "Deployment Successful" : "Deployment Failed"}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyLogs}
              className="h-8 px-2"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 px-2"
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {details && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Flow: {details.flowName}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Nodes: {details.nodeCount}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Connections: {details.connectionCount}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Auth: {details.authMethod}
            </Badge>
            <Badge variant={details.n8nStatus ? "default" : "destructive"} className="text-xs">
              n8n: {details.n8nStatus ? "Running" : "Offline"}
            </Badge>
            {success && details.workflowId && (
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(`http://localhost:5678/workflow/${details.workflowId}`, '_blank')}
                className="h-6 px-2 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in n8n
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="h-64 w-full rounded-md border bg-background p-4">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-foreground">
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
} 