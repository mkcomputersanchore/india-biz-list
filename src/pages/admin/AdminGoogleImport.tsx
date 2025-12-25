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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Search, Upload, Loader2, MapPin, X, Image, Clock, Star, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';
import CategoryManagement from '@/components/admin/CategoryManagement';

interface FetchedPhoto {
  photo_reference: string;
  url: string;
  is_primary: boolean;
}

interface FetchedHour {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

interface FetchedBusiness {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string;
  website: string | null;
  google_maps_url: string | null;
  place_id: string;
  description: string | null;
  price_range: string | null;
  rating: number | null;
  rating_count: number | null;
  business_status: string | null;
  logo_url: string | null;
  photos: FetchedPhoto[];
  hours: FetchedHour[] | null;
  weekday_text: string[] | null;
  selected?: boolean;
  exists?: boolean;
  existingId?: string;
}

export default function AdminGoogleImport() {
  const { data: categories } = useCategories();
  const [city, setCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [maxResults, setMaxResults] = useState('60');
  const [isFetching, setIsFetching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [fetchedBusinesses, setFetchedBusinesses] = useState<FetchedBusiness[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(true);
  
  // Bulk rescrape state
  const [rescrapeCategory, setRescrapeCategory] = useState('');
  const [isRescrapingBulk, setIsRescrapingBulk] = useState(false);
  const [rescrapeProgress, setRescrapeProgress] = useState({ current: 0, total: 0, updated: 0, failed: 0 });
  const [rescrapeLog, setRescrapeLog] = useState<string[]>([]);

  // Step 1: Fetch businesses from Google Maps using custom search term
  const handleFetch = async () => {
    if (!city || !searchTerm) {
      toast.error('Please enter search term and city');
      return;
    }

    setIsFetching(true);
    setFetchedBusinesses([]);
    setCategoryId('');

    try {
      const response = await supabase.functions.invoke('fetch-google-places', {
        body: {
          city,
          category: searchTerm,
          categoryId: 'temp',
          maxResults: parseInt(maxResults),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch businesses');
      }

      const businesses = response.data.businesses as FetchedBusiness[];
      
      // Check which businesses already exist
      const businessesWithStatus = await Promise.all(
        businesses.map(async (b) => {
          const { data: existing } = await supabase
            .from('businesses')
            .select('id')
            .eq('name', b.name)
            .eq('city', b.city)
            .maybeSingle();

          return {
            ...b,
            selected: true,
            exists: !!existing,
            existingId: existing?.id || undefined,
          };
        })
      );

      setFetchedBusinesses(businessesWithStatus);
      setSelectAll(true);
      
      const existingCount = businessesWithStatus.filter(b => b.exists).length;
      const newCount = businessesWithStatus.length - existingCount;
      
      toast.success(
        `Found ${businessesWithStatus.length} businesses (${newCount} new, ${existingCount} existing)`
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch businesses';
      toast.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  // Step 2: Publish selected businesses with chosen category
  const handlePublish = async () => {
    const selectedBusinesses = fetchedBusinesses.filter(b => b.selected);
    
    if (selectedBusinesses.length === 0) {
      toast.error('Please select at least one business to publish');
      return;
    }

    if (!categoryId) {
      toast.error('Please select a category before publishing');
      return;
    }

    setIsPublishing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let successCount = 0;
      let updateCount = 0;
      let skippedCount = 0;

      for (const business of selectedBusinesses) {
        try {
          const businessData = {
            name: business.name,
            address: business.address,
            city: business.city,
            state: business.state,
            pincode: business.pincode,
            phone: business.phone || 'N/A',
            email: 'contact@example.com',
            website: business.website,
            google_maps_url: business.google_maps_url,
            category_id: categoryId,
            owner_id: user.id,
            status: 'approved' as const,
            description: business.description,
            short_description: business.description?.substring(0, 200) || null,
            price_range: business.price_range,
            logo_url: business.logo_url,
          };

          if (business.exists && business.existingId) {
            if (replaceExisting) {
              // Update existing business
              const { error: updateError } = await supabase
                .from('businesses')
                .update(businessData)
                .eq('id', business.existingId);

              if (updateError) {
                console.error('Update error:', updateError);
                continue;
              }

              // Delete old images and hours
              await supabase.from('business_images').delete().eq('business_id', business.existingId);
              await supabase.from('business_hours').delete().eq('business_id', business.existingId);

              // Add new images
              if (business.photos && business.photos.length > 0) {
                const imageInserts = business.photos.map(photo => ({
                  business_id: business.existingId!,
                  image_url: photo.url,
                  is_primary: photo.is_primary,
                }));
                await supabase.from('business_images').insert(imageInserts);
              }

              // Add new hours
              if (business.hours && business.hours.length > 0) {
                const hoursInserts = business.hours.map(h => ({
                  business_id: business.existingId!,
                  day_of_week: h.day_of_week,
                  open_time: h.open_time,
                  close_time: h.close_time,
                  is_closed: h.is_closed,
                }));
                await supabase.from('business_hours').insert(hoursInserts);
              }

              updateCount++;
            } else {
              skippedCount++;
            }
            continue;
          }

          // Insert new business
          const { data: inserted, error } = await supabase
            .from('businesses')
            .insert(businessData)
            .select('id')
            .single();

          if (error) {
            console.error('Insert error:', error);
            continue;
          }

          // Add images
          if (inserted && business.photos && business.photos.length > 0) {
            const imageInserts = business.photos.map(photo => ({
              business_id: inserted.id,
              image_url: photo.url,
              is_primary: photo.is_primary,
            }));
            await supabase.from('business_images').insert(imageInserts);
          }

          // Add business hours
          if (inserted && business.hours && business.hours.length > 0) {
            const hoursInserts = business.hours.map(h => ({
              business_id: inserted.id,
              day_of_week: h.day_of_week,
              open_time: h.open_time,
              close_time: h.close_time,
              is_closed: h.is_closed,
            }));
            await supabase.from('business_hours').insert(hoursInserts);
          }

          successCount++;
        } catch (err) {
          console.error('Error processing business:', err);
        }
      }

      const messages: string[] = [];
      if (successCount > 0) messages.push(`${successCount} new`);
      if (updateCount > 0) messages.push(`${updateCount} updated`);
      if (skippedCount > 0) messages.push(`${skippedCount} skipped`);
      
      toast.success(`Published: ${messages.join(', ')}`);
      
      // Clear the list after publishing
      setFetchedBusinesses([]);
      setCity('');
      setSearchTerm('');
      setCategoryId('');
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
    setCategoryId('');
  };

  const selectedCount = fetchedBusinesses.filter(b => b.selected).length;
  const existingCount = fetchedBusinesses.filter(b => b.exists).length;
  const newCount = fetchedBusinesses.length - existingCount;

  // Bulk rescrape handler
  const handleBulkRescrape = async () => {
    if (!rescrapeCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsRescrapingBulk(true);
    setRescrapeLog([]);
    setRescrapeProgress({ current: 0, total: 0, updated: 0, failed: 0 });

    try {
      // Fetch all businesses in the category
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, city, state')
        .eq('category_id', rescrapeCategory)
        .eq('status', 'approved');

      if (error) throw error;

      if (!businesses || businesses.length === 0) {
        toast.error('No businesses found in this category');
        setIsRescrapingBulk(false);
        return;
      }

      setRescrapeProgress(prev => ({ ...prev, total: businesses.length }));
      setRescrapeLog(prev => [...prev, `Starting rescrape of ${businesses.length} businesses...`]);

      let updated = 0;
      let failed = 0;

      for (let i = 0; i < businesses.length; i++) {
        const business = businesses[i];
        setRescrapeProgress(prev => ({ ...prev, current: i + 1 }));
        setRescrapeLog(prev => [...prev, `[${i + 1}/${businesses.length}] Processing: ${business.name}`]);

        try {
          // Call rescrape function
          const response = await supabase.functions.invoke('rescrape-business', {
            body: { businessName: business.name, city: business.city },
          });

          if (response.error || !response.data?.success) {
            setRescrapeLog(prev => [...prev, `  ❌ Failed: ${response.data?.error || 'Unknown error'}`]);
            failed++;
            continue;
          }

          const freshData = response.data.business;

          // Update business data
          const updateData: Record<string, unknown> = {};
          if (freshData.phone) updateData.phone = freshData.phone;
          if (freshData.website) updateData.website = freshData.website;
          if (freshData.google_maps_url) updateData.google_maps_url = freshData.google_maps_url;
          if (freshData.description) updateData.description = freshData.description;
          if (freshData.price_range) updateData.price_range = freshData.price_range;
          if (freshData.logo_url) updateData.logo_url = freshData.logo_url;
          if (freshData.pincode) updateData.pincode = freshData.pincode;

          if (Object.keys(updateData).length > 0) {
            await supabase.from('businesses').update(updateData).eq('id', business.id);
          }

          // Update images
          if (freshData.photos && freshData.photos.length > 0) {
            await supabase.from('business_images').delete().eq('business_id', business.id);
            const imageInserts = freshData.photos.map((photo: { url: string; is_primary: boolean }) => ({
              business_id: business.id,
              image_url: photo.url,
              is_primary: photo.is_primary,
            }));
            await supabase.from('business_images').insert(imageInserts);
          }

          // Update hours
          if (freshData.hours && freshData.hours.length > 0) {
            await supabase.from('business_hours').delete().eq('business_id', business.id);
            const hoursInserts = freshData.hours.map((h: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }) => ({
              business_id: business.id,
              day_of_week: h.day_of_week,
              open_time: h.open_time,
              close_time: h.close_time,
              is_closed: h.is_closed,
            }));
            await supabase.from('business_hours').insert(hoursInserts);
          }

          setRescrapeLog(prev => [...prev, `  ✅ Updated successfully`]);
          updated++;
          setRescrapeProgress(prev => ({ ...prev, updated }));

        } catch (err) {
          console.error('Rescrape error:', err);
          setRescrapeLog(prev => [...prev, `  ❌ Error: ${err instanceof Error ? err.message : 'Unknown'}`]);
          failed++;
        }

        setRescrapeProgress(prev => ({ ...prev, failed }));
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setRescrapeLog(prev => [...prev, `\n✨ Completed! Updated: ${updated}, Failed: ${failed}`]);
      toast.success(`Bulk rescrape complete: ${updated} updated, ${failed} failed`);

    } catch (error) {
      console.error('Bulk rescrape error:', error);
      toast.error('Failed to run bulk rescrape');
      setRescrapeLog(prev => [...prev, `❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown'}`]);
    } finally {
      setIsRescrapingBulk(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Places Import</h1>
        <p className="text-muted-foreground">
          Fetch businesses from Google Maps with full details (hours, photos, description)
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Import Businesses</TabsTrigger>
          <TabsTrigger value="rescrape">Bulk Rescrape</TabsTrigger>
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
                Enter a custom search term (e.g., "restaurants", "hotels", "gyms") and city to fetch businesses with full details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search Term *</Label>
                  <Input
                    placeholder="e.g., Restaurants, Hotels, Gyms"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={fetchedBusinesses.length > 0}
                  />
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
                    disabled={isFetching || !city || !searchTerm || fetchedBusinesses.length > 0} 
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

          {/* Step 2: Review, Select Category and Publish */}
          {fetchedBusinesses.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Step 2: Select Category & Publish</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {selectedCount} of {fetchedBusinesses.length} selected
                        <Badge variant="secondary">{newCount} new</Badge>
                        <Badge variant="outline">{existingCount} existing</Badge>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearResults}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                  
                  {/* Category Selection & Options */}
                  <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Assign Category *</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category for these businesses" />
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
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Replace Existing</p>
                            <p className="text-xs text-muted-foreground">Update data for existing businesses</p>
                          </div>
                        </div>
                        <Switch
                          checked={replaceExisting}
                          onCheckedChange={setReplaceExisting}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handlePublish} 
                      disabled={isPublishing || selectedCount === 0 || !categoryId}
                      className="w-full md:w-auto"
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
                        <TableHead>Status</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Media</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fetchedBusinesses.map((business, index) => (
                        <TableRow key={index} className={business.exists ? 'bg-yellow-50/50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={business.selected}
                              onCheckedChange={() => toggleBusiness(index)}
                            />
                          </TableCell>
                          <TableCell>
                            {business.exists ? (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                Exists
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-green-600">
                                New
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-3">
                              {business.logo_url ? (
                                <img 
                                  src={business.logo_url} 
                                  alt={business.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{business.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {business.phone || 'No phone'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{business.city}, {business.state}</p>
                            {business.pincode && (
                              <p className="text-xs text-muted-foreground">{business.pincode}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {business.rating && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                  {business.rating}
                                </Badge>
                              )}
                              {business.price_range && (
                                <Badge variant="outline" className="text-xs">
                                  {business.price_range}
                                </Badge>
                              )}
                              {business.hours && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Hours
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                <Image className="h-3 w-3 mr-1" />
                                {business.photos?.length || 0}
                              </Badge>
                              {business.description && (
                                <Badge variant="outline" className="text-xs">Desc</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rescrape" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Bulk Rescrape Existing Businesses
              </CardTitle>
              <CardDescription>
                Update all businesses in a category with fresh data from Google Places API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Category</Label>
                  <Select value={rescrapeCategory} onValueChange={setRescrapeCategory} disabled={isRescrapingBulk}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a category to rescrape" />
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
                <div className="flex items-end">
                  <Button 
                    onClick={handleBulkRescrape} 
                    disabled={isRescrapingBulk || !rescrapeCategory}
                    className="w-full"
                  >
                    {isRescrapingBulk ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {isRescrapingBulk ? 'Rescraping...' : 'Start Bulk Rescrape'}
                  </Button>
                </div>
              </div>

              {rescrapeProgress.total > 0 && (
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress: {rescrapeProgress.current} / {rescrapeProgress.total}</span>
                    <div className="flex gap-3">
                      <Badge variant="secondary" className="text-green-600">
                        ✓ {rescrapeProgress.updated} updated
                      </Badge>
                      <Badge variant="outline" className="text-red-600">
                        ✗ {rescrapeProgress.failed} failed
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(rescrapeProgress.current / rescrapeProgress.total) * 100} />
                </div>
              )}

              {rescrapeLog.length > 0 && (
                <div className="space-y-2">
                  <Label>Log</Label>
                  <div className="bg-muted rounded-lg p-3 max-h-[300px] overflow-auto font-mono text-xs">
                    {rescrapeLog.map((log, i) => (
                      <div key={i} className={log.includes('❌') ? 'text-red-600' : log.includes('✅') ? 'text-green-600' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
