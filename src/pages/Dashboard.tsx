import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBusinesses, useDeleteBusiness } from '@/hooks/useBusinesses';
import { TransferBusinessDialog } from '@/components/business/TransferBusinessDialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/business/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: businesses, isLoading } = useMyBusinesses();
  const deleteBusiness = useDeleteBusiness();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (authLoading) {
    return (
      <Layout>
        <div className="container-wide py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteBusiness.mutateAsync(deleteId);
      toast.success('Business deleted successfully');
    } catch (error) {
      toast.error('Failed to delete business');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="container-wide py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Businesses</h1>
            <p className="text-muted-foreground mt-1">
              Manage your business listings
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Link>
          </Button>
        </div>

        {/* Business List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : businesses && businesses.length > 0 ? (
          <div className="space-y-4">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-card rounded-xl border p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Business Image */}
                <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg truncate">
                      {business.name}
                    </h3>
                    <StatusBadge status={business.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {business.category?.name} • {business.city}, {business.state}
                  </p>
                  {business.status === 'rejected' && business.rejection_reason && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>Rejection reason: {business.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {business.status === 'approved' && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/business/${business.slug || business.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/edit/${business.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <TransferBusinessDialog 
                    businessId={business.id} 
                    businessName={business.name} 
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteId(business.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No businesses yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first business listing
            </p>
            <Button asChild>
              <Link to="/dashboard/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Business
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this business? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
