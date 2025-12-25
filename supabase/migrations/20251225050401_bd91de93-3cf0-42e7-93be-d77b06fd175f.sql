-- Create business_claims table for claim requests
CREATE TABLE public.business_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_document TEXT,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_transfers table for transfer requests
CREATE TABLE public.business_transfers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL,
    to_user_email TEXT NOT NULL,
    to_user_id UUID,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_claims
CREATE POLICY "Users can create claims" ON public.business_claims
    FOR INSERT WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Users can view own claims" ON public.business_claims
    FOR SELECT USING (auth.uid() = claimant_id);

CREATE POLICY "Admins can view all claims" ON public.business_claims
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update claims" ON public.business_claims
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for business_transfers
CREATE POLICY "Owners can create transfers" ON public.business_transfers
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
    );

CREATE POLICY "Involved users can view transfers" ON public.business_transfers
    FOR SELECT USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id OR
        has_role(auth.uid(), 'admin'::app_role)
    );

CREATE POLICY "Target user can update transfer status" ON public.business_transfers
    FOR UPDATE USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE POLICY "Admins can manage transfers" ON public.business_transfers
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_business_claims_updated_at
    BEFORE UPDATE ON public.business_claims
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_transfers_updated_at
    BEFORE UPDATE ON public.business_transfers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();