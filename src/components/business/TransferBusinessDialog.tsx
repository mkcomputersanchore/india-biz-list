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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateTransfer } from '@/hooks/useClaimsTransfers';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const transferSchema = z.object({
  toUserEmail: z.string().email('Please enter a valid email address'),
  message: z.string().optional(),
});

interface TransferBusinessDialogProps {
  businessId: string;
  businessName: string;
}

export function TransferBusinessDialog({ businessId, businessName }: TransferBusinessDialogProps) {
  const [open, setOpen] = useState(false);
  const createTransfer = useCreateTransfer();

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toUserEmail: '',
      message: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof transferSchema>) => {
    try {
      await createTransfer.mutateAsync({
        businessId,
        toUserEmail: data.toUserEmail,
        message: data.message,
      });
      toast.success('Transfer request sent! The recipient will be notified.');
      setOpen(false);
      form.reset();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send transfer request';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transfer Ownership
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Business Ownership</DialogTitle>
          <DialogDescription>
            Transfer "{businessName}" to another user. They will need to accept the transfer.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toUserEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter the email of the new owner"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a message for the recipient..."
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
              <Button type="submit" disabled={createTransfer.isPending}>
                {createTransfer.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Transfer Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}