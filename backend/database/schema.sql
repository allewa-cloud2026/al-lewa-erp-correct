-- ============================================================
-- LEWA MERCHANDISING & DELIVERY CONTROL SYSTEM
-- Supabase PostgreSQL Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- AREAS & SHOPS
-- ============================================================
create table if not exists areas (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  region text,
  created_at timestamptz default now()
);

create table if not exists shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  branch text,
  area_id uuid references areas(id),
  contact_person text,
  phone text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  gps_link text,
  address text,
  status text default 'Active' check (status in ('Active','Inactive')),
  created_at timestamptz default now()
);

create table if not exists shop_staff_assignments (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  assigned_at timestamptz default now()
);

-- ============================================================
-- USERS / PROFILES (extends Supabase auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_uid text unique default ('USR-' || substr(uuid_generate_v4()::text, 1, 8)),
  full_name text,
  employee_id text unique,
  mobile text,
  role text not null check (role in ('Admin','MD','Chief Manager','Monitoring Manager','Merchandiser','Salesman','Driver','Accountant')),
  area_id uuid references areas(id),
  status text default 'Active' check (status in ('Active','Inactive')),
  profile_photo_url text,
  last_login timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================================
-- LOGIN / SESSION TRACKING
-- ============================================================
create table if not exists login_sessions (
  id uuid primary key default uuid_generate_v4(),
  session_token text unique default uuid_generate_v4()::text,
  user_id uuid references profiles(id),
  device_type text,
  device_name text,
  device_os text,
  ip_address text,
  login_at timestamptz default now(),
  last_seen timestamptz default now(),
  logout_at timestamptz,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  date date not null default current_date,
  check_in_time timestamptz,
  check_out_time timestamptz,
  check_in_lat numeric(10,7),
  check_in_lng numeric(10,7),
  check_out_lat numeric(10,7),
  check_out_lng numeric(10,7),
  attendance_distance_m numeric(8,2),
  attendance_proximity_status text default 'Unknown' check (attendance_proximity_status in ('Confirmed','Warning','Suspicious','Unknown')),
  selfie_url text,
  status text default 'Present' check (status in ('Present','Absent','Late','Leave','Half Day')),
  late_minutes integer default 0,
  approved_by uuid references profiles(id),
  approval_status text default 'Pending' check (approval_status in ('Pending','Approved','Rejected')),
  remarks text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ============================================================
-- SHOP VISITS
-- ============================================================
create table if not exists shop_visits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  shop_id uuid references shops(id),
  visit_date date default current_date,
  check_in_time timestamptz,
  check_out_time timestamptz,
  check_in_lat numeric(10,7),
  check_in_lng numeric(10,7),
  distance_from_shop numeric(8,2),
  distance_status text default 'Unknown' check (distance_status in ('Confirmed','Warning','Suspicious','Unknown')),
  requires_manager_approval boolean default false,
  is_fake_visit boolean default false,
  status text default 'Pending' check (status in ('Pending','Checked In','Completed','Skipped')),
  shelf_visibility_score integer check (shelf_visibility_score between 0 and 5),
  display_photos text[],
  out_of_stock_items text[],
  lpo_pdf_url text,
  notes text,
  approved_by uuid references profiles(id),
  approval_status text default 'Pending' check (approval_status in ('Pending','Approved','Rejected')),
  created_at timestamptz default now()
);

-- ============================================================
-- LPO (Local Purchase Orders)
-- ============================================================
create table if not exists lpos (
  id uuid primary key default uuid_generate_v4(),
  lpo_number text unique,
  shop_id uuid references shops(id),
  salesman_id uuid references profiles(id),
  visit_id uuid references shop_visits(id),
  amount numeric(10,3),
  pdf_url text,
  invoice_url text,
  status text default 'Pending' check (status in ('Pending','Approved','Invoiced','Delivered','Rejected')),
  follow_up_remarks text,
  created_at timestamptz default now()
);

-- ============================================================
-- DELIVERIES
-- ============================================================
create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  delivery_number text unique,
  lpo_id uuid references lpos(id),
  shop_id uuid references shops(id),
  driver_id uuid references profiles(id),
  assigned_date date,
  start_time timestamptz,
  reach_time timestamptz,
  exit_time timestamptz,
  start_lat numeric(10,7),
  start_lng numeric(10,7),
  reach_lat numeric(10,7),
  reach_lng numeric(10,7),
  delivery_distance_m numeric(8,2),
  delivery_proximity_status text default 'Unknown' check (delivery_proximity_status in ('Confirmed','Warning','Suspicious','Unknown')),
  status text default 'Assigned' check (status in ('Assigned','In Transit','Delivered','Delayed','Failed')),
  delay_reason text,
  grv_image_url text,
  delivery_proof_url text,
  customer_remarks text,
  is_on_time boolean,
  grv_confirmed boolean default false,
  grv_confirmed_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- SALES ORDERS
-- ============================================================
create table if not exists sales_orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique,
  shop_id uuid references shops(id),
  salesman_id uuid references profiles(id),
  order_date date default current_date,
  amount numeric(10,3),
  status text default 'Draft' check (status in ('Draft','Submitted','Approved','Delivered','Cancelled')),
  collection_status text default 'Pending' check (collection_status in ('Pending','Partial','Collected')),
  collection_amount numeric(10,3) default 0,
  outstanding numeric(10,3),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- DAILY SCORES
-- ============================================================
create table if not exists daily_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  score_date date default current_date,
  role text,
  -- Merchandiser fields
  attendance_score integer default 0,
  visits_score integer default 0,
  shelf_visibility_score integer default 0,
  lpo_score integer default 0,
  display_photo_score integer default 0,
  oos_reporting_score integer default 0,
  timely_update_score integer default 0,
  -- Driver fields
  on_time_delivery_score integer default 0,
  delivery_proof_score integer default 0,
  grv_score integer default 0,
  delay_reason_score integer default 0,
  vehicle_discipline_score integer default 0,
  customer_remarks_score integer default 0,
  -- Salesman fields
  orders_score integer default 0,
  lpo_followup_score integer default 0,
  collection_score integer default 0,
  customer_visit_score integer default 0,
  timely_reporting_score integer default 0,
  -- Manager fields
  team_monitoring_score integer default 0,
  approvals_score integer default 0,
  shop_issue_score integer default 0,
  daily_report_score integer default 0,
  team_discipline_score integer default 0,
  -- Total
  total_score integer default 0,
  rank integer,
  computed_at timestamptz default now(),
  unique(user_id, score_date)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  title text not null,
  body text,
  type text check (type in ('absent','visit_incomplete','lpo_uploaded','delivery_delayed','grv_pending','approval_pending','low_score','accountant_pending','md_summary','general')),
  is_read boolean default false,
  reference_id uuid,
  reference_type text,
  created_at timestamptz default now()
);

