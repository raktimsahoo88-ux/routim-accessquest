-- Run after you create/sign in the owner account.
update public.profiles set role = 'owner' where email = 'YOUR_OWNER_EMAIL';
