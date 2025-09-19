import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ShoppingBag, Search } from "lucide-react";
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
        <h2 className="text-2xl font-semibold text-white">All Workflows</h2>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-gray-600/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-4">
        {currentWorkflows.map((workflow) => (
          <div
            key={workflow._id}
            className="workflow-list-item cursor-pointer flex justify-between items-center"
            onClick={() => onWorkflowSelect(workflow)}
          >
            <div>
              <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{workflow.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white">
                <span className="font-semibold">{workflow.price} FLOW</span>
              </div>
              {purchasedWorkflowIds.includes(workflow._id) ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(workflow._id);
                  }}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50"
                  size="sm"
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
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Purchase
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} text-white hover:bg-gray-800/50`}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className={`cursor-pointer text-white hover:bg-gray-800/50 ${currentPage === page ? 'bg-gray-700/50' : ''}`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    `${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} text-white hover:bg-gray-800/50`
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