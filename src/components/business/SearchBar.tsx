import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';

interface SearchBarProps {
  variant?: 'default' | 'hero';
  initialSearch?: string;
  initialCategory?: string;
  initialCity?: string;
}

export function SearchBar({ 
  variant = 'default', 
  initialSearch = '', 
  initialCategory = '',
  initialCity = '' 
}: SearchBarProps) {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    const queryString = params.toString();
    const basePath = category ? `/businesses/${category}/` : '/businesses/';
    navigate(queryString ? `${basePath}?${queryString}` : basePath);
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSearch} className="w-full">
        <div className="bg-card rounded-2xl shadow-xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {categories?.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.slug);
                  navigate(`/businesses/${cat.slug}/`);
                }}
                className="text-sm text-primary hover:underline"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={category || "all"} onValueChange={(val) => setCategory(val === "all" ? "" : val)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative sm:w-40">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit">
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
