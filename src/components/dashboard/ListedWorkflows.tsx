import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EditWorkflowDialog from './EditWorkflowDialog';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect } from "react";

interface WorkflowData {
  _id: string;
  name: string;
  desc?: string;
  price?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  imageUrl?: string;
  fileUrl?: string;
  image?: File;
  workflow?: File;
}

interface ListedWorkflowsProps {
  address: string;
}

export const ListedWorkflows : React.FC<ListedWorkflowsProps> = ({ address }) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowData | null>(null);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
    workflow: null as File | null,
  });
  
  // In a real app, this would come from your backend
  const [listedWorkflows, setListedWorkflows] = useState<WorkflowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/dashboard/getListedWorkflows?&seller=${address}`
        );
        const data = await response.json();
        console.log(data);
        setListedWorkflows(data.workflows);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, [currentPage, address]);

  const totalPages = Math.ceil(listedWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = listedWorkflows.slice(startIndex, endIndex);

  const handleEdit = (workflow: WorkflowData) => {
    setEditingWorkflow(workflow);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be replaced with actual save logic in the future
    const data = new FormData();
    data.append("id", editingWorkflow._id);
    data.append("name", editingWorkflow.name);
    data.append("desc", editingWorkflow.desc);
    data.append("seller", address);
    data.append("price", editingWorkflow.price);
    if (editingWorkflow.image) {
      data.append("image", editingWorkflow.image);
    }
    if (editingWorkflow.workflow) {
      data.append("workflowJson", editingWorkflow.workflow);
    }

    fetch(`${apiUrl}/workflow/edit`, {
      method: "POST",
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Edit failed");
        }
        return res.json();
      })
      .then((result) => {
        console.log("Edit successful:", result);
        toast({
          title: "Workflow Updated",
          description: `Workflow ${editingWorkflow?.name} has been updated successfully. You might need to refresh the page to view updated changes.`,
        });
      })
      .catch((error) => {
        console.error("Error editing:", error);
        toast({
          title: "Edit Failed",
          description: "An error occurred while editing your workflow."
        });
      });
    setEditingWorkflow(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Your Listed Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Workflow Name</TableHead>
                <TableHead className="w-[25%]">Price</TableHead>
                <TableHead className="w-[25%]">Update Date</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWorkflows.map((workflow) => (
                <TableRow key={workflow._id}>
                  <TableCell>{workflow.name}</TableCell>
                  <TableCell>{workflow.price} FLOW</TableCell>
                  <TableCell>{workflow.updatedAt}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(workflow)}
                      title="Edit Workflow"
                    >
                      <Edit2 className="h-4 w-4" />
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

      <EditWorkflowDialog
          editingWorkflow={editingWorkflow}
          setEditingWorkflow={setEditingWorkflow}
          handleSaveEdit={handleSaveEdit}
      />
    </>
  );
};