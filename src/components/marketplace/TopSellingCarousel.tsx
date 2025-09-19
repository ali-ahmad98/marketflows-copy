import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Download } from "lucide-react";
import { Workflow } from "@/types/marketplace";
import { useToast } from "@/components/ui/use-toast";

interface TopSellingCarouselProps {
  workflows: Workflow[];
  onWorkflowSelect: (workflow: Workflow) => void;
  onPurchase: (workflow: Workflow) => void;
  purchasedWorkflowIds: string[];
}

export const TopSellingCarousel = ({
  workflows,
  onWorkflowSelect,
  onPurchase,
  purchasedWorkflowIds,
}: TopSellingCarouselProps) => {
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(apiUrl);
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
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">Top Selling Workflows</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {workflows.map((workflow) => (
            <CarouselItem key={workflow._id} className="md:basis-1/2 lg:basis-1/3">
              <Card
                className="p-6 bg-white border border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer h-full"
                onClick={() => onWorkflowSelect(workflow)}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold mb-2">{workflow.name}</h3>
                  <p className="text-gray-400 mb-4 flex-grow">
                    {workflow.desc}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-blue-400">
                      <span className="text-sm">Price:</span>
                      <span className="ml-2 font-semibold">
                        {workflow.price} FLOW
                      </span>
                    </div>
                    {purchasedWorkflowIds.includes(workflow._id) ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(workflow._id);
                        }}
                        variant="secondary"
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
                        variant="secondary"
                        size="sm"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Purchase
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};