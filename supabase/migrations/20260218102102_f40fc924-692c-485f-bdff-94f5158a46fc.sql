
-- Support tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bill payments table
CREATE TABLE public.bill_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  biller_name text NOT NULL,
  biller_category text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid REFERENCES public.accounts(id),
  status text NOT NULL DEFAULT 'completed',
  reference_number text NOT NULL DEFAULT ('BILL-' || substr(gen_random_uuid()::text, 1, 8)),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bills" ON public.bill_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bills" ON public.bill_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
