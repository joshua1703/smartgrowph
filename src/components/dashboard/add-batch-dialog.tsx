"use client";

import { useState } from "react";
import { Plus, Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

export function AddBatchDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiry, setExpiry] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast.success("Mushroom Batch Registered", {
        description: "New oyster mushroom batch successfully assigned to Greenhouse Zone A.",
      });
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 text-xs">
          <Plus className="size-3.5" /> Add Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <PackagePlus className="size-5" />
            <DialogTitle className="text-xl font-bold">Add Oyster Mushroom Batch</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Register a new oyster mushroom fruiting bag batch into the greenhouse.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mushroom" className="text-[10px] font-bold uppercase tracking-widest">
                Strain Type
              </Label>
              <Select defaultValue="oyster-pearl">
                <SelectTrigger id="mushroom" className="h-9 text-xs">
                  <SelectValue placeholder="Select strain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oyster-pearl">Pearl Oyster</SelectItem>
                  <SelectItem value="oyster-blue">Blue Oyster</SelectItem>
                  <SelectItem value="oyster-pink">Pink Oyster</SelectItem>
                  <SelectItem value="oyster-king">King Oyster</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch" className="text-[10px] font-bold uppercase tracking-widest">
                Batch No.
              </Label>
              <Input
                id="batch"
                placeholder="e.g. OM-2026-016"
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stock" className="text-[10px] font-bold uppercase tracking-widest">
                Fruiting Bags Count
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reorder" className="text-[10px] font-bold uppercase tracking-widest">
                Reorder Level
              </Label>
              <Input
                id="reorder"
                type="number"
                placeholder="0"
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest">
                Expiry Date
              </Label>
              <DatePicker 
                date={expiry} 
                setDate={setExpiry} 
                className="h-9 text-xs font-normal" 
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="storage" className="text-[10px] font-bold uppercase tracking-widest">
              Greenhouse Zone
            </Label>
            <Select defaultValue="zone1">
              <SelectTrigger id="storage" className="h-9 text-xs">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zone1">Zone A (Incubation)</SelectItem>
                <SelectItem value="zone2">Zone B (Fruiting)</SelectItem>
                <SelectItem value="zone3">Zone C (Harvesting)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            onClick={(e) => handleSubmit(e as any)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Add Batch to Ledger"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
