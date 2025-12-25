import { useState } from 'react';
import { useAllBusinesses, useUpdateBusinessStatus } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/business/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { BusinessStatus } from '@/lib/types';

export default function AdminBusinesses() {
  const { data: businesses, isLoading } = useAllBusinesses();
  const updateStatus = useUpdateBusinessStatus();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectDialog, setRejectDialog] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredBusinesses = businesses?.filter((business) => {
    const matchesSearch = business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'approved' });
      toast.success('Business approved');
    } catch (error) {
      toast.error('Failed to approve business');
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    
    try {
      await updateStatus.mutateAsync({ 
        id: rejectDialog.id, 
        status: 'rejected',
        rejection_reason: rejectionReason 
      });
      toast.success('Business rejected');
      setRejectDialog(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject business');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage business listings
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Business List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="bg-card rounded-xl border p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Business Image */}
                <div className="w-full md:w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {business.images?.[0] ? (
                    <img
                      src={business.images[0].image_url}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{business.name}</h3>
                    <StatusBadge status={business.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {business.category?.name} • {business.city}, {business.state}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {business.email} • {business.phone}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/business/${business.id}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  {business.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(business.id)}
                        disabled={updateStatus.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectDialog({ id: business.id, name: business.name })}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {business.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectDialog({ id: business.id, name: business.name })}
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  )}
                  
                  {business.status === 'rejected' && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(business.id)}
                      disabled={updateStatus.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>

              {business.status === 'rejected' && business.rejection_reason && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-sm">
                  <span className="font-medium">Rejection Reason: </span>
                  {business.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
          <p className="text-muted-foreground">
            {search || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No businesses have been submitted yet'
            }
          </p>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Business</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{rejectDialog?.name}". This will be visible to the business owner.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || updateStatus.isPending}
            >
              Reject Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
