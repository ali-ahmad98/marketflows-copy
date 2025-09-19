
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Loader2, Download, ArrowLeft } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAbi } from "@/abi/contractAbi";
import { tokenAbi } from '@/abi/tokenAbi';
import { ethers } from 'ethers';
import { baseSepolia } from "wagmi/chains";
import { simulateContract, readContract } from '@wagmi/core'
import { config } from "../../wagmi.config";


const Generator = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [generatedWorkflows, setGeneratedWorkflows] = useState([]);
  const itemsPerPage = 5;
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchWorkflows = async () => {
    // Mock API call - replace with actual API endpoint
    const res = await fetch(`${apiUrl}/generatedWorkflow/getPrevious?requester=${address}`);
    const data = await res.json();
    setGeneratedWorkflows(data.workflows);
  };

  useEffect(() =>{
    try {
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  }, [address]);

  const totalPages = Math.ceil(generatedWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = generatedWorkflows.slice(startIndex, endIndex);

  const handleGeneratedDownload = async (fileUrl) => {
    try {
      const fileName = fileUrl.split('/').pop();
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'workflow.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download workflow",
      });
    }
  }

  const handleGenerate = async () => {
    const contractAddress = '0x7b96aF9Bd211cBf6BA5b0dd53aa61Dc5806b6AcE';
    const tokenAddress = '0xfd6B1E6Fc2a336196D985531d455c878aCFEbB20';
    const amount = ethers.parseUnits('20', 18);

    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt first",
      });
      return;
    }
    
    const currentAllowance = await readContract(config, {
      abi: tokenAbi,
      address: tokenAddress,
      functionName: 'allowance',
      args: [address, contractAddress],
      account: address
    });
    const allowanceBigInt = BigInt(currentAllowance.toString());

    if (allowanceBigInt < amount) {
      try {
        toast({
          title: "Approve transaction",
          description: "Approve to spend your FLOW..",
          duration: 3000
        });
        await writeContractAsync({
          abi: tokenAbi,
          address: tokenAddress,
          functionName: 'approve',
          args: [contractAddress, ethers.MaxInt256],
          account: address,
          chain: baseSepolia
        })
      } catch (error) {
        console.error('Failed to approve:', error);
        toast({
          title: "Purchase Failed",
          description: "An error occurred during approval.",
          duration: 5000
        });
        return;
      }
    }

    try {
      const { request } = await simulateContract(config, {
        abi: contractAbi,
        address: contractAddress,
        functionName: 'generateAgent',
        args: [amount],
        account: address,
        chain: baseSepolia
      })
      console.log(request)

      toast({
        title: "Purchasing workflow..",
        description: "Confirm purchase in your wallet.",
        duration: 1500
      });
      const txnHash = await writeContractAsync(request)
    } catch (error) {
      console.error('Failed to purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during purchase.",
        duration: 5000
      });
      return;
    }

    setIsGenerating(true);
    try {
      await fetch(`${apiUrl}/generatedWorkflow/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requester: address,
          reqPrompt: prompt
        })
      });
      
      await fetchWorkflows();
      
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
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
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
                    <TableHead className="w-[70%]">Prompt</TableHead>
                    <TableHead className="w-[20%]">Date</TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentWorkflows.map((workflow) => (
                    <TableRow key={workflow._id}>
                      <TableCell>{workflow.desc}</TableCell>
                      <TableCell>{workflow.generatedAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGeneratedDownload(workflow.fileUrl)}
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
        </div>
      </div>
    </div>
  );
};

export default Generator;
