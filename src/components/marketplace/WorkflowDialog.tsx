import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Download } from "lucide-react";
import { Workflow } from "@/types/marketplace";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface WorkflowDialogProps {
  workflow: Workflow | null;
  onOpenChange: (open: boolean) => void;
  onPurchase: (workflow: Workflow) => void;
  address: string;
}

export const WorkflowDialog = ({
  workflow,
  onOpenChange,
  onPurchase,
  address
}: WorkflowDialogProps) => {
  const [purchased, setPurchased] = useState(false);
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!workflow) return null;

  const handleDownload = async (purchaseId: string) => {
    // This would be replaced with actual download logic in the future
    const response = await fetch(`${apiUrl}/workflow/getIndividual?id=${purchaseId}`);
    const data = await response.json();
    if (data.fileUrl) {
      try {
        var fileName = data.fileUrl.split('/').pop();
        console.log(data.fileUrl);
        fetch(data.fileUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName || "workflow.json";
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
      } catch (err) {
        console.error('Error downloading file:', err);
        toast({
          title: "Download Failed",
          description: "There was an error downloading the file",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/workflow/hasPurchasedWorkflow?buyer=${address}&workflowId=${workflow._id}`).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch purchased workflows");
      }
      return res.json();
    }).then((data) => {
      console.log("Purchased workflow:", data);
      setPurchased(data.hasPurchased);
    })
  }, [workflow, address]);

  return (
    <Dialog open={!!workflow} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {workflow.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <img
            src={workflow.imageUrl}
            alt={workflow.name}
            className="w-full h-64 object-cover rounded-lg transition-all duration-300 hover:shadow-2xl"
          />
          <p className="text-gray-300 text-base">{workflow.desc}</p>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Price:</span>
              <span className="text-white font-semibold text-xl">
                {workflow.price} FLOW
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Seller:</span>
              <span className="text-gray-300 font-mono text-sm">{workflow.seller}</span>
            </div>
            {purchased ? (
              <Button
              onClick={() => handleDownload(workflow._id)}
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 transition-all duration-300"
              size="lg"
              >
              <Download className="w-5 h-5 mr-2" />
              Download Workflow
              </Button>
            ) : (
              <Button
              onClick={() => onPurchase(workflow)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-all duration-300"
              size="lg"
              >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Purchase Workflow
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};