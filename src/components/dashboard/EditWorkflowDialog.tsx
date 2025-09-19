import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EditWorkflowDialog = ({ editingWorkflow, setEditingWorkflow, handleSaveEdit }) => {
    return (
        <Dialog open={!!editingWorkflow} onOpenChange={(open) => !open && setEditingWorkflow(null)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Workflow</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                            Workflow Name
                        </label>
                        <Input
                            id="edit-name"
                            value={editingWorkflow?.name || ""}
                            onChange={(e) => setEditingWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <Textarea
                            id="edit-description"
                            value={editingWorkflow?.desc || ""}
                            onChange={(e) => setEditingWorkflow(prev => prev ? { ...prev, desc: e.target.value } : null)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-price" className="block text-sm font-medium mb-1">
                            Price (FLOW)
                        </label>
                        <Input
                            id="edit-price"
                            type="number"
                            step="0.001"
                            value={editingWorkflow?.price || ""}
                            onChange={(e) => setEditingWorkflow(prev => prev ? { ...prev, price: e.target.value } : null)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-image" className="block text-sm font-medium mb-1">
                            Workflow Image
                        </label>
                        <Input
                            id="edit-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditingWorkflow(prev => prev ? { ...prev, image: e.target.files?.[0] || null } : null)}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-workflow" className="block text-sm font-medium mb-1">
                            Workflow JSON File
                        </label>
                        <Input
                            id="edit-workflow"
                            type="file"
                            accept=".json"
                            onChange={(e) => setEditingWorkflow(prev => prev ? { ...prev, workflow: e.target.files?.[0] || null } : null)}
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditWorkflowDialog;