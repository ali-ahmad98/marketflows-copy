import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PurchaseHistoryProps {
  address: string;
}

interface PurchasedWorkflowData {
  _id: string;
  amount: string;
  buyer?: string;
  purchasedAt?: string;
  seller?: string;
  txnHash?: string;
  workflowId?: string;
  workflowName?: string;
}

export const PurchaseHistory : React.FC<PurchaseHistoryProps> = ({ address }) => {
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [purchasedWorkflows, setPurchasedWorkflows] = useState<PurchasedWorkflowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real app, this would come from your backend
  useEffect(() => {
      const fetchWorkflows = async () => {
        try {
          const response = await fetch(
            `${apiUrl}/dashboard/getPurchasedWorkflows?buyer=${address}`
          );
          const data = await response.json();
          console.log(data);
          setPurchasedWorkflows(data.workflows);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch workflows:', error);
          setIsLoading(false);
        }
      };
  
      fetchWorkflows();
    }, [currentPage, address]);

  const totalPages = Math.ceil(purchasedWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = purchasedWorkflows.slice(startIndex, endIndex);

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

    toast({
      title: "Download Started",
      description: `Downloading workflow ${purchaseId}...`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Purchase History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Workflow Name</TableHead>
              <TableHead className="w-[25%]">Price</TableHead>
              <TableHead className="w-[25%]">Purchase Date</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPurchases.map((purchase) => (
              <TableRow key={purchase._id}>
                <TableCell>{purchase.workflowName}</TableCell>
                <TableCell>{purchase.amount}</TableCell>
                <TableCell>{purchase.purchasedAt}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(purchase.workflowId)}
                    title="Download Workflow"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};