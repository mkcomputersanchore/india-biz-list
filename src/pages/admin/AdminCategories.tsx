import CategoryManagement from '@/components/admin/CategoryManagement';

export default function AdminCategories() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground">
          Manage business categories
        </p>
      </div>
      
      <CategoryManagement />
    </div>
  );
}
