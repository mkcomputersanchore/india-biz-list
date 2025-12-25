import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BusinessClaim, BusinessTransfer } from '@/lib/types';

// Claims hooks
export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      businessId, 
      notes, 
      proofDocument 
    }: { 
      businessId: string; 
      notes?: string;
      proofDocument?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_claims')
        .insert({
          business_id: businessId,
          claimant_id: user.id,
          notes,
          proof_document: proofDocument,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-claims'] });
    },
  });
}

export function useMyClaims() {
  return useQuery({
    queryKey: ['my-claims'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_claims')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessClaim[];
    },
  });
}

export function useAllClaims() {
  return useQuery({
    queryKey: ['admin-claims'],
    queryFn: async () => {
      // First get the claims
      const { data: claims, error } = await supabase
        .from('business_claims')
        .select(`
          *,
          business:businesses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Then get claimant profiles
      const claimantIds = [...new Set(claims.map(c => c.claimant_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', claimantIds);

      // Merge data
      const claimsWithProfiles = claims.map(claim => ({
        ...claim,
        claimant: profiles?.find(p => p.id === claim.claimant_id),
      }));

      return claimsWithProfiles as BusinessClaim[];
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      adminNotes 
    }: { 
      id: string; 
      status: 'approved' | 'rejected';
      adminNotes?: string;
    }) => {
      const { data: claim, error: claimError } = await supabase
        .from('business_claims')
        .select('business_id, claimant_id')
        .eq('id', id)
        .single();

      if (claimError) throw claimError;

      // Update claim status
      const { error: updateError } = await supabase
        .from('business_claims')
        .update({ 
          status, 
          admin_notes: adminNotes 
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // If approved, transfer ownership
      if (status === 'approved' && claim) {
        const { error: businessError } = await supabase
          .from('businesses')
          .update({ owner_id: claim.claimant_id })
          .eq('id', claim.business_id);

        if (businessError) throw businessError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}

// Transfer hooks
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      businessId, 
      toUserEmail, 
      message 
    }: { 
      businessId: string; 
      toUserEmail: string;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find target user by email
      const { data: targetUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', toUserEmail)
        .single();

      const { data, error } = await supabase
        .from('business_transfers')
        .insert({
          business_id: businessId,
          from_user_id: user.id,
          to_user_email: toUserEmail,
          to_user_id: targetUser?.id || null,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transfers'] });
    },
  });
}

export function useMyTransfers() {
  return useQuery({
    queryKey: ['my-transfers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_transfers')
        .select(`
          *,
          business:businesses(*)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessTransfer[];
    },
  });
}

export function usePendingTransfers() {
  return useQuery({
    queryKey: ['pending-transfers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_transfers')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessTransfer[];
    },
  });
}

export function useRespondToTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      accept 
    }: { 
      id: string; 
      accept: boolean;
    }) => {
      const status = accept ? 'accepted' : 'rejected';

      if (accept) {
        // Get transfer details
        const { data: transfer, error: transferError } = await supabase
          .from('business_transfers')
          .select('business_id, to_user_id')
          .eq('id', id)
          .single();

        if (transferError) throw transferError;

        // Update transfer status
        const { error: updateError } = await supabase
          .from('business_transfers')
          .update({ status })
          .eq('id', id);

        if (updateError) throw updateError;

        // Transfer ownership
        if (transfer.to_user_id) {
          const { error: businessError } = await supabase
            .from('businesses')
            .update({ owner_id: transfer.to_user_id })
            .eq('id', transfer.business_id);

          if (businessError) throw businessError;
        }
      } else {
        const { error } = await supabase
          .from('business_transfers')
          .update({ status })
          .eq('id', id);

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['my-businesses'] });
    },
  });
}

export function useCancelTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_transfers')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-transfers'] });
    },
  });
}