// ZeroTask — Database Setup Script
// Run with: node setup-db.mjs

const SUPABASE_URL = 'https://dmkzrfjhqugahonnednk.supabase.co'
const ANON_KEY = 'sb_publishable_5QXgGm_YQLmsMlBjanpjwA_t2KAHLIV'

// We need the service_role key to create tables via REST.
// If you don't have it, use the Supabase SQL Editor instead.
// Paste the SQL from the console output into:
// https://supabase.com/dashboard/project/dmkzrfjhqugahonnednk/sql/new

const SQL = `
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- TASKS TABLE
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text,
  due_date    date not null,
  priority    text not null check (priority in ('high', 'medium', 'low')),
  task_type   text not null check (task_type in ('long-term', 'short-term')),
  is_completed boolean not null default false,
  target_id   uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- TARGETS TABLE
create table if not exists targets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Foreign key from tasks to targets
alter table tasks
  add constraint fk_tasks_target
  foreign key (target_id) references targets(id) on delete set null;

-- Row Level Security
alter table tasks enable row level security;
alter table targets enable row level security;

create policy "Users can view their own tasks"
  on tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks"
  on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks"
  on tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks"
  on tasks for delete using (auth.uid() = user_id);

create policy "Users can view their own targets"
  on targets for select using (auth.uid() = user_id);
create policy "Users can insert their own targets"
  on targets for insert with check (auth.uid() = user_id);
create policy "Users can update their own targets"
  on targets for update using (auth.uid() = user_id);
create policy "Users can delete their own targets"
  on targets for delete using (auth.uid() = user_id);
`

console.log('='.repeat(60))
console.log('ZEROTASK DATABASE SETUP')
console.log('='.repeat(60))
console.log('\nCopy the SQL below and paste it into:')
console.log('https://supabase.com/dashboard/project/dmkzrfjhqugahonnednk/sql/new')
console.log('\nThen click RUN (▶️)\n')
console.log('='.repeat(60))
console.log(SQL)
console.log('='.repeat(60))
