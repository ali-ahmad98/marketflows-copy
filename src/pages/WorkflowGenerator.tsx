
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const WorkflowGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 5;

  // Mock data - in a real app this would come from your backend
  const generatedWorkflows = [
    {
      id: "1",
      prompt: "Create a data processing workflow",
      date: "2024-03-15",
      status: "Completed",
    },
    {
      id: "2",
      prompt: "Build an ML training pipeline",
      date: "2024-03-14",
      status: "Completed",
    },
  ];

  const totalPages = Math.ceil(generatedWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = generatedWorkflows.slice(startIndex, endIndex);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt first",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Mock API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating API delay
      
      // Add the new workflow to the list (in a real app, this would come from the API response)
      const newWorkflow = {
        id: String(generatedWorkflows.length + 1),
        prompt: prompt,
        date: new Date().toISOString().split('T')[0],
        status: "Completed"
      };
      
      // In a real app, you would update this through proper state management
      generatedWorkflows.unshift(newWorkflow);
      
      toast({
        title: "Success",
        description: "Workflow generated successfully",
      });
      
      // Reset the form
      setPrompt('');
      setCurrentPage(1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate workflow",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Workflow Generator</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your workflow</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the workflow you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-32"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Workflow"
            )}
          </Button>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Generation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Prompt</TableHead>
                    <TableHead className="w-[25%]">Date</TableHead>
                    <TableHead className="w-[25%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentWorkflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell>{workflow.prompt}</TableCell>
                      <TableCell>{workflow.date}</TableCell>
                      <TableCell>{workflow.status}</TableCell>
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
        </div>
      </div>
    </div>
  );
};

export default WorkflowGenerator;