-- ============================================================
-- AUTHORIZATIONS
-- ============================================================
create table if not exists authorizations (
  id uuid primary key default uuid_generate_v4(),
  authorization_id text unique default ('AUTH-' || substr(uuid_generate_v4()::text, 1, 8)),
  user_id uuid references profiles(id),
  action text,
  reference_type text,
  reference_id uuid,
  status text default 'Pending' check (status in ('Pending','Approved','Rejected')),
  required_by_role text,
  requested_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references profiles(id),
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- BACKUP LOGS
-- ============================================================
create table if not exists backup_logs (
  id uuid primary key default uuid_generate_v4(),
  backup_id text unique default ('BKP-' || substr(uuid_generate_v4()::text, 1, 8)),
  backup_type text default 'Manual' check (backup_type in ('Daily','Weekly','Monthly','Manual')),
  backup_status text default 'Success' check (backup_status in ('Success','Failed','Running','Scheduled')),
  taken_by uuid references profiles(id),
  taken_at timestamptz default now(),
  scheduled_for timestamptz,
  file_url text,
  size_bytes bigint,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- MANAGER FIELD VISITS
-- ============================================================
create table if not exists manager_field_visits (
  id uuid primary key default uuid_generate_v4(),
  manager_id uuid references profiles(id),
  shop_id uuid references shops(id),
  visit_date date default current_date,
  check_in_time timestamptz,
  check_out_time timestamptz,
  check_in_lat numeric(10,7),
  check_in_lng numeric(10,7),
  inspection_notes text,
  remarks text,
  reviewed_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- DAILY CLOSING REPORTS
-- ============================================================
create table if not exists daily_reports (
  id uuid primary key default uuid_generate_v4(),
  report_date date unique default current_date,
  total_shop_visits integer default 0,
  completed_visits integer default 0,
  lpos_collected integer default 0,
  deliveries_completed integer default 0,
  delivery_delays integer default 0,
  grv_pending integer default 0,
  oos_shops integer default 0,
  staff_present integer default 0,
  staff_absent integer default 0,
  avg_score numeric(5,2) default 0,
  manager_approvals_pending integer default 0,
  accountant_pending integer default 0,
  generated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table attendance enable row level security;
alter table shop_visits enable row level security;
alter table deliveries enable row level security;
alter table notifications enable row level security;

-- Profiles: users see their own; admin/MD see all
create policy "profiles_self" on profiles for select using (auth.uid() = id);
create policy "profiles_admin" on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('Admin','MD'))
);

-- Notifications: own only
create policy "notif_own" on notifications for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA
-- ============================================================
insert into areas (id, name, region) values
  ('11111111-0000-0000-0000-000000000001', 'Muscat Central', 'Muscat'),
  ('11111111-0000-0000-0000-000000000002', 'Muscat North', 'Muscat'),
  ('11111111-0000-0000-0000-000000000003', 'Muscat South', 'Muscat'),
  ('11111111-0000-0000-0000-000000000004', 'Al Batinah', 'Batinah'),
  ('11111111-0000-0000-0000-000000000005', 'Dhofar', 'Dhofar'),
  ('11111111-0000-0000-0000-000000000006', 'Al Dakhiliyah', 'Interior')
on conflict do nothing;

insert into shops (name, branch, area_id, contact_person, phone, latitude, longitude, gps_link) values
  ('Lulu Hypermarket', 'Barka', '11111111-0000-0000-0000-000000000004', 'Ali Hassan', '+968 9200 0001', 23.6895, 57.8677, 'https://maps.google.com/?q=23.6895,57.8677'),
  ('Lulu Hypermarket', 'Seeb', '11111111-0000-0000-0000-000000000002', 'Mohammed Al-Said', '+968 9200 0002', 23.5957, 58.1892, 'https://maps.google.com/?q=23.5957,58.1892'),
  ('Nesto Hypermarket', 'Ruwi', '11111111-0000-0000-0000-000000000001', 'Fatima Al-Balushi', '+968 9200 0003', 23.6103, 58.5933, 'https://maps.google.com/?q=23.6103,58.5933'),
  ('MS Department Store', 'Al Khuwair', '11111111-0000-0000-0000-000000000001', 'Sara Al-Rashidi', '+968 9200 0004', 23.5940, 58.3898, 'https://maps.google.com/?q=23.5940,58.3898'),
  ('Max Fashion', 'Muscat City Centre', '11111111-0000-0000-0000-000000000001', 'Khalid Omar', '+968 9200 0005', 23.5985, 58.4071, 'https://maps.google.com/?q=23.5985,58.4071'),
  ('Al Amri Market', 'Nizwa', '11111111-0000-0000-0000-000000000006', 'Hamad Al-Amri', '+968 9200 0006', 22.9330, 57.5270, 'https://maps.google.com/?q=22.9330,57.5270'),
  ('Carrefour', 'Qurum', '11111111-0000-0000-0000-000000000001', 'Nadia Hassan', '+968 9200 0007', 23.5976, 58.4003, 'https://maps.google.com/?q=23.5976,58.4003'),
  ('Spar', 'Salalah', '11111111-0000-0000-0000-000000000005', 'Badr Al-Rawahi', '+968 9200 0008', 17.0194, 54.0924, 'https://maps.google.com/?q=17.0194,54.0924')
on conflict do nothing;
