import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, Loader2, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import CategoryManagement from '@/components/admin/CategoryManagement';

interface FetchedBusiness {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string | null;
  category_id: string;
  place_id: string;
  selected?: boolean;
}

export default function AdminGoogleImport() {
  const { data: categories } = useCategories();
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [maxResults, setMaxResults] = useState('60');
  const [isFetching, setIsFetching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [fetchedBusinesses, setFetchedBusinesses] = useState<FetchedBusiness[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Step 1: Fetch businesses from Google Maps
  const handleFetch = async () => {
    if (!city || !categoryId) {
      toast.error('Please select category and enter city');
      return;
    }

    const category = categories?.find(c => c.id === categoryId);
    if (!category) {
      toast.error('Invalid category');
      return;
    }

    setIsFetching(true);
    setFetchedBusinesses([]);

    try {
      const response = await supabase.functions.invoke('fetch-google-places', {
        body: {
          city,
          category: category.name,
          categoryId,
          maxResults: parseInt(maxResults),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch businesses');
      }

      const businesses = (response.data.businesses as FetchedBusiness[]).map(b => ({
        ...b,
        selected: true,
      }));

      setFetchedBusinesses(businesses);
      setSelectAll(true);
      toast.success(`Found ${businesses.length} businesses from Google Maps`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch businesses';
      toast.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  // Step 2: Publish selected businesses
  const handlePublish = async () => {
    const selectedBusinesses = fetchedBusinesses.filter(b => b.selected);
    if (selectedBusinesses.length === 0) {
      toast.error('Please select at least one business to publish');
      return;
    }

    setIsPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let successCount = 0;
      let duplicateCount = 0;

      for (const business of selectedBusinesses) {
        try {
          // Check if already exists
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('name', business.name)
            .eq('city', business.city)
            .maybeSingle();

          if (existing) {
            duplicateCount++;
            continue;
          }

          const { error } = await supabase
            .from('businesses')
            .insert({
              name: business.name,
              address: business.address,
              city: business.city,
              state: business.state,
              phone: business.phone || 'N/A',
              email: 'contact@example.com',
              website: business.website,
              category_id: business.category_id,
              owner_id: user.id,
              status: 'approved',
            });

          if (error) {
            console.error('Insert error:', error);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Error inserting business:', err);
        }
      }

      toast.success(
        `Published ${successCount} businesses` + 
        (duplicateCount > 0 ? `, ${duplicateCount} duplicates skipped` : '')
      );
      
      // Clear the list after publishing
      setFetchedBusinesses([]);
      setCity('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish businesses';
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleBusiness = (index: number) => {
    setFetchedBusinesses(prev => {
      const updated = prev.map((b, i) => i === index ? { ...b, selected: !b.selected } : b);
      setSelectAll(updated.every(b => b.selected));
      return updated;
    });
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setFetchedBusinesses(prev => prev.map(b => ({ ...b, selected: newValue })));
  };

  const clearResults = () => {
    setFetchedBusinesses([]);
  };

  const selectedCount = fetchedBusinesses.filter(b => b.selected).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Places Import</h1>
        <p className="text-muted-foreground">
          Fetch businesses from Google Maps, review and publish them
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Import Businesses</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Step 1: Fetch Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Step 1: Fetch from Google Maps
              </CardTitle>
              <CardDescription>
                Select category and city, then fetch businesses to review before publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} disabled={fetchedBusinesses.length > 0}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    placeholder="e.g., Mumbai, Delhi, Surat"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={fetchedBusinesses.length > 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <Select value={maxResults} onValueChange={setMaxResults} disabled={fetchedBusinesses.length > 0}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleFetch} 
                    disabled={isFetching || !city || !categoryId || fetchedBusinesses.length > 0} 
                    className="w-full"
                  >
                    {isFetching ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Fetch Businesses
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Review and Publish */}
          {fetchedBusinesses.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Step 2: Review & Publish</CardTitle>
                    <CardDescription>
                      {selectedCount} of {fetchedBusinesses.length} businesses selected
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={clearResults}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button 
                      onClick={handlePublish} 
                      disabled={isPublishing || selectedCount === 0}
                    >
                      {isPublishing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Publish Selected ({selectedCount})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-auto max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fetchedBusinesses.map((business, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox
                              checked={business.selected}
                              onCheckedChange={() => toggleBusiness(index)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{business.address}</TableCell>
                          <TableCell>{business.city}</TableCell>
                          <TableCell>{business.phone || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}