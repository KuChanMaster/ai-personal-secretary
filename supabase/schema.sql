-- 在 Supabase 项目的 SQL Editor 中执行一次。
create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  note text not null default '',
  due_date date,
  due_time time,
  important boolean not null default false,
  status text not null default 'active' check (status in ('active', 'completed', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz
);

alter table public.tasks enable row level security;

drop policy if exists "own tasks select" on public.tasks;
create policy "own tasks select" on public.tasks for select using (auth.uid() = user_id);

drop policy if exists "own tasks insert" on public.tasks;
create policy "own tasks insert" on public.tasks for insert with check (auth.uid() = user_id);

drop policy if exists "own tasks update" on public.tasks;
create policy "own tasks update" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own tasks delete" on public.tasks;
create policy "own tasks delete" on public.tasks for delete using (auth.uid() = user_id);

create index if not exists tasks_user_id_idx on public.tasks (user_id);