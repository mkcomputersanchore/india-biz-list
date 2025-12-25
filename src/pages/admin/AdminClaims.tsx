import { useState } from 'react';
import { useAllClaims, useUpdateClaimStatus } from '@/hooks/useClaimsTransfers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { BusinessClaim } from '@/lib/types';

export default function AdminClaims() {
  const { data: claims, isLoading } = useAllClaims();
  const updateStatus = useUpdateClaimStatus();
  const [selectedClaim, setSelectedClaim] = useState<BusinessClaim | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleApprove = async (claim: BusinessClaim) => {
    try {
      await updateStatus.mutateAsync({
        id: claim.id,
        status: 'approved',
        adminNotes,
      });
      toast.success('Claim approved! Ownership transferred.');
      setSelectedClaim(null);
      setAdminNotes('');
    } catch {
      toast.error('Failed to approve claim');
    }
  };

  const handleReject = async (claim: BusinessClaim) => {
    try {
      await updateStatus.mutateAsync({
        id: claim.id,
        status: 'rejected',
        adminNotes,
      });
      toast.success('Claim rejected');
      setSelectedClaim(null);
      setAdminNotes('');
    } catch {
      toast.error('Failed to reject claim');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Claims</h1>
        <p className="text-muted-foreground">Review and manage business ownership claims</p>
      </div>

      {claims && claims.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Claimant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    {claim.business?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {claim.claimant?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    {format(new Date(claim.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No claims yet
        </div>
      )}

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Review the claim for "{selectedClaim?.business?.name}"
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Claimant</label>
                <p className="text-sm text-muted-foreground">
                  {selectedClaim.claimant?.full_name || selectedClaim.claimant?.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Proof / Notes</label>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {selectedClaim.notes || 'No notes provided'}
                </p>
              </div>

              {selectedClaim.status === 'pending' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Admin Notes (Optional)</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(selectedClaim)}
                      disabled={updateStatus.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedClaim)}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Approve & Transfer
                    </Button>
                  </div>
                </>
              )}

              {selectedClaim.status !== 'pending' && selectedClaim.admin_notes && (
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedClaim.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}