import { useState } from 'react';
import { useAllUsers, useToggleUserBlock } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminUsers() {
  const { data: users, isLoading } = useAllUsers();
  const toggleBlock = useToggleUserBlock();
  const [search, setSearch] = useState('');

  const filteredUsers = users?.filter((user) => {
    return user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleToggleBlock = async (id: string, currentBlocked: boolean) => {
    try {
      await toggleBlock.mutateAsync({ id, is_blocked: !currentBlocked });
      toast.success(currentBlocked ? 'User unblocked' : 'User blocked');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform users
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    User
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant={user.is_blocked ? 'default' : 'destructive'}
                        onClick={() => handleToggleBlock(user.id, !!user.is_blocked)}
                        disabled={toggleBlock.isPending}
                      >
                        {user.is_blocked ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-1" />
                            Block
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {search ? 'Try adjusting your search' : 'No users have registered yet'}
          </p>
        </div>
      )}
    </div>
  );
}
