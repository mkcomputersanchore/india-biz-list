import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Wifi,
  Car,
  Truck,
  Snowflake,
  Accessibility,
  CreditCard,
  Clock,
  Shield,
  Dog,
  TreeDeciduous,
  Music,
  Key,
  Coffee,
  Utensils,
  Dumbbell,
  Bath,
  Tv,
  Zap,
  Heart,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import type { BusinessAmenity } from '@/lib/types';

const ICON_OPTIONS = [
  { value: 'Wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'Car', label: 'Car/Parking', icon: Car },
  { value: 'Truck', label: 'Delivery', icon: Truck },
  { value: 'Snowflake', label: 'AC/Cold', icon: Snowflake },
  { value: 'Accessibility', label: 'Accessibility', icon: Accessibility },
  { value: 'CreditCard', label: 'Card Payment', icon: CreditCard },
  { value: 'Clock', label: 'Clock/24x7', icon: Clock },
  { value: 'Shield', label: 'Security', icon: Shield },
  { value: 'Dog', label: 'Pet Friendly', icon: Dog },
  { value: 'TreeDeciduous', label: 'Outdoor', icon: TreeDeciduous },
  { value: 'Music', label: 'Music', icon: Music },
  { value: 'Key', label: 'Key/Valet', icon: Key },
  { value: 'Coffee', label: 'Coffee/Cafe', icon: Coffee },
  { value: 'Utensils', label: 'Food', icon: Utensils },
  { value: 'Dumbbell', label: 'Gym/Fitness', icon: Dumbbell },
  { value: 'Bath', label: 'Bathroom', icon: Bath },
  { value: 'Tv', label: 'TV/Entertainment', icon: Tv },
  { value: 'Zap', label: 'Power/Electric', icon: Zap },
  { value: 'Heart', label: 'Health', icon: Heart },
  { value: 'Star', label: 'Premium', icon: Star },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Car, Truck, Snowflake, Accessibility, CreditCard, Clock, Shield,
  Dog, TreeDeciduous, Music, Key, Coffee, Utensils, Dumbbell, Bath, Tv, Zap, Heart, Star
};

function useAmenities() {
  return useQuery({
    queryKey: ['admin-amenities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_amenities')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as BusinessAmenity[];
    },
  });
}

export default function AdminAmenities() {
  const queryClient = useQueryClient();
  const { data: amenities, isLoading } = useAmenities();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<BusinessAmenity | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '' });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string }) => {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { error } = await supabase.from('business_amenities').insert({
        name: data.name,
        icon: data.icon || null,
        slug,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-amenities'] });
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Amenity created successfully');
      setIsAddOpen(false);
      setFormData({ name: '', icon: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create amenity');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; icon: string }) => {
      const { error } = await supabase.from('business_amenities').update({
        name: data.name,
        icon: data.icon || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-amenities'] });
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Amenity updated successfully');
      setEditingAmenity(null);
      setFormData({ name: '', icon: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update amenity');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('business_amenities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-amenities'] });
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Amenity deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete amenity');
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    if (editingAmenity) {
      updateMutation.mutate({ id: editingAmenity.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (amenity: BusinessAmenity) => {
    setEditingAmenity(amenity);
    setFormData({ name: amenity.name, icon: amenity.icon || '' });
  };

  const closeDialog = () => {
    setIsAddOpen(false);
    setEditingAmenity(null);
    setFormData({ name: '', icon: '' });
  };

  const IconComponent = formData.icon ? ICON_MAP[formData.icon] : null;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Amenities</h1>
          <p className="text-muted-foreground">Manage business amenity options</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ name: '', icon: '' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Amenity</DialogTitle>
              <DialogDescription>
                Create a new amenity option for businesses.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Free Wi-Fi"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, icon: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon">
                      {IconComponent && (
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{ICON_OPTIONS.find(o => o.value === formData.icon)?.label}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAmenity} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Amenity</DialogTitle>
            <DialogDescription>
              Update the amenity details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(val) => setFormData(prev => ({ ...prev, icon: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon">
                    {IconComponent && (
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{ICON_OPTIONS.find(o => o.value === formData.icon)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-card rounded-xl border">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : amenities && amenities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amenities.map((amenity) => {
                const AmenityIcon = amenity.icon ? ICON_MAP[amenity.icon] : null;
                return (
                  <TableRow key={amenity.id}>
                    <TableCell>
                      {AmenityIcon ? (
                        <div className="p-2 bg-muted rounded-lg w-fit">
                          <AmenityIcon className="h-5 w-5 text-primary" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{amenity.name}</TableCell>
                    <TableCell className="text-muted-foreground">{amenity.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(amenity)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this amenity?')) {
                              deleteMutation.mutate(amenity.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No amenities found. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
