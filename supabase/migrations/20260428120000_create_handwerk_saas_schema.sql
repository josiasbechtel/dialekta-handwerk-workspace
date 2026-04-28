create schema if not exists handwerk;

create table if not exists handwerk.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Dialekta Handwerk Workspace',
  slug text not null unique default 'default',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists handwerk.workspace_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references handwerk.workspaces(id) on delete cascade,
  item_type text not null,
  title text,
  data jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists handwerk.workspace_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references handwerk.workspaces(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
