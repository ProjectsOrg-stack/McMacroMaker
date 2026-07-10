-- Create macros table
create table if not exists public.macros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  description text not null default '',
  code text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast user lookups
create index if not exists macros_user_id_idx on public.macros(user_id);

-- Enable RLS
alter table public.macros enable row level security;

-- Users can only see their own macros
create policy "Users can read own macros"
  on public.macros for select
  using (auth.uid() = user_id);

-- Users can insert their own macros
create policy "Users can insert own macros"
  on public.macros for insert
  with check (auth.uid() = user_id);

-- Users can update their own macros
create policy "Users can update own macros"
  on public.macros for update
  using (auth.uid() = user_id);

-- Users can delete their own macros
create policy "Users can delete own macros"
  on public.macros for delete
  using (auth.uid() = user_id);
