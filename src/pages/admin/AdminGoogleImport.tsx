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
import { Search, Upload, Loader2, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fetchedBusinesses, setFetchedBusinesses] = useState<FetchedBusiness[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  const handleFetch = async () => {
    if (!city || !categoryId) {
      toast.error('Please enter city and select category');
      return;
    }

    const category = categories?.find(c => c.id === categoryId);
    if (!category) {
      toast.error('Invalid category');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
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

      const businesses = response.data.businesses.map((b: FetchedBusiness) => ({
        ...b,
        selected: true,
      }));

      setFetchedBusinesses(businesses);
      toast.success(`Found ${businesses.length} businesses`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch businesses';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBusiness = (index: number) => {
    setFetchedBusinesses(prev => 
      prev.map((b, i) => i === index ? { ...b, selected: !b.selected } : b)
    );
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setFetchedBusinesses(prev => prev.map(b => ({ ...b, selected: newValue })));
  };

  const handleImport = async () => {
    const selectedBusinesses = fetchedBusinesses.filter(b => b.selected);
    if (selectedBusinesses.length === 0) {
      toast.error('Please select at least one business');
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const business of selectedBusinesses) {
        try {
          // Check if already exists (by name and city)
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('name', business.name)
            .eq('city', business.city)
            .single();

          if (existing) {
            errorCount++;
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
              email: 'contact@example.com', // Placeholder
              website: business.website,
              category_id: business.category_id,
              owner_id: user.id,
              status: 'approved',
            });

          if (error) {
            console.error('Insert error:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch {
          errorCount++;
        }
      }

      toast.success(`Imported ${successCount} businesses${errorCount > 0 ? `, ${errorCount} failed/duplicates` : ''}`);
      
      // Clear list after import
      setFetchedBusinesses([]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = fetchedBusinesses.filter(b => b.selected).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Places Import</h1>
        <p className="text-muted-foreground">
          Fetch and import businesses from Google Maps
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Search Parameters
          </CardTitle>
          <CardDescription>
            Enter city and category to fetch businesses from Google Maps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                placeholder="e.g., Mumbai, Delhi, Surat"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
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
              <Label>Max Results</Label>
              <Select value={maxResults} onValueChange={setMaxResults}>
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
              <Button onClick={handleFetch} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Fetch from Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {fetchedBusinesses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fetched Businesses</CardTitle>
                <CardDescription>
                  {selectedCount} of {fetchedBusinesses.length} selected for import
                </CardDescription>
              </div>
              <Button onClick={handleImport} disabled={isImporting || selectedCount === 0}>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import Selected ({selectedCount})
              </Button>
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
    </div>
  );
}