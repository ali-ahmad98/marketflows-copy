import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WorkflowUploadProps {
  address: string;
}

export const WorkflowUpload : React.FC<WorkflowUploadProps> = ({ address }) => {
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
    workflow: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: null as File | null,
      workflow: null as File | null,
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("desc", formData.description);
    data.append("seller", address);
    data.append("price", formData.price);
    if (formData.image) {
      data.append("image", formData.image);
    }
    if (formData.workflow) {
      data.append("workflowJson", formData.workflow);
    }

    fetch(`${apiUrl}/workflow/create`, {
      method: "POST",
      body: data,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Upload failed");
        }
        return res.json();
      })
      .then((result) => {
        console.log("Upload successful:", result);
        toast({
          title: "Workflow Listed",
          description: "Your workflow has been listed for sale successfully.",
        });
        resetForm();
      })
      .catch((error) => {
        console.error("Error uploading:", error);
        toast({
          title: "Upload Failed",
          description: "An error occurred while listing your workflow."
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>List a New Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Workflow Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Price (FLOW)
            </label>
            <Input
              id="price"
              type="number"
              step="0.001"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              Optional: Workflow Image
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
            />
          </div>

          <div>
            <label htmlFor="workflow" className="block text-sm font-medium mb-1">
              Workflow JSON File
            </label>
            <Input
              id="workflow"
              type="file"
              accept=".json"
              onChange={(e) => setFormData({ ...formData, workflow: e.target.files?.[0] || null })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            List Workflow
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};