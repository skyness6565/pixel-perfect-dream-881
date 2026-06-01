-- New bookings start as pending
ALTER TABLE public.appointments ALTER COLUMN status SET DEFAULT 'pending';

-- Allow admins to update appointment status
CREATE POLICY "Admins can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));