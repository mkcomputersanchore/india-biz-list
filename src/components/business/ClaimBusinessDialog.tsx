import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateClaim } from '@/hooks/useClaimsTransfers';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const claimSchema = z.object({
  notes: z.string().min(10, 'Please provide at least 10 characters explaining why you own this business'),
});

interface ClaimBusinessDialogProps {
  businessId: string;
  businessName: string;
}

export function ClaimBusinessDialog({ businessId, businessName }: ClaimBusinessDialogProps) {
  const [open, setOpen] = useState(false);
  const createClaim = useCreateClaim();

  const form = useForm<z.infer<typeof claimSchema>>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof claimSchema>) => {
    try {
      await createClaim.mutateAsync({
        businessId,
        notes: data.notes,
      });
      toast.success('Claim submitted successfully! We will review it soon.');
      setOpen(false);
      form.reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit claim';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Claim This Business
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Business Ownership</DialogTitle>
          <DialogDescription>
            Claiming "{businessName}" as your business? Please provide proof of ownership.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proof of Ownership</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain how you can prove you own this business (e.g., business registration number, GST number, official documents you can provide)..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClaim.isPending}>
                {createClaim.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Claim
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}