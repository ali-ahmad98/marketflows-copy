import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ShoppingBag } from "lucide-react";
import { Workflow } from "@/types/marketplace";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

interface WorkflowListProps {
  workflows: Workflow[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onWorkflowSelect: (workflow: Workflow) => void;
  onPurchase: (workflow: Workflow) => void;
  purchasedWorkflowIds: string[];
}

export const WorkflowList = ({
  workflows,
  searchQuery,
  onSearchChange,
  onWorkflowSelect,
  onPurchase,
  purchasedWorkflowIds
}: WorkflowListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(workflows.length / itemsPerPage);
  const apiUrl = import.meta.env.VITE_API_URL;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = workflows.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownload = async (purchaseId: string) => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">All Workflows</h2>
        <Input
          type="search"
          placeholder="Search workflows..."
          className="max-w-xs glass-card"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="space-y-4">
        {currentWorkflows.map((workflow) => (
          <Card
            key={workflow._id}
            className="workflow-card cursor-pointer"
            onClick={() => onWorkflowSelect(workflow)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-gray-500 mt-1">{workflow.desc}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-900">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="ml-2 font-semibold">{workflow.price} FLOW</span>
                </div>
                {purchasedWorkflowIds.includes(searchQuery=workflow._id) ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(workflow._id);
                    }}
                    variant="outline"
                    size="sm"
                    className="glass-card hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPurchase(workflow);
                    }}
                    variant="secondary"
                    size="sm"
                    className="glass-card hover:bg-gray-50"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};