import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { TopSellingCarousel } from "@/components/marketplace/TopSellingCarousel";
import { WorkflowList } from "@/components/marketplace/WorkflowList";
import { WorkflowDialog } from "@/components/marketplace/WorkflowDialog";
import { Header } from "@/components/marketplace/Header";
import { Workflow } from "@/types/marketplace";
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractAbi } from "@/abi/contractAbi";
import { tokenAbi } from '@/abi/tokenAbi';
import { ethers } from 'ethers';
import { baseSepolia } from "wagmi/chains";
import { simulateContract, readContract } from '@wagmi/core'
import { config } from "../../wagmi.config";

const Index = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allWorkflows, setAllWorkflows] = useState([]);
  const [topSellingWorkflows, setTopSellingWorkflows] = useState([]);
  const { writeContractAsync } = useWriteContract();
  const [purchasedWorkflows, setPurchasedWorkflows] = useState([]);

  const filteredWorkflows = allWorkflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const purchasedWorkflowIds = purchasedWorkflows.map((workflow) => workflow.workflowId);

  const handlePurchase = async (workflow: Workflow) => {
    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to purchase workflows.",
      });
      return;
    }

    const contractAddress = '0x7b96aF9Bd211cBf6BA5b0dd53aa61Dc5806b6AcE';
    const tokenAddress = '0xfd6B1E6Fc2a336196D985531d455c878aCFEbB20';
    const amount = ethers.parseUnits(workflow.price.toString(), 18);
    
    const currentAllowance = await readContract(config, {
      abi: tokenAbi,
      address: tokenAddress,
      functionName: 'allowance',
      args: [address, contractAddress],
      account: address
    });
    const allowanceBigInt = BigInt(currentAllowance.toString());

    if (allowanceBigInt < amount) {
      try{ 
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
        functionName: 'purchaseAgent',
        args: [amount, workflow.seller],
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

      fetch(`${apiUrl}/workflow/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer: address,
          workflowId: workflow._id,
          seller: workflow.seller,
          amount: workflow.price,
          txnHash: txnHash
        }),
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            console.log("Purchase successful:", data);
            toast({
              title: "Purchase Successful",
              description: "You have successfully purchased the workflow.",
            });
          });
        }
      }).catch((error) => {
        console.error("Error purchasing:", error);
        toast({
          title: "Purchase Failed",
          description: "An error occurred while purchasing the workflow.",
        });
      });
    } catch (error) {
      console.error('Failed to purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during purchase. Do you have the correct wallet connected?",
        duration: 5000
      });
      return;
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/workflow/getTopWorkflows`).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("Top workflows:", data);
          setTopSellingWorkflows(data.workflows);
        });
      }
    });

    fetch(`${apiUrl}/workflow/getAll`).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("All workflows:", data);
          setAllWorkflows(data.workflows);
        });
      }
    });
  }, []);

  useEffect(() => {
    fetch(`${apiUrl}/dashboard/getPurchasedWorkflows?buyer=${address}`).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          console.log("Purchased workflows:", data);
          setPurchasedWorkflows(data.workflows);
        });
      }
    });
  }, [address]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header/>
        <div className="space-y-12">
          <TopSellingCarousel
            workflows={topSellingWorkflows}
            onWorkflowSelect={setSelectedWorkflow}
            onPurchase={handlePurchase}
            purchasedWorkflowIds={purchasedWorkflowIds}
          />

          <WorkflowList
            workflows={filteredWorkflows}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onWorkflowSelect={setSelectedWorkflow}
            onPurchase={handlePurchase}
            purchasedWorkflowIds={purchasedWorkflowIds}
          />

          {selectedWorkflow &&
            <WorkflowDialog
              workflow={selectedWorkflow}
              onOpenChange={(open) => !open && setSelectedWorkflow(null)}
              onPurchase={handlePurchase}
              address={address}
            />}
        </div>
      </div>
    </div>
  );
};

export default Index;