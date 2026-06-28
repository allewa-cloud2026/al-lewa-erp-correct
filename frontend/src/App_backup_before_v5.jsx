import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { registerSW } from "virtual:pwa-register";

// ── SUPABASE CONFIG ──────────────────────────────────────────
// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── CONSTANTS ────────────────────────────────────────────────
const ROLES = ["Admin","MD","Chief Manager","Monitoring Manager","Merchandiser","Salesman","Driver","Accountant"];
const ROLE_COLORS = {
  "Admin":"#1B5E3F","MD":"#0F6E56","Chief Manager":"#0F6E56",
  "Monitoring Manager":"#C4A747","Merchandiser":"#1B5E3F",
  "Salesman":"#0F6E56","Driver":"#1B5E3F","Accountant":"#656463"
};
const ROLE_BG = {
  "Admin":"#E8F5F1","MD":"#E0F3EC","Chief Manager":"#E0F3EC",
  "Monitoring Manager":"#FEF9E7","Merchandiser":"#E8F5F1",
  "Salesman":"#E0F3EC","Driver":"#E8F5F1","Accountant":"#F1F1F0"
};

const THEME_COLORS = {
  green: "#0F6E56",
  gold: "#C4A747",
  chili: "#C74C51",
  turmeric: "#E8B820",
  coriander: "#6A9E68",
  cardamom: "#D7E8D0",
  beige: "#F5E6D4"
};
const MODULE_ICONS = {
  "Dashboard":"🏠",
  "Users & Authorization":"👥",
  "Shops & Locations":"📍",
  "Product Master":"📦",
  "Attendance":"📋",
  "Merchandiser Visits":"🚶",
  "Delivery Tracking":"🚛",
  "LPO Management":"🧾",
  "Sales Orders":"💼",
  "Daily Scores":"⭐",
  "Backup Logs":"💾",
  "Memo/Documents":"📝",
  "Reports":"📊",
  "Notifications":"🔔",
  "Settings":"⚙️"
};

const DEFAULT_LOGO = "/lewa-logo.png";
const DEFAULT_PROFILE_IMAGE = "/user-photos/default-avatar.png";
const DEFAULT_SHOP_IMAGE = "/shop-photos/default-shop.png";
const DEFAULT_PRODUCT_IMAGE = "/product-images/default-product.png";

const AUTH_CREDENTIALS = {
  admin:{username:"admin",password:"admin123",user_id:"u1"},
  ashik:{username:"ashik",password:"ashik123",user_id:"u12"},
  anees:{username:"anees",password:"anees123",user_id:"u2"}
};

const SCORE_WEIGHTS = {
  Merchandiser:{attendance:20,visits:20,shelf_visibility:20,lpo:15,display_photo:10,oos_reporting:10,timely_update:5},
  Driver:{attendance:20,on_time_delivery:25,delivery_proof:15,grv:15,delay_reason:10,vehicle_discipline:10,customer_remarks:5},
  Salesman:{attendance:20,orders:25,lpo_followup:20,collection:15,customer_visit:10,timely_reporting:10},
  "Monitoring Manager":{attendance:20,team_monitoring:20,approvals:20,shop_issue:15,daily_report:15,team_discipline:10},
  "Chief Manager":{attendance:20,team_monitoring:20,approvals:20,shop_issue:15,daily_report:15,team_discipline:10}
};

const NAV_ITEMS = {
  "Admin":["Dashboard","Users & Authorization","Authorizations","Session Tracker","Shops & Locations","Geographic Areas","Product Master","Attendance","Merchandiser Visits","Delivery Tracking","LPO Management","Sales Orders","Daily Scores","Backup Logs","Memo/Documents","Reports","Notifications","Settings"],
  "MD":["Dashboard","Users & Authorization","Authorizations","Session Tracker","Shops & Locations","Geographic Areas","Product Master","Attendance","Merchandiser Visits","Delivery Tracking","LPO Management","Sales Orders","Daily Scores","Backup Logs","Memo/Documents","Reports","Notifications","Settings"],
  "Chief Manager":["Dashboard","Users & Authorization","Authorizations","Shops & Locations","Geographic Areas","Attendance","Merchandiser Visits","Delivery Tracking","LPO Management","Sales Orders","Daily Scores","Memo/Documents","Reports","Notifications","Settings"],
  "Monitoring Manager":["Dashboard","Users & Authorization","Authorizations","Shops & Locations","Geographic Areas","Attendance","Merchandiser Visits","Daily Scores","Memo/Documents","Reports","Notifications","Settings"],
  "Merchandiser":["Dashboard","Shops & Locations","Attendance","Merchandiser Visits","LPO Management","Daily Scores","Memo/Documents","Reports","Notifications","Settings"],
  "Salesman":["Dashboard","Shops & Locations","LPO Management","Sales Orders","Daily Scores","Memo/Documents","Reports","Notifications","Settings"],
  "Driver":["Dashboard","Shops & Locations","Delivery Tracking","Attendance","Memo/Documents","Reports","Notifications","Settings"],
  "Accountant":["Dashboard","Users & Authorization","Shops & Locations","Product Master","Attendance","Delivery Tracking","LPO Management","Sales Orders","Daily Scores","Backup Logs","Memo/Documents","Reports","Notifications","Settings"]
};

// ── MOCK DATA (used when Supabase not configured) ────────────
const DEMO_MODE = SUPABASE_URL.includes("YOUR_PROJECT");

const MOCK_USER = {id:"u1",full_name:"Ahmed Al-Rashidi",employee_id:"EMP-001",role:"Admin",area_id:"a1",status:"Active"};
const MOCK_AREAS = [
  {id:"a1",name:"Muscat Central",region:"Muscat"},{id:"a2",name:"Muscat North",region:"Muscat"},
  {id:"a3",name:"Al Batinah",region:"Batinah"},{id:"a4",name:"Dhofar",region:"Dhofar"},
  {id:"a5",name:"Al Dakhiliyah",region:"Interior"}
];
const MOCK_SHOPS = [
  {id:"s1",name:"Lulu Hypermarket",branch:"Barka",area_id:"a3",contact_person:"Ali Hassan",phone:"+968 9200 0001",latitude:23.6895,longitude:57.8677,gps_link:"https://maps.google.com/?q=23.6895,57.8677",assigned_merchandiser_id:"u4",assigned_salesman_id:"u5",assigned_driver_id:"u6",shop_logo_url:"/shop-photos/lulu-barka.png",location:"Barka",status:"Active"},
  {id:"s2",name:"Lulu Hypermarket",branch:"Seeb",area_id:"a2",contact_person:"Mohammed Al-Said",phone:"+968 9200 0002",latitude:23.5957,longitude:58.1892,gps_link:"https://maps.google.com/?q=23.5957,58.1892",assigned_merchandiser_id:"u7",assigned_salesman_id:"u8",assigned_driver_id:"u9",shop_logo_url:"/shop-photos/lulu-seeb.png",location:"Seeb",status:"Active"},
  {id:"s3",name:"Nesto Hypermarket",branch:"Ruwi",area_id:"a1",contact_person:"Fatima Al-Balushi",phone:"+968 9200 0003",latitude:23.6103,longitude:58.5933,status:"Active"},
  {id:"s4",name:"MS Department Store",branch:"Al Khuwair",area_id:"a1",contact_person:"Sara Al-Rashidi",phone:"+968 9200 0004",latitude:23.5940,longitude:58.3898,status:"Active"},
  {id:"s5",name:"Max Fashion",branch:"Muscat City Centre",area_id:"a1",contact_person:"Khalid Omar",phone:"+968 9200 0005",latitude:23.5985,longitude:58.4071,status:"Active"},
  {id:"s6",name:"Al Amri Market",branch:"Nizwa",area_id:"a5",contact_person:"Hamad Al-Amri",phone:"+968 9200 0006",latitude:22.9330,longitude:57.5270,status:"Active"},
  {id:"s7",name:"Carrefour",branch:"Qurum",area_id:"a1",contact_person:"Nadia Hassan",phone:"+968 9200 0007",latitude:23.5976,longitude:58.4003,status:"Active"},
  {id:"s8",name:"Spar",branch:"Salalah",area_id:"a4",contact_person:"Badr Al-Rawahi",phone:"+968 9200 0008",latitude:17.0194,longitude:54.0924,status:"Active"},
];
const MOCK_PROFILES = [
  {id:"u1",full_name:"Ahmed Al-Rashidi",employee_id:"EMP-001",mobile:"+968 9100 0001",role:"Admin",area_id:"a1",status:"Active",last_login:"2025-06-25T09:14:00Z",username:"admin",authorization_id:"AUTH-1001",device:"MacBook Pro",location:"Muscat HQ",profile_photo_url:"/user-photos/admin.png"},
  {id:"u2",full_name:"Sara Al-Balushi",employee_id:"EMP-002",mobile:"+968 9100 0002",role:"Chief Manager",area_id:"a2",status:"Active",last_login:"2025-06-25T08:45:00Z",username:"anees",authorization_id:"AUTH-1002",device:"iPhone 14",location:"Seeb Office",profile_photo_url:"/user-photos/manager.png"},
  {id:"u3",full_name:"Khalid Al-Hinai",employee_id:"EMP-003",mobile:"+968 9100 0003",role:"Monitoring Manager",area_id:"a1",status:"Active",last_login:"2025-06-24T17:22:00Z"},
  {id:"u4",full_name:"Fatma Al-Maqbali",employee_id:"EMP-004",mobile:"+968 9100 0004",role:"Merchandiser",area_id:"a3",status:"Active",last_login:"2025-06-25T10:05:00Z"},
  {id:"u5",full_name:"Yousuf Al-Kindi",employee_id:"EMP-005",mobile:"+968 9100 0005",role:"Salesman",area_id:"a4",status:"Active",last_login:"2025-06-25T07:30:00Z"},
  {id:"u6",full_name:"Mariam Al-Siyabi",employee_id:"EMP-006",mobile:"+968 9100 0006",role:"Driver",area_id:"a1",status:"Active",last_login:"2025-06-25T06:00:00Z"},
  {id:"u7",full_name:"Omar Al-Farsi",employee_id:"EMP-007",mobile:"+968 9100 0007",role:"Merchandiser",area_id:"a5",status:"Active",last_login:"2025-06-23T09:00:00Z"},
  {id:"u8",full_name:"Huda Al-Lawati",employee_id:"EMP-008",mobile:"+968 9100 0008",role:"Salesman",area_id:"a2",status:"Active",last_login:"2025-06-24T16:00:00Z"},
  {id:"u9",full_name:"Nasser Al-Tobi",employee_id:"EMP-009",mobile:"+968 9100 0009",role:"Driver",area_id:"a3",status:"Active",last_login:"2025-06-25T05:50:00Z"},
  {id:"u10",full_name:"Layla Al-Amri",employee_id:"EMP-010",mobile:"+968 9100 0010",role:"Merchandiser",area_id:"a1",status:"Inactive",last_login:"2025-06-25T09:45:00Z"},
  {id:"u11",full_name:"Badr Al-Rawahi",employee_id:"EMP-011",mobile:"+968 9100 0011",role:"Accountant",area_id:"a4",status:"Active",last_login:"2025-06-24T14:10:00Z"},
  {id:"u12",full_name:"Aisha Al-Zadjali",employee_id:"EMP-012",mobile:"+968 9100 0012",role:"MD",area_id:"a1",status:"Active",last_login:"2025-06-25T08:00:00Z"},
];
const MOCK_ATTENDANCE = [
  {id:"att1",user_id:"u4",date:"2025-06-25",check_in_time:"2025-06-25T08:02:00Z",status:"Present",approval_status:"Approved",late_minutes:2},
  {id:"att2",user_id:"u5",date:"2025-06-25",check_in_time:"2025-06-25T08:45:00Z",status:"Late",approval_status:"Pending",late_minutes:45},
  {id:"att3",user_id:"u6",date:"2025-06-25",check_in_time:"2025-06-25T07:55:00Z",status:"Present",approval_status:"Approved",late_minutes:0},
  {id:"att4",user_id:"u7",date:"2025-06-25",status:"Absent",approval_status:"Pending"},
  {id:"att5",user_id:"u8",date:"2025-06-25",check_in_time:"2025-06-25T09:00:00Z",status:"Present",approval_status:"Pending",late_minutes:60},
  {id:"att6",user_id:"u9",date:"2025-06-25",check_in_time:"2025-06-25T07:30:00Z",status:"Present",approval_status:"Approved",late_minutes:0},
];
const MOCK_VISITS = [
  {id:"v1",user_id:"u4",shop_id:"s1",visit_date:"2025-06-25",status:"Completed",distance_from_shop:0.12,is_fake_visit:false,lpo_pdf_url:"lpo1.pdf",approval_status:"Approved"},
  {id:"v2",user_id:"u4",shop_id:"s3",visit_date:"2025-06-25",status:"Checked In",distance_from_shop:0.08,is_fake_visit:false,approval_status:"Pending"},
  {id:"v3",user_id:"u7",shop_id:"s6",visit_date:"2025-06-25",status:"Pending",distance_from_shop:null,is_fake_visit:false,approval_status:"Pending"},
  {id:"v4",user_id:"u4",shop_id:"s2",visit_date:"2025-06-24",status:"Completed",distance_from_shop:0.05,is_fake_visit:false,approval_status:"Approved"},
  {id:"v5",user_id:"u10",shop_id:"s7",visit_date:"2025-06-25",status:"Completed",distance_from_shop:2.40,is_fake_visit:true,approval_status:"Rejected"},
];
const MOCK_DELIVERIES = [
  {id:"d1",delivery_number:"DLV-2025-001",shop_id:"s1",driver_id:"u6",status:"Delivered",is_on_time:true,grv_confirmed:true,assigned_date:"2025-06-25"},
  {id:"d2",delivery_number:"DLV-2025-002",shop_id:"s3",driver_id:"u6",status:"In Transit",is_on_time:null,grv_confirmed:false,assigned_date:"2025-06-25"},
  {id:"d3",delivery_number:"DLV-2025-003",shop_id:"s2",driver_id:"u9",status:"Delayed",is_on_time:false,grv_confirmed:false,delay_reason:"Traffic on Sultan Qaboos Highway",assigned_date:"2025-06-25"},
  {id:"d4",delivery_number:"DLV-2025-004",shop_id:"s4",driver_id:"u9",status:"Assigned",is_on_time:null,grv_confirmed:false,assigned_date:"2025-06-25"},
];
const MOCK_LPOS = [
  {id:"l1",lpo_number:"LPO-2025-001",shop_id:"s1",salesman_id:"u5",amount:1250.500,status:"Invoiced",created_at:"2025-06-25T09:00:00Z"},
  {id:"l2",lpo_number:"LPO-2025-002",shop_id:"s3",salesman_id:"u5",amount:875.000,status:"Pending",created_at:"2025-06-25T10:30:00Z"},
  {id:"l3",lpo_number:"LPO-2025-003",shop_id:"s2",salesman_id:"u8",amount:2100.750,status:"Approved",created_at:"2025-06-24T14:00:00Z"},
  {id:"l4",lpo_number:"LPO-2025-004",shop_id:"s4",salesman_id:"u8",amount:450.000,status:"Delivered",created_at:"2025-06-23T11:00:00Z"},
];
const MOCK_SCORES = [
  {id:"sc1",user_id:"u4",score_date:"2025-06-25",role:"Merchandiser",total_score:88,attendance_score:20,visits_score:18,shelf_visibility_score:16,lpo_score:15,display_photo_score:9,oos_reporting_score:8,timely_update_score:2},
  {id:"sc2",user_id:"u5",score_date:"2025-06-25",role:"Salesman",total_score:92,attendance_score:20,orders_score:24,lpo_followup_score:18,collection_score:15,customer_visit_score:9,timely_reporting_score:6},
  {id:"sc3",user_id:"u6",score_date:"2025-06-25",role:"Driver",total_score:95,attendance_score:20,on_time_delivery_score:25,delivery_proof_score:15,grv_score:15,delay_reason_score:10,vehicle_discipline_score:10,customer_remarks_score:0},
  {id:"sc4",user_id:"u7",score_date:"2025-06-25",role:"Merchandiser",total_score:42,attendance_score:0,visits_score:10,shelf_visibility_score:10,lpo_score:10,display_photo_score:5,oos_reporting_score:5,timely_update_score:2},
  {id:"sc5",user_id:"u8",score_date:"2025-06-25",role:"Salesman",total_score:78,attendance_score:15,orders_score:20,lpo_followup_score:15,collection_score:12,customer_visit_score:9,timely_reporting_score:7},
  {id:"sc6",user_id:"u9",score_date:"2025-06-25",role:"Driver",total_score:71,attendance_score:20,on_time_delivery_score:15,delivery_proof_score:12,grv_score:10,delay_reason_score:8,vehicle_discipline_score:6,customer_remarks_score:0},
];
const MOCK_NOTIFICATIONS = [
  {id:"n1",user_id:"u1",title:"Omar Al-Farsi is absent today",body:"EMP-007 has not checked in. Area: Al Dakhiliyah",type:"absent",is_read:false,created_at:"2025-06-25T09:00:00Z"},
  {id:"n2",user_id:"u1",title:"Fake visit flagged",body:"Layla Al-Amri's visit to Carrefour Qurum is 2.4km away from shop.",type:"visit_incomplete",is_read:false,created_at:"2025-06-25T10:15:00Z"},
  {id:"n3",user_id:"u1",title:"Delivery delayed",body:"DLV-2025-003 — Nasser Al-Tobi reported delay on route to Lulu Seeb.",type:"delivery_delayed",is_read:false,created_at:"2025-06-25T11:00:00Z"},
  {id:"n4",user_id:"u1",title:"LPO uploaded",body:"LPO-2025-002 submitted by Yousuf Al-Kindi for Nesto Ruwi — OMR 875.000",type:"lpo_uploaded",is_read:true,created_at:"2025-06-25T10:30:00Z"},
  {id:"n5",user_id:"u1",title:"5 approvals pending",body:"Attendance approvals waiting for your action.",type:"approval_pending",is_read:false,created_at:"2025-06-25T08:00:00Z"},
  {id:"n6",user_id:"u1",title:"Daily MD summary ready",body:"June 25 closing report has been generated.",type:"md_summary",is_read:false,created_at:"2025-06-25T20:00:00Z"},
];

const MOCK_AUTHORIZATIONS = [
  {id:"a1",authorization_id:"AUTH-1A2B3C4D",user_id:"u4",action:"Attendance Approval",reference_type:"attendance",reference_id:"att2",status:"Pending",required_by_role:"Monitoring Manager",requested_at:"2025-06-25T08:55:00Z",note:"Late check-in requires approval"},
  {id:"a2",authorization_id:"AUTH-2E3F4G5H",user_id:"u5",action:"LPO Approval",reference_type:"lpo",reference_id:"l2",status:"Pending",required_by_role:"MD",requested_at:"2025-06-25T10:35:00Z",note:"High value LPO pending review"},
  {id:"a3",authorization_id:"AUTH-3I4J5K6L",user_id:"u6",action:"Delivery GRV Confirmation",reference_type:"delivery",reference_id:"d3",status:"Pending",required_by_role:"Accountant",requested_at:"2025-06-25T11:10:00Z",note:"Delayed delivery requires GRV confirmation"},
];
const MOCK_BACKUP_LOGS = [
  {id:"b1",backup_id:"BKP-2384AC12",backup_type:"Daily",backup_status:"Success",taken_by:"u1",taken_at:"2025-06-25T01:15:00Z",scheduled_for:null,file_url:"/backups/daily-2025-06-25.zip",size_bytes:12503456,notes:"Daily backup completed successfully."},
  {id:"b2",backup_id:"BKP-9F7E2D41",backup_type:"Manual",backup_status:"Failed",taken_by:"u11",taken_at:"2025-06-24T16:30:00Z",scheduled_for:null,file_url:null,size_bytes:null,notes:"Manual backup failed due to network timeout."},
  {id:"b3",backup_id:"BKP-5H8J3K77",backup_type:"Weekly",backup_status:"Success",taken_by:"u11",taken_at:"2025-06-23T02:05:00Z",scheduled_for:null,file_url:"/backups/weekly-2025-06-23.zip",size_bytes:48012548,notes:"Weekly archive saved."},
];
const MOCK_LOGIN_SESSIONS = [
  {id:"s1",session_token:"sess-1",user_id:"u1",device_type:"Desktop",device_name:"MacBook Pro",device_os:"macOS 14",ip_address:"103.23.12.45",login_at:"2025-06-25T08:52:00Z",last_seen:"2025-06-25T10:05:00Z",logout_at:null,active:true,created_at:"2025-06-25T08:52:00Z"},
  {id:"s2",session_token:"sess-2",user_id:"u4",device_type:"Mobile",device_name:"iPhone 14",device_os:"iOS 18",ip_address:"103.23.12.53",login_at:"2025-06-25T09:05:00Z",last_seen:"2025-06-25T09:58:00Z",logout_at:null,active:true,created_at:"2025-06-25T09:05:00Z"},
  {id:"s3",session_token:"sess-3",user_id:"u5",device_type:"Tablet",device_name:"Samsung Tab S9",device_os:"Android 14",ip_address:"103.23.12.92",login_at:"2025-06-25T07:14:00Z",last_seen:"2025-06-25T07:55:00Z",logout_at:"2025-06-25T08:30:00Z",active:false,created_at:"2025-06-25T07:14:00Z"},
];

const MOCK_COMPANY_SETTINGS = {id:"c1",company_name:"Al Lewa General Trading LLC",company_subtitle:"Merchandising & Delivery Control System",company_logo_url:DEFAULT_LOGO,created_at:"2025-01-01T00:00:00Z"};
const MOCK_PRODUCTS = [
  {id:"p1",product_code:"PRD-001",product_name:"Turmeric Powder",category:"Spice",brand:"Lewa",unit:"kg",barcode:"1234567890123",selling_price:5.50,cost_price:3.20,stock_status:"In Stock",product_image_url:"/product-images/turmeric.png",remarks:"Top seller",created_at:"2025-06-01T09:00:00Z"},
  {id:"p2",product_code:"PRD-002",product_name:"Coriander Seeds",category:"Spice",brand:"Lewa",unit:"kg",barcode:"1234567890124",selling_price:4.20,cost_price:2.50,stock_status:"Low Stock",product_image_url:"/product-images/coriander.png",remarks:"Seasonal batch",created_at:"2025-06-02T10:30:00Z"},
  {id:"p3",product_code:"PRD-003",product_name:"Red Chili Powder",category:"Spice",brand:"Lewa",unit:"kg",barcode:"1234567890125",selling_price:6.00,cost_price:3.90,stock_status:"In Stock",product_image_url:"/product-images/chili.png",remarks:"Premium grade",created_at:"2025-06-03T11:15:00Z"}
];
const MOCK_MEMO_DOCUMENTS = [
  {id:"m1",memo_id:"MEMO-001",title:"New retail commission policy",type:"Policy",related_module:"Sales Orders",related_reference_type:"Shop",related_reference_id:"s1",related_reference_name:"Lulu Barka",uploaded_by:"u1",upload_at:"2025-06-25T09:00:00Z",file_url:"/docs/memo-1.pdf",remarks:"Circulate to sales team",approval_status:"Pending",created_at:"2025-06-25T09:00:00Z"},
  {id:"m2",memo_id:"MEMO-002",title:"Product launch checklist",type:"Operations",related_module:"Product Master",related_reference_type:"Product",related_reference_id:"p2",related_reference_name:"Coriander Seeds",uploaded_by:"u2",upload_at:"2025-06-24T14:30:00Z",file_url:"/docs/memo-2.jpg",remarks:"Use for store rollout",approval_status:"Approved",created_at:"2025-06-24T14:30:00Z"}
];
const MOCK_SCORE_PROOFS = [
  {id:"sp1",daily_score_id:"sc1",uploaded_by:"u4",file_url:"/score-proof-files/shelf-photo-1.jpg",remarks:"In-store shelf display proof",approval_status:"Pending",approved_by:null,approved_at:null,created_at:"2025-06-25T09:15:00Z"}
];

// ── HELPERS ──────────────────────────────────────────────────
function haversineKm(lat1,lng1,lat2,lng2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function initials(n){return(n||"").split(" ").slice(0,2).map(w=>w[0]||"").join("")}
function fmt(dt){if(!dt)return"—";const d=new Date(dt);return d.toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
function fmtDate(d){if(!d)return"—";return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
function scoreColor(s){if(s>=80)return"#0F6E56";if(s>=60)return"#C4A747";return"#C74C51";}
function isImageSource(src){return typeof src==="string"&&/\.(png|jpe?g|gif|webp)$/i.test(src);}
function renderFilePreview(source){if(!source)return <div style={{color:'#999999',fontSize:'13px'}}>No preview available</div>;
  if(isImageSource(source)) return <img src={source} style={{maxWidth:'100%',maxHeight:'420px',borderRadius:10,objectFit:'contain'}} alt="Preview" />;
  return <iframe src={source} style={{width:'100%',height:'420px',borderRadius:10,border:'1px solid #E5E5E5'}} title="Document preview" />;
}
function statusColor(s){const m={"Active":"#0F6E56","Completed":"#0F6E56","Approved":"#0F6E56","Delivered":"#0F6E56","Present":"#0F6E56","Confirmed":"#0F6E56","Warning":"#C4A747","Suspicious":"#C74C51","Inactive":"#C74C51","Absent":"#C74C51","Rejected":"#C74C51","Failed":"#C74C51","Fake":"#C74C51","Late":"#C4A747","Delayed":"#C4A747","Pending":"#888780","In Transit":"#378ADD","Checked In":"#378ADD","Leave":"#1B5E3F","Half Day":"#C4A747"};return m[s]||"#888780";}

// ── DATA LAYER ───────────────────────────────────────────────
async function db(table, method="select", options={}){
  if(DEMO_MODE) return demoDb(table, method, options);
  try{
    let q=supabase.from(table);
    if(method==="select"){q=q.select(options.columns||"*");if(options.eq)Object.entries(options.eq).forEach(([k,v])=>{q=q.eq(k,v)});if(options.order)q=q.order(options.order.col,{ascending:options.order.asc!==false});const{data,error}=await q;if(error)throw error;return data||[];}
    if(method==="insert"){const{data,error}=await q.insert(options.data).select();if(error)throw error;return data;}
    if(method==="update"){let u=q.update(options.data);if(options.eq)Object.entries(options.eq).forEach(([k,v])=>{u=u.eq(k,v)});const{data,error}=await u.select();if(error)throw error;return data;}
    if(method==="delete"){let del=q.delete();if(options.eq)Object.entries(options.eq).forEach(([k,v])=>{del=del.eq(k,v)});const{error}=await del;if(error)throw error;return true;}
  }catch(e){console.error("DB error",table,method,e);return[];}
}

const MOCK_DB = {areas:MOCK_AREAS,shops:MOCK_SHOPS,profiles:MOCK_PROFILES,attendance:MOCK_ATTENDANCE,shop_visits:MOCK_VISITS,deliveries:MOCK_DELIVERIES,lpos:MOCK_LPOS,daily_scores:MOCK_SCORES,notifications:MOCK_NOTIFICATIONS,authorizations:MOCK_AUTHORIZATIONS,backup_logs:MOCK_BACKUP_LOGS,login_sessions:MOCK_LOGIN_SESSIONS,company_settings:MOCK_COMPANY_SETTINGS,products:MOCK_PRODUCTS,memo_documents:MOCK_MEMO_DOCUMENTS,score_proofs:MOCK_SCORE_PROOFS};
let mockState = JSON.parse(JSON.stringify(MOCK_DB));

function demoDb(table, method, options){
  const data = mockState[table]||[];
  if(method==="select"){
    let r=[...data];
    if(options.eq)r=r.filter(row=>Object.entries(options.eq).every(([k,v])=>row[k]===v));
    return Promise.resolve(r);
  }
  if(method==="insert"){
    const newRow={id:"new-"+Date.now(),...options.data};
    mockState[table]=[newRow,...(mockState[table]||[])];
    return Promise.resolve([newRow]);
  }
  if(method==="update"){
    mockState[table]=(mockState[table]||[]).map(row=>{
      if(options.eq&&Object.entries(options.eq).every(([k,v])=>row[k]===v))return{...row,...options.data};
      return row;
    });
    return Promise.resolve(true);
  }
  if(method==="delete"){
    if(options.eq)mockState[table]=(mockState[table]||[]).filter(row=>!Object.entries(options.eq).every(([k,v])=>row[k]===v));
    return Promise.resolve(true);
  }
  return Promise.resolve([]);
}

// ── SHARED UI COMPONENTS ─────────────────────────────────────
const Badge = ({label,color,bg})=>(
  <span style={{display:"inline-block",padding:"4px 12px",borderRadius:6,fontSize:"12px",fontWeight:"500",background:bg||ROLE_BG[label]||"#F5F5F5",color:color||ROLE_COLORS[label]||"#656463"}}>{label}</span>
);
const StatusBadge = ({s})=>{
  const c=statusColor(s);
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:"13px"}}>
    <span style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}/>
    {s||"—"}
  </span>;
};
const Card = ({children,style={}})=>(
  <div className="lewa-card" style={{background:"#FFFFFF",border:"1px solid #E8E8E8",borderRadius:14,padding:"1.35rem",boxShadow:"0 8px 24px rgba(15,110,86,0.06)",...style}}>{children}</div>
);
const StatCard = ({label,value,sub,color})=>(
  <div className="lewa-stat-card" style={{background:"#FFFFFF",borderRadius:14,padding:"18px 20px",borderLeft:`4px solid ${color||"#0F6E56"}`,boxShadow:"0 4px 18px rgba(0,0,0,0.04)"}}>
    <div style={{fontSize:"11px",color:"#888888",marginBottom:8,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.14em"}}>{label}</div>
    <div style={{fontSize:"28px",fontWeight:"700",color:color||"#1F1F1F",marginBottom:4}}>{value}</div>
    {sub&&<div style={{fontSize:"12px",color:"#777777",marginTop:2}}>{sub}</div>}
  </div>
);
const Btn = ({children,onClick,variant="default",size="md",style={}})=>{
  const base={display:"inline-flex",alignItems:"center",gap:7,border:"none",borderRadius:8,fontFamily:"inherit",cursor:"pointer",fontWeight:"500",transition:"all 0.2s ease",fontSize:"14px"};
  const variants={
    default:{background:"#FFFFFF",color:"#1F1F1F",border:"1px solid #D5D5D5","&:hover":{background:"#F9F9F9"}},
    primary:{background:"#0F6E56",color:"#FFFFFF",border:"none","&:hover":{background:"#0A5646"}},
    danger:{background:"#FEF2F2",border:"1px solid #E8B8B8",color:"#C74C51","&:hover":{background:"#FEE8E8"}},
    success:{background:"#E8F5F1",border:"1px solid #B8E8DA",color:"#0F6E56","&:hover":{background:"#D8F0E7"}},
    gold:{background:"#FEF9E7",border:"1px solid #E8D8A8",color:"#A68A2F","&:hover":{background:"#FEF5D8"}},
    ghost:{background:"transparent",border:"none",color:"#888888","&:hover":{background:"#F5F5F5"}}
  };
  const sizes={sm:{padding:"6px 12px",fontSize:"12px"},md:{padding:"9px 16px",fontSize:"13px"},lg:{padding:"12px 20px",fontSize:"14px"}};
  return <button onClick={onClick} style={{...base,...variants[variant],...sizes[size],...style}}>{children}</button>;
};
const Input = ({value,onChange,placeholder,type="text",style={}})=>(
  <input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
    style={{padding:"9px 12px",border:"1px solid #D5D5D5",borderRadius:8,background:"#FFFFFF",color:"#1F1F1F",fontSize:"13px",fontFamily:"inherit",width:"100%",transition:"border 0.2s","&:focus":{outline:"none",borderColor:"#0F6E56"},...style}}/>
);
const Select = ({value,onChange,children,style={}})=>(
  <select value={value||""} onChange={e=>onChange(e.target.value)}
    style={{padding:"8px 12px",border:"1px solid #D5D5D5",borderRadius:8,background:"#FFFFFF",color:"#1F1F1F",fontSize:"13px",fontFamily:"inherit",cursor:"pointer",...style}}>
    {children}
  </select>
);
const Modal = ({title,children,onClose,width=540})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div style={{background:"#FFFFFF",borderRadius:12,border:"1px solid #E5E5E5",width,maxWidth:"95vw",maxHeight:"85vh",overflowY:"auto",padding:28,boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <span style={{fontSize:"17px",fontWeight:"600",color:"#1F1F1F"}}>{title}</span>
        <Btn onClick={onClose} variant="ghost" size="sm">✕</Btn>
      </div>
      {children}
    </div>
  </div>
);
const Table = ({headers,rows})=>(
  <div className="lewa-table-wrap" style={{overflowX:"auto",borderRadius:14,boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}}>
    <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 10px",fontSize:"13px"}}>
      <thead>
        <tr>
          {headers.map((h,i)=><th key={i} style={{position:"sticky",top:0,zIndex:3,padding:"14px 16px",textAlign:"left",fontWeight:"700",fontSize:"12px",color:"#555555",textTransform:"uppercase",letterSpacing:"0.08em",background:"#FAFBFB",borderBottom:"1px solid #E8E8E8",whiteSpace:"nowrap"}}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i)=><tr key={i} style={{background:"#FFFFFF",borderRadius:12,boxShadow:i%2===0?"0 0 0 0 transparent":"none",transition:"background 0.2s"}} onMouseOver={e=>e.currentTarget.style.background="#F5F6F8"} onMouseOut={e=>e.currentTarget.style.background="#FFFFFF"}>
          {r.map((c,j)=><td key={j} data-label={headers[j]} style={{padding:"14px 16px",color:"#1F1F1F",verticalAlign:"middle",whiteSpace:"nowrap"}}>{c}</td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
);
const Avatar = ({name,role,size=36})=>{
  const bg=ROLE_BG[role]||"#F5F5F5",color=ROLE_COLORS[role]||"#656463";
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.4,fontWeight:"600",flexShrink:0,border:`2px solid #FFFFFF`,boxShadow:"0 2px 4px rgba(0,0,0,0.08)"}}>{initials(name)}</div>;
};
const ScoreBar = ({score,max=100})=>{
  const pct=(score/max)*100;
  return <div style={{display:"flex",alignItems:"center",gap:10}}>
    <div style={{flex:1,height:7,background:"#E5E5E5",borderRadius:4,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:scoreColor(score),borderRadius:4,transition:"width 0.3s"}}/>
    </div>
    <span style={{fontSize:"12px",fontWeight:"600",color:scoreColor(score),minWidth:32}}>{score}</span>
  </div>;
};
const PageHeader = ({title,subtitle,action})=>(
  <div className="lewa-page-header" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"2rem",flexWrap:"wrap",gap:16}}>
    <div>
      <h1 style={{fontSize:"26px",fontWeight:"600",color:"#1F1F1F",margin:0}}>{title}</h1>
      {subtitle&&<p style={{fontSize:"13px",color:"#999999",marginTop:6,fontWeight:"400"}}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── SCORE CIRCLE ─────────────────────────────────────────────
const ScoreCircle = ({score,size=72})=>{
  const r=size/2-7,circ=2*Math.PI*r,pct=(score/100)*circ;
  return <svg width={size} height={size} style={{flexShrink:0}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E5E5" strokeWidth={6}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor(score)} strokeWidth={6}
      strokeDasharray={circ} strokeDashoffset={circ-pct} strokeLinecap="round"
      style={{transformOrigin:"center",transform:"rotate(-90deg)"}}/>
    <text x={size/2} y={size/2+2} textAnchor="middle" dominantBaseline="middle" fontSize={size*0.25} fontWeight="600" fill={scoreColor(score)}>{score}</text>
  </svg>;
};

function proximityStatus(distance){
  if(distance==null||Number.isNaN(distance))return"Unknown";
  if(distance<=0.5)return"Confirmed";
  if(distance<=1.5)return"Warning";
  return"Suspicious";
}

const LocationBadge = ({distance})=> <StatusBadge s={proximityStatus(distance)}/>;

// ── SCREENS ──────────────────────────────────────────────────

// DASHBOARD
function Dashboard({user,areas,shops,profiles,attendance,visits,deliveries,lpos,scores,notifications,authorizations,backup_logs,login_sessions,setPage}){
  const today=new Date().toISOString().split("T")[0];
  const todayAtt=attendance.filter(a=>a.date===today);
  const todayVisits=visits.filter(v=>v.visit_date===today);
  const todayDel=deliveries.filter(d=>d.assigned_date===today);
  const unread=notifications.filter(n=>!n.is_read);
  const topScores=[...scores].sort((a,b)=>b.total_score-a.total_score).slice(0,3);
  const pendingAuth=authorizations.filter(a=>a.status==="Pending");
  const activeSessions=login_sessions.filter(s=>s.active).length;
  const backupSuccess=backup_logs.filter(b=>b.backup_status==="Success").length;
  const confirmedVisits=todayVisits.filter(v=>!v.is_fake_visit&&proximityStatus(v.distance_from_shop)==="Confirmed").length;
  const suspiciousVisits=todayVisits.filter(v=>proximityStatus(v.distance_from_shop)==="Suspicious").length;

  const isAdmin=["Admin","MD","Chief Manager"].includes(user.role);
  const isMerch=user.role==="Merchandiser";
  const isDriver=user.role==="Driver";
  const isSales=user.role==="Salesman";

  return <div>
    <PageHeader title={`Good morning, ${user.full_name.split(" ")[0]} 👋`} subtitle={`${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} • ${user.role}`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
      {[
        {label:"Users & Authorization",icon:"👥",page:"Users & Authorization"},
        {label:"Shops & Locations",icon:"📍",page:"Shops & Locations"},
        {label:"Product Master",icon:"📦",page:"Product Master"},
        {label:"Attendance",icon:"📋",page:"Attendance"},
        {label:"Merchandiser Visits",icon:"🚶",page:"Merchandiser Visits"},
        {label:"Delivery Tracking",icon:"🚛",page:"Delivery Tracking"},
        {label:"LPO Management",icon:"🧾",page:"LPO Management"},
        {label:"Memo/Documents",icon:"📝",page:"Memo/Documents"}
      ].map(item=><button key={item.page} onClick={()=>setPage(item.page)} style={{border:"1px solid #E5E5E5",background:"#FFFFFF",padding:"16px",borderRadius:14,display:"flex",alignItems:"center",gap:12,justifyContent:"space-between",cursor:"pointer",fontWeight:600,color:"#1F1F1F",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <span style={{fontSize:20}}>{item.icon}</span>
        <span style={{flex:1,textAlign:"left",fontSize:13}}>{item.label}</span>
        <span style={{fontSize:14,color:"#0F6E56"}}>→</span>
      </button>)}
    </div>
    {isAdmin&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:28}}>
        <StatCard label="Total staff" value={profiles.length} sub="All roles"/>
        <StatCard label="Present today" value={todayAtt.filter(a=>a.status!=="Absent").length} sub="Checked in" color="#0F6E56"/>
        <StatCard label="Absent" value={todayAtt.filter(a=>a.status==="Absent").length} color="#C74C51"/>
        <StatCard label="Confirmed visits" value={confirmedVisits} color="#0F6E56" sub="GPS verified"/>
        <StatCard label="Suspicious visits" value={suspiciousVisits} color="#C74C51" sub="Distance flagged"/>
        <StatCard label="Deliveries" value={todayDel.length} sub={`${todayDel.filter(d=>d.status==="Delivered").length} done`}/>
        <StatCard label="Active sessions" value={activeSessions} color="#0F6E56" sub="Live logins"/>
        <StatCard label="Pending auth" value={pendingAuth.length} color="#C4A747" sub="Approval queue"/>
        <StatCard label="Backup logs" value={backup_logs.length} sub={`${backupSuccess} success`} color="#0F6E56"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:28}}>
        <Card>
          <div style={{fontWeight:"600",marginBottom:16,fontSize:"14px",color:"#1F1F1F"}}>🏆 Today's performance ranking</div>
          {topScores.map((sc,i)=>{
            const u=profiles.find(p=>p.id===sc.user_id);
            return <div key={sc.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<topScores.length-1?"1px solid #E5E5E5":""}}>
              <span style={{fontSize:"20px",minWidth:28}}>{"🥇🥈🥉"[i]}</span>
              <Avatar name={u?.full_name} role={u?.role} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{u?.full_name}</div>
                <div style={{fontSize:"12px",color:"#999999"}}>{u?.role}</div>
              </div>
              <ScoreCircle score={sc.total_score} size={48}/>
            </div>;
          })}
        </Card>
        <Card>
          <div style={{fontWeight:"600",marginBottom:16,fontSize:"14px",color:"#C74C51"}}>⚠️ Alerts requiring action</div>
          {unread.slice(0,5).map(n=>{
            const icons={absent:"🔴",visit_incomplete:"🟡",delivery_delayed:"🟠",lpo_uploaded:"🟢",approval_pending:"🔵",md_summary:"📊"};
            return <div key={n.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #E5E5E5"}}>
              <span style={{fontSize:"18px",flexShrink:0}}>{icons[n.type]||"⚪"}</span>
              <div>
                <div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{n.title}</div>
                <div style={{fontSize:"12px",color:"#999999",marginTop:2}}>{n.body}</div>
              </div>
            </div>;
          })}
        </Card>
      </div>

      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"14px",color:"#1F1F1F"}}>📊 Area performance overview</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          {areas.map(a=>{
            const aShops=shops.filter(s=>s.area_id===a.id);
            const aStaff=profiles.filter(p=>p.area_id===a.id);
            const aVisits=todayVisits.filter(v=>aShops.some(s=>s.id===v.shop_id));
            const score=Math.round(60+Math.random()*35);
            return <div key={a.id} style={{background:"#F9F9F9",borderRadius:10,padding:"16px",border:"1px solid #E5E5E5"}}>
              <div style={{fontWeight:"600",fontSize:"13px",color:"#1F1F1F"}}>{a.name}</div>
              <div style={{fontSize:"12px",color:"#999999",marginBottom:10}}>{a.region}</div>
              <div style={{fontSize:"12px",color:"#666666",marginBottom:10}}>{aShops.length} shops · {aStaff.length} staff</div>
              <ScoreBar score={score}/>
            </div>;
          })}
        </div>
      </Card>
    </>}

    {(isMerch||isSales||isDriver)&&<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:16,marginBottom:28}}>
        {isMerch&&<>
          <StatCard label="My visits today" value={todayVisits.filter(v=>v.user_id===user.id).length}/>
          <StatCard label="Completed" value={todayVisits.filter(v=>v.user_id===user.id&&v.status==="Completed").length} color="#0F6E56"/>
          <StatCard label="LPOs collected" value={lpos.filter(l=>l.salesman_id===user.id).length}/>
        </>}
        {isSales&&<>
          <StatCard label="My orders" value={lpos.filter(l=>l.salesman_id===user.id).length}/>
          <StatCard label="Pending LPOs" value={lpos.filter(l=>l.salesman_id===user.id&&l.status==="Pending").length} color="#C4A747"/>
        </>}
        {isDriver&&<>
          <StatCard label="Assigned" value={todayDel.filter(d=>d.driver_id===user.id).length}/>
          <StatCard label="Delivered" value={todayDel.filter(d=>d.driver_id===user.id&&d.status==="Delivered").length} color="#0F6E56"/>
          <StatCard label="Delayed" value={todayDel.filter(d=>d.driver_id===user.id&&d.status==="Delayed").length} color="#C74C51"/>
        </>}
      </div>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"14px",color:"#1F1F1F"}}>📈 My score today</div>
        {(()=>{const sc=scores.find(s=>s.user_id===user.id&&s.score_date===today);
          if(!sc)return <p style={{color:"#999999",fontSize:"13px"}}>Score not computed yet.</p>;
          return <div style={{display:"flex",alignItems:"center",gap:24}}>
            <ScoreCircle score={sc.total_score} size={88}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:"600",marginBottom:12,fontSize:"13px",color:"#1F1F1F"}}>Breakdown by criteria</div>
              {Object.entries(SCORE_WEIGHTS[user.role]||{}).map(([k,max])=>{
                const keyMap={attendance:"attendance_score",visits:"visits_score",shelf_visibility:"shelf_visibility_score",lpo:"lpo_score",display_photo:"display_photo_score",oos_reporting:"oos_reporting_score",timely_update:"timely_update_score",on_time_delivery:"on_time_delivery_score",delivery_proof:"delivery_proof_score",grv:"grv_score",delay_reason:"delay_reason_score",vehicle_discipline:"vehicle_discipline_score",customer_remarks:"customer_remarks_score",orders:"orders_score",lpo_followup:"lpo_followup_score",collection:"collection_score",customer_visit:"customer_visit_score",timely_reporting:"timely_reporting_score"};
                const got=sc[keyMap[k]]||0;
                return <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:"12px",color:"#666666",width:170,textTransform:"capitalize"}}>{k.replace(/_/g," ")} <span style={{color:"#999999"}}>/{max}</span></span>
                  <ScoreBar score={Math.round((got/max)*100)}/>
                </div>;
              })}
            </div>
          </div>;
        })()}
      </Card>
    </>}
  </div>;
}

// SHOPS
function ShopsPage({areas,shops,setShops,profiles,canEdit}){
  const [filterArea,setFilterArea]=useState("");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});

  const filtered=shops.filter(s=>{
    const matchA=!filterArea||s.area_id===filterArea;
    const matchS=!search||(s.name+" "+s.branch).toLowerCase().includes(search.toLowerCase());
    return matchA&&matchS;
  });

  const openCreate=()=>{setForm({status:"Active"});setModal("create")};
  const openEdit=s=>{setForm({...s});setModal("edit")};
  const save=async()=>{
    if(modal==="create"){
      const rows=await db("shops","insert",{data:{...form,id:undefined}});
      if(rows.length)setShops(prev=>[rows[0],...prev]);
    } else {
      await db("shops","update",{data:form,eq:{id:form.id}});
      setShops(prev=>prev.map(s=>s.id===form.id?form:s));
    }
    setModal(null);
  };
  const deleteShop=async id=>{
    if(!confirm("Delete this shop?"))return;
    await db("shops","delete",{eq:{id}});
    setShops(prev=>prev.filter(s=>s.id!==id));
  };

  const formField=(label,key,type="text",opts=null)=>(
    <div style={{marginBottom:12}}>
      <label style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",display:"block",marginBottom:4}}>{label}</label>
      {opts?<Select value={form[key]} onChange={v=>setForm(f=>({...f,[key]:v}))} style={{width:"100%"}}>
        {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>:<Input value={form[key]} onChange={v=>setForm(f=>({...f,[key]:v}))} type={type}/>}
    </div>
  );

  return <div>
    <PageHeader title="Shop Master" subtitle={`${shops.length} shops across ${areas.length} areas`}
      action={canEdit&&<Btn variant="primary" onClick={openCreate}>+ Add Shop</Btn>}/>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <div style={{position:"relative",flex:1,minWidth:220}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search shops by name or branch..."
          style={{padding:"9px 14px 9px 36px",border:"1px solid #D5D5D5",borderRadius:8,background:"#FFFFFF",color:"#1F1F1F",fontSize:"13px",width:"100%"}}/>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#999999",fontSize:"16px"}}>🔍</span>
      </div>
      <Select value={filterArea} onChange={setFilterArea} style={{minWidth:160,background:"#FFFFFF"}}>
        <option value="">All areas</option>
        {areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
      </Select>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Shop","Area","Contact","Phone","Status","Location","Actions"]}
        rows={filtered.map(s=>{
          const area=areas.find(a=>a.id===s.area_id);
          return [
            <div>
              <div style={{fontWeight:"600",fontSize:"13px",color:"#1F1F1F"}}>{s.name}</div>
              <div style={{fontSize:"12px",color:"#999999",marginTop:2}}>{s.branch}</div>
            </div>,
            <span style={{fontSize:"13px"}}>{area?.name||"—"}</span>,
            <span style={{fontSize:"13px"}}>{s.contact_person||"—"}</span>,
            <span style={{fontSize:"13px"}}>{s.phone||"—"}</span>,
            <StatusBadge s={s.status}/>,
            s.latitude?<a href={`https://maps.google.com/?q=${s.latitude},${s.longitude}`} target="_blank" rel="noreferrer" style={{color:"#0F6E56",fontSize:"13px",textDecoration:"none",fontWeight:"500"}}>📍 Map</a>:<span style={{color:"#999999",fontSize:"13px"}}>—</span>,
            canEdit&&<div style={{display:"flex",gap:6}}>
              <Btn size="sm" onClick={()=>openEdit(s)}>Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>deleteShop(s.id)}>Delete</Btn>
            </div>
          ];
        })}/>
    </Card>
    {modal&&<Modal title={modal==="create"?"Add Shop":"Edit Shop"} onClose={()=>setModal(null)}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px",marginBottom:16}}>
        <div>{formField("Shop Name","name")}{formField("Branch","branch")}</div>
        <div>{formField("Area","area_id","text",[{value:"",label:"Select area"},...areas.map(a=>({value:a.id,label:a.name}))])}
        {formField("Status","status","text",[{value:"Active",label:"Active"},{value:"Inactive",label:"Inactive"}])}</div>
      </div>
      {formField("Contact Person","contact_person")}
      {formField("Phone","phone")}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px",marginBottom:16}}>
        <div>{formField("Latitude","latitude","number")}</div>
        <div>{formField("Longitude","longitude","number")}</div>
      </div>
      {formField("Address","address")}
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid #E5E5E5"}}>
        <Btn onClick={()=>setModal(null)}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>{modal==="create"?"Create Shop":"Save Changes"}</Btn>
      </div>
    </Modal>}
  </div>;
}

// ATTENDANCE
function AttendancePage({user,profiles,attendance,setAttendance,canApprove}){
  const [dateFilter,setDateFilter]=useState(new Date().toISOString().split("T")[0]);
  const [modal,setModal]=useState(null);
  const [currentRecord,setCurrentRecord]=useState(null);

  const todayRecs=attendance.filter(a=>a.date===dateFilter);

  const checkIn=async()=>{
    navigator.geolocation.getCurrentPosition(async pos=>{
      const data={user_id:user.id,date:new Date().toISOString().split("T")[0],check_in_time:new Date().toISOString(),check_in_lat:pos.coords.latitude,check_in_lng:pos.coords.longitude,status:"Present",approval_status:"Pending"};
      const rows=await db("attendance","insert",{data});
      if(rows.length)setAttendance(prev=>[rows[0],...prev]);
      alert("Check-in recorded!");
    },()=>{alert("GPS required for attendance.");});
  };
  const approve=async(id,status)=>{
    await db("attendance","update",{data:{approval_status:status,approved_by:user.id},eq:{id}});
    setAttendance(prev=>prev.map(a=>a.id===id?{...a,approval_status:status}:a));
  };

  const myToday=attendance.find(a=>a.user_id===user.id&&a.date===new Date().toISOString().split("T")[0]);

  return <div>
    <PageHeader title="Attendance" subtitle="Daily check-in, approval and tracking"/>
    {["Merchandiser","Salesman","Driver","Monitoring Manager"].includes(user.role)&&(
      <Card style={{marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div>
          <div style={{fontWeight:"600",fontSize:"14px",color:"#1F1F1F"}}>📍 Today's Attendance</div>
          {myToday?<div style={{fontSize:"13px",color:"#666666",marginTop:6}}>
            Checked in: {fmt(myToday.check_in_time)} · Status: <StatusBadge s={myToday.status}/>
          </div>:<div style={{fontSize:"13px",color:"#666666",marginTop:6}}>Not checked in yet</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          {!myToday&&<Btn variant="primary" onClick={checkIn}>📍 Check In</Btn>}
          {myToday&&!myToday.check_out_time&&<Btn variant="success" onClick={()=>alert("Check-out recorded!")}>Check Out</Btn>}
        </div>
      </Card>
    )}
    <div style={{display:"flex",gap:12,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
      <Input type="date" value={dateFilter} onChange={setDateFilter} style={{width:180}}/>
      <div style={{display:"flex",gap:12}}>
        <StatCard label="Present" value={todayRecs.filter(a=>a.status==="Present"||a.status==="Late").length} color="#0F6E56"/>
        <StatCard label="Absent" value={todayRecs.filter(a=>a.status==="Absent").length} color="#C74C51"/>
        <StatCard label="Late" value={todayRecs.filter(a=>a.status==="Late").length} color="#C4A747"/>
        <StatCard label="Pending" value={todayRecs.filter(a=>a.approval_status==="Pending").length} color="#888780"/>
      </div>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Staff","Role","Check-in","Check-out","Status","GPS","Late (mins)","Approval"]}
        rows={todayRecs.map(a=>{
          const p=profiles.find(x=>x.id===a.user_id);
          return [
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={p?.full_name} role={p?.role} size={32}/>
              <div><div style={{fontWeight:"600",fontSize:"13px",color:"#1F1F1F"}}>{p?.full_name}</div><div style={{fontSize:"11px",color:"#999999"}}>{p?.employee_id}</div></div>
            </div>,
            p?<Badge label={p.role}/>:null,
            <span style={{fontSize:"13px"}}>{fmt(a.check_in_time)}</span>,
            <span style={{fontSize:"13px"}}>{fmt(a.check_out_time)||"—"}</span>,
            <StatusBadge s={a.status}/>,
            a.check_in_lat?<a href={`https://maps.google.com/?q=${a.check_in_lat},${a.check_in_lng}`} target="_blank" rel="noreferrer" style={{color:"#0F6E56",fontSize:"13px",fontWeight:"500"}}>📍</a>:<span style={{color:"#999999",fontSize:"13px"}}>—</span>,
            <span style={{fontSize:"13px",color:a.late_minutes>0?"#C4A747":"#666666",fontWeight:a.late_minutes>0?"600":"400"}}>{a.late_minutes||0}</span>,
            canApprove&&a.approval_status==="Pending"?<div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="success" onClick={()=>approve(a.id,"Approved")}>✓</Btn>
              <Btn size="sm" variant="danger" onClick={()=>approve(a.id,"Rejected")}>✕</Btn>
            </div>:<StatusBadge s={a.approval_status}/>
          ];
        })}/>
    </Card>
  </div>;
}

// VISITS
function VisitsPage({user,shops,profiles,visits,setVisits,areas,canApprove}){
  const today=new Date().toISOString().split("T")[0];
  const managerRoles=["Admin","MD","Chief Manager","Monitoring Manager"];
  const isManager=managerRoles.includes(user.role);

  const [dateF,setDateF]=useState(today);
  const [activeVisit,setActiveVisit]=useState(null);
  const [currentGps,setCurrentGps]=useState(null);
  const [previewImage,setPreviewImage]=useState(null);
  const [commentDraft,setCommentDraft]=useState("");
  const [filters,setFilters]=useState({merchandiser:"",shop:"",area:"",status:""});
  const [form,setForm]=useState({
    shop_id:"",
    display_notes:"",
    stock_issue:"",
    competitor_activity:"",
    order_request:"",
    before_image_url:"",
    after_image_url:""
  });

  const assignedShops=isManager
    ? shops
    : shops.filter(s=>
        s.assigned_merchandiser_id===user.id ||
        s.merchandiser_id===user.id ||
        (user.area_id && s.area_id===user.area_id)
      );

  const merchandisers=profiles.filter(p=>p.role==="Merchandiser");
  const selectedShop=shops.find(s=>s.id===form.shop_id);

  const getGps=()=>new Promise((resolve,reject)=>{
    if(!navigator.geolocation){
      reject(new Error("GPS not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos=>resolve({lat:pos.coords.latitude,lng:pos.coords.longitude}),
      err=>reject(err),
      {enableHighAccuracy:true,timeout:15000,maximumAge:0}
    );
  });

  const imageToDataUrl=file=>new Promise(resolve=>{
    if(!file){resolve("");return;}
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const distanceFor=(gps,shop)=>{
    if(!gps||!shop?.latitude||!shop?.longitude)return null;
    return Math.round(haversineKm(Number(gps.lat),Number(gps.lng),Number(shop.latitude),Number(shop.longitude))*100)/100;
  };

  const gpsStatusFor=distance=>{
    if(distance==null)return"Unknown";
    return distance<=0.5?"Confirmed":"Suspicious";
  };

  const mapLink=(lat,lng)=>{
    if(lat==null||lng==null)return"";
    return `https://maps.google.com/?q=${lat},${lng}`;
  };

  const visitOwnerId=v=>v.user_id||v.merchandiser_id;
  const visitDate=v=>v.visit_date || (v.check_in_time?String(v.check_in_time).split("T")[0]:today);
  const visitComment=v=>v.management_comment||v.manager_comment||v.review_comment||v.comment||"";
  const visitShop=v=>shops.find(s=>s.id===v.shop_id);
  const visitStaff=v=>profiles.find(p=>p.id===visitOwnerId(v));
  const visitArea=v=>{
    const shop=visitShop(v);
    return areas?.find(a=>a.id===shop?.area_id);
  };
  const visitGpsStatus=v=>v.gps_status||v.distance_status||gpsStatusFor(v.distance_from_shop);

  const visibleVisits=visits.filter(v=>{
    const owner=visitOwnerId(v);
    const shop=visitShop(v);
    const dateOk=visitDate(v)===dateF;
    const ownerOk=isManager || owner===user.id;
    const merchOk=!filters.merchandiser || owner===filters.merchandiser;
    const shopOk=!filters.shop || v.shop_id===filters.shop;
    const areaOk=!filters.area || shop?.area_id===filters.area;
    const statusOk=!filters.status ||
      (filters.status==="Suspicious"
        ? (v.is_fake_visit||visitGpsStatus(v)==="Suspicious")
        : String(v.status||"").toLowerCase()===filters.status.toLowerCase() || String(v.approval_status||"").toLowerCase()===filters.status.toLowerCase());
    return dateOk&&ownerOk&&merchOk&&shopOk&&areaOk&&statusOk;
  });

  const startVisit=async()=>{
    if(activeVisit){
      alert("Finish the current visit first.");
      return;
    }
    if(!form.shop_id){
      alert("Select shop first.");
      return;
    }
    try{
      const gps=await getGps();
      setCurrentGps(gps);
      const shop=shops.find(s=>s.id===form.shop_id);
      const distance=distanceFor(gps,shop);
      const gpsStatus=gpsStatusFor(distance);
      const isFake=gpsStatus==="Suspicious";
      const now=new Date().toISOString();
      const data={
        id:`mv-${Date.now()}`,
        user_id:user.id,
        merchandiser_id:user.id,
        shop_id:form.shop_id,
        shop_name:shop?.name||"Shop",
        visit_number:1,
        visit_date:today,
        check_in_time:now,
        latitude:gps.lat,
        longitude:gps.lng,
        check_in_lat:gps.lat,
        check_in_lng:gps.lng,
        distance_from_shop:distance,
        distance_status:gpsStatus,
        gps_status:gpsStatus,
        is_fake_visit:isFake,
        status:"in_progress",
        approval_status:"Pending",
        before_image_url:form.before_image_url,
        display_notes:form.display_notes,
        stock_issue:form.stock_issue,
        competitor_activity:form.competitor_activity,
        order_request:form.order_request,
        notes:form.display_notes,
        created_at:now
      };
      const rows=await db("merchandiser_visits","insert",{data});
      const saved=Array.isArray(rows)&&rows.length?rows[0]:data;
      setActiveVisit(saved);
      setVisits(prev=>[saved,...prev]);
      if(isFake){
        alert(`Visit started, but GPS is Suspicious. You are ${distance} km from ${shop?.name||"the shop"}.`);
      }else{
        alert("Visit started. GPS and check-in time saved.");
      }
    }catch(e){
      alert("GPS permission is required to start visit.");
    }
  };

  const endVisit=async()=>{
    if(!activeVisit){
      alert("No active visit found.");
      return;
    }
    try{
      const gps=await getGps();
      setCurrentGps(gps);
      const shop=shops.find(s=>s.id===activeVisit.shop_id);
      const distance=distanceFor(gps,shop);
      const gpsStatus=gpsStatusFor(distance);
      const checkOut=new Date();
      const checkIn=new Date(activeVisit.check_in_time);
      const duration=Math.max(1,Math.round((checkOut-checkIn)/60000));
      const data={
        check_out_time:checkOut.toISOString(),
        check_out_latitude:gps.lat,
        check_out_longitude:gps.lng,
        check_out_lat:gps.lat,
        check_out_lng:gps.lng,
        distance_from_shop:distance ?? activeVisit.distance_from_shop,
        distance_status:gpsStatus,
        gps_status:gpsStatus,
        is_fake_visit:gpsStatus==="Suspicious",
        status:"completed",
        visit_duration_minutes:duration,
        after_image_url:form.after_image_url,
        display_notes:form.display_notes,
        stock_issue:form.stock_issue,
        competitor_activity:form.competitor_activity,
        order_request:form.order_request,
        notes:form.display_notes
      };
      await db("merchandiser_visits","update",{data,eq:{id:activeVisit.id}});
      setVisits(prev=>prev.map(v=>v.id===activeVisit.id?{...v,...data}:v));
      setActiveVisit(null);
      setForm({shop_id:"",display_notes:"",stock_issue:"",competitor_activity:"",order_request:"",before_image_url:"",after_image_url:""});
      alert("Visit completed. Check-out GPS and duration saved.");
    }catch(e){
      alert("GPS permission is required to end visit.");
    }
  };

  const approve=async(id,status)=>{
    const data={approval_status:status,approved_by:user.id};
    await db("merchandiser_visits","update",{data,eq:{id}});
    setVisits(prev=>prev.map(v=>v.id===id?{...v,...data}:v));
  };

  const saveComment=async()=>{
    if(!previewImage?.visit?.id)return;
    const id=previewImage.visit.id;
    const data={management_comment:commentDraft,manager_comment:commentDraft,review_comment:commentDraft};
    await db("merchandiser_visits","update",{data,eq:{id}});
    setVisits(prev=>prev.map(v=>v.id===id?{...v,...data}:v));
    setPreviewImage(prev=>prev?{...prev,visit:{...prev.visit,...data}}:prev);
    alert("Management comment saved.");
  };

  const markSuspicious=async(id)=>{
    const data={is_fake_visit:true,gps_status:"Suspicious",distance_status:"Suspicious",approval_status:"Pending"};
    await db("merchandiser_visits","update",{data,eq:{id}});
    setVisits(prev=>prev.map(v=>v.id===id?{...v,...data}:v));
  };

  const openPreview=(visit,type)=>{
    setPreviewImage({visit,type});
    setCommentDraft(visitComment(visit));
  };

  const selectedDistance=currentGps&&selectedShop?distanceFor(currentGps,selectedShop):null;
  const selectedStatus=gpsStatusFor(selectedDistance);

  const compactCardStyle={
    padding:"12px 14px",
    borderRadius:12,
    minHeight:84
  };

  return <div>
    <PageHeader title="Merchandiser Visits" subtitle="Shop visits, GPS proof, display photos and management review"/>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",gap:10,marginBottom:14}}>
      <StatCard label="Visits" value={visibleVisits.length} style={compactCardStyle}/>
      <StatCard label="In Progress" value={visibleVisits.filter(v=>v.status==="in_progress"||v.status==="Checked In").length} color="#C4A747" style={compactCardStyle}/>
      <StatCard label="Completed" value={visibleVisits.filter(v=>v.status==="completed"||v.status==="Completed").length} color="#0F6E56" style={compactCardStyle}/>
      <StatCard label="Suspicious" value={visibleVisits.filter(v=>v.is_fake_visit||visitGpsStatus(v)==="Suspicious").length} color="#C74C51" style={compactCardStyle}/>
      <StatCard label="Pending" value={visibleVisits.filter(v=>v.approval_status==="Pending").length} color="#C4A747" style={compactCardStyle}/>
    </div>

    {isManager&&<Card style={{marginBottom:14,padding:"14px 16px"}}>
      <div style={{fontSize:14,fontWeight:700,color:"#1F1F1F",marginBottom:12}}>Management Filters</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
        <Select value={filters.merchandiser} onChange={v=>setFilters(f=>({...f,merchandiser:v}))} style={{width:"100%"}}>
          <option value="">All merchandisers</option>
          {merchandisers.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}
        </Select>
        <Select value={filters.shop} onChange={v=>setFilters(f=>({...f,shop:v}))} style={{width:"100%"}}>
          <option value="">All shops</option>
          {shops.map(s=><option key={s.id} value={s.id}>{s.name} {s.branch?`- ${s.branch}`:""}</option>)}
        </Select>
        <Select value={filters.area} onChange={v=>setFilters(f=>({...f,area:v}))} style={{width:"100%"}}>
          <option value="">All areas</option>
          {(areas||[]).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
        <Select value={filters.status} onChange={v=>setFilters(f=>({...f,status:v}))} style={{width:"100%"}}>
          <option value="">All status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="Pending">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Suspicious">Suspicious GPS</option>
        </Select>
        <Input type="date" value={dateF} onChange={setDateF}/>
        <Btn onClick={()=>setFilters({merchandiser:"",shop:"",area:"",status:""})}>Reset</Btn>
      </div>
    </Card>}

    <Card style={{marginBottom:14,padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:15,fontWeight:700,color:"#1F1F1F"}}>Start Shop Visit</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {!isManager&&<Badge label={`Assigned shops: ${assignedShops.length}`} color="#0F6E56" bg="#E8F5F1"/>}
          {activeVisit&&<Badge label="Visit in progress" color="#A68A2F" bg="#FEF9E7"/>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:"#666666",display:"block",marginBottom:5}}>Shop / Customer</label>
          <Select value={form.shop_id} onChange={v=>setForm(f=>({...f,shop_id:v}))} style={{width:"100%"}}>
            <option value="">Select shop</option>
            {assignedShops.map(s=><option key={s.id} value={s.id}>{s.name} {s.branch?`- ${s.branch}`:""}</option>)}
          </Select>
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:"#666666",display:"block",marginBottom:5}}>Before display image</label>
          <input type="file" accept="image/*" style={{fontSize:13}} onChange={async e=>{ const image = await imageToDataUrl(e.target.files?.[0]); setForm(f=>({...f,before_image_url:image})); }}/>
          {form.before_image_url&&<button onClick={()=>setPreviewImage({type:"Selected Before",visit:{...form,shop_id:form.shop_id,user_id:user.id,check_in_time:new Date().toISOString()}})} style={{marginTop:6,border:"none",background:"transparent",color:"#0F6E56",fontWeight:700,cursor:"pointer"}}>📷 View selected</button>}
        </div>
        <div>
          <label style={{fontSize:12,fontWeight:700,color:"#666666",display:"block",marginBottom:5}}>After display image</label>
          <input type="file" accept="image/*" style={{fontSize:13}} onChange={async e=>{ const image = await imageToDataUrl(e.target.files?.[0]); setForm(f=>({...f,after_image_url:image})); }}/>
          {form.after_image_url&&<button onClick={()=>setPreviewImage({type:"Selected After",visit:{...form,shop_id:form.shop_id,user_id:user.id,check_in_time:new Date().toISOString()}})} style={{marginTop:6,border:"none",background:"transparent",color:"#0F6E56",fontWeight:700,cursor:"pointer"}}>📷 View selected</button>}
        </div>
      </div>

      {selectedShop&&<div style={{marginTop:10,background:"#F9F9F9",border:"1px solid #E8E8E8",borderRadius:10,padding:10,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
        <div style={{fontSize:12,color:"#666666"}}><b>Shop GPS</b><br/>{selectedShop.latitude||"—"}, {selectedShop.longitude||"—"}</div>
        <div style={{fontSize:12,color:"#666666"}}><b>Your GPS</b><br/>{currentGps?`${currentGps.lat.toFixed(6)}, ${currentGps.lng.toFixed(6)}`:"Start visit to capture"}</div>
        <div style={{fontSize:12,color:"#666666"}}><b>Distance</b><br/>{selectedDistance!=null?`${selectedDistance} km`:"—"}</div>
        <div style={{fontSize:12,color:"#666666"}}><b>Status</b><br/><StatusBadge s={selectedStatus}/></div>
        {selectedShop.latitude&&selectedShop.longitude&&<a href={mapLink(selectedShop.latitude,selectedShop.longitude)} target="_blank" rel="noreferrer" style={{fontSize:12,color:"#0F6E56",fontWeight:700,textDecoration:"none"}}>📍 Shop map</a>}
      </div>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginTop:10}}>
        <Input placeholder="Display notes" value={form.display_notes} onChange={v=>setForm(f=>({...f,display_notes:v}))}/>
        <Input placeholder="Stock issue / OOS" value={form.stock_issue} onChange={v=>setForm(f=>({...f,stock_issue:v}))}/>
        <Input placeholder="Competitor activity" value={form.competitor_activity} onChange={v=>setForm(f=>({...f,competitor_activity:v}))}/>
        <Input placeholder="Order request" value={form.order_request} onChange={v=>setForm(f=>({...f,order_request:v}))}/>
      </div>

      <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
        <Btn variant="primary" onClick={startVisit}>📍 Start Visit</Btn>
        <Btn variant="success" onClick={endVisit}>✅ End Visit</Btn>
        {!isManager&&<Input type="date" value={dateF} onChange={setDateF} style={{width:170}}/>}
      </div>
    </Card>

    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Staff","Shop","Area","Check-in","Check-out","Duration","GPS","Map","Before","After","Comment","Approval"]}
        rows={visibleVisits.map(v=>{
          const p=visitStaff(v);
          const s=visitShop(v);
          const area=visitArea(v);
          const distance=v.distance_from_shop;
          const gpsStatus=visitGpsStatus(v);
          const lat=v.latitude||v.check_in_lat;
          const lng=v.longitude||v.check_in_lng;
          const comment=visitComment(v);
          return [
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={p?.full_name} role={p?.role} size={32}/>
              <div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{p?.full_name||"—"}</div><div style={{fontSize:"11px",color:"#999999"}}>{p?.employee_id||""}</div></div>
            </div>,
            <div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{s?.name||v.shop_name||"—"}</div><div style={{fontSize:"11px",color:"#999999"}}>{s?.branch||""}</div></div>,
            <span style={{fontSize:"13px"}}>{area?.name||"—"}</span>,
            <span style={{fontSize:"13px"}}>{fmt(v.check_in_time)}</span>,
            <span style={{fontSize:"13px"}}>{fmt(v.check_out_time)||"—"}</span>,
            <span style={{fontSize:"13px"}}>{v.visit_duration_minutes?`${v.visit_duration_minutes} min`:"—"}</span>,
            <div><StatusBadge s={gpsStatus}/><div style={{fontSize:11,color:distance>0.5?"#C74C51":"#999999",marginTop:3}}>{distance!=null?`${distance} km`:"—"}</div></div>,
            lat&&lng?<a href={mapLink(lat,lng)} target="_blank" rel="noreferrer" style={{fontSize:18,textDecoration:"none"}}>📍</a>:<span style={{fontSize:"13px",color:"#999999"}}>—</span>,
            v.before_image_url?<button onClick={()=>openPreview(v,"Before")} style={{border:"none",background:"transparent",color:"#0F6E56",fontWeight:700,cursor:"pointer"}}>📷 View</button>:<span style={{fontSize:"13px",color:"#999999"}}>—</span>,
            v.after_image_url?<button onClick={()=>openPreview(v,"After")} style={{border:"none",background:"transparent",color:"#0F6E56",fontWeight:700,cursor:"pointer"}}>📷 View</button>:<span style={{fontSize:"13px",color:"#999999"}}>—</span>,
            comment?<button onClick={()=>openPreview(v,"Comment")} style={{border:"none",background:"transparent",color:"#0F6E56",fontWeight:700,cursor:"pointer"}}>💬 View</button>:(isManager?<button onClick={()=>openPreview(v,"Comment")} style={{border:"none",background:"transparent",color:"#C4A747",fontWeight:700,cursor:"pointer"}}>💬 Add</button>:<span style={{fontSize:"13px",color:"#999999"}}>—</span>),
            canApprove&&v.approval_status==="Pending"?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Btn size="sm" variant="success" onClick={()=>approve(v.id,"Approved")}>✓</Btn>
              <Btn size="sm" variant="danger" onClick={()=>approve(v.id,"Rejected")}>✕</Btn>
              <Btn size="sm" variant="gold" onClick={()=>markSuspicious(v.id)}>⚠</Btn>
            </div>:<StatusBadge s={v.approval_status||"Pending"}/>
          ];
        })}/>
    </Card>

    {previewImage&&(()=>{
      const v=previewImage.visit;
      const p=visitStaff(v);
      const s=visitShop(v);
      const area=visitArea(v);
      const imageSrc=previewImage.type.includes("After")?v.after_image_url:v.before_image_url;
      const lat=v.latitude||v.check_in_lat;
      const lng=v.longitude||v.check_in_lng;
      const distance=v.distance_from_shop;
      const gpsStatus=visitGpsStatus(v);
      const comment=visitComment(v);

      return <Modal title={`${previewImage.type} Visit Details`} onClose={()=>setPreviewImage(null)} width={860}>
        <div style={{display:"grid",gridTemplateColumns:"minmax(260px,1.2fr) minmax(240px,0.8fr)",gap:18}}>
          <div style={{background:"#F9F9F9",border:"1px solid #E8E8E8",borderRadius:12,padding:10,display:"flex",alignItems:"center",justifyContent:"center",minHeight:320}}>
            {imageSrc?<img src={imageSrc} alt={`${previewImage.type} display`} style={{maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",borderRadius:10}}/>:<div style={{color:"#999999",fontSize:13}}>No image available</div>}
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:"#1F1F1F",marginBottom:10}}>Visit Information</div>
            {[
              ["Merchandiser",p?.full_name||"—"],
              ["Employee ID",p?.employee_id||"—"],
              ["Shop",`${s?.name||v.shop_name||"—"} ${s?.branch||""}`],
              ["Area",area?.name||"—"],
              ["Check-in",fmt(v.check_in_time)],
              ["Check-out",fmt(v.check_out_time)||"—"],
              ["Duration",v.visit_duration_minutes?`${v.visit_duration_minutes} min`:"—"],
              ["GPS status",gpsStatus],
              ["Distance",distance!=null?`${distance} km`:"—"],
              ["Coordinates",lat&&lng?`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`:"—"]
            ].map(([label,value])=><div key={label} style={{display:"flex",justifyContent:"space-between",gap:12,padding:"8px 0",borderBottom:"1px solid #E8E8E8"}}>
              <span style={{fontSize:12,color:"#777777",fontWeight:700}}>{label}</span>
              <span style={{fontSize:12,color:"#1F1F1F",textAlign:"right"}}>{value}</span>
            </div>)}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
              {lat&&lng&&<a href={mapLink(lat,lng)} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}><Btn size="sm" variant="success">📍 Open Map</Btn></a>}
              {v.before_image_url&&<Btn size="sm" onClick={()=>setPreviewImage({visit:v,type:"Before"})}>Before</Btn>}
              {v.after_image_url&&<Btn size="sm" onClick={()=>setPreviewImage({visit:v,type:"After"})}>After</Btn>}
            </div>

            <div style={{fontSize:13,fontWeight:700,color:"#1F1F1F",margin:"18px 0 8px"}}>Visit Notes</div>
            <div style={{background:"#FFFFFF",border:"1px solid #E8E8E8",borderRadius:10,padding:10,fontSize:12,color:"#555555",lineHeight:1.6}}>
              <div><b>Display:</b> {v.display_notes||v.notes||"—"}</div>
              <div><b>Stock/OOS:</b> {v.stock_issue||"—"}</div>
              <div><b>Competitor:</b> {v.competitor_activity||"—"}</div>
              <div><b>Order request:</b> {v.order_request||"—"}</div>
            </div>

            <div style={{fontSize:13,fontWeight:700,color:"#1F1F1F",margin:"18px 0 8px"}}>Management Comment</div>
            {isManager?<div>
              <textarea value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} placeholder="Add manager comment..." style={{width:"100%",minHeight:82,border:"1px solid #D5D5D5",borderRadius:10,padding:10,fontFamily:"inherit",fontSize:13,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <Btn size="sm" variant="primary" onClick={saveComment}>Save Comment</Btn>
                {v.id&&<Btn size="sm" variant="success" onClick={()=>approve(v.id,"Approved")}>Approve</Btn>}
                {v.id&&<Btn size="sm" variant="danger" onClick={()=>approve(v.id,"Rejected")}>Reject</Btn>}
              </div>
            </div>:<div style={{background:"#FFFFFF",border:"1px solid #E8E8E8",borderRadius:10,padding:10,fontSize:13,color:"#555555",minHeight:44}}>{comment||"No management comment yet."}</div>}
          </div>
        </div>
      </Modal>;
    })()}
  </div>;
}



// DELIVERIES
function DeliveriesPage({user,shops,profiles,deliveries,setDeliveries}){
  const myDels=["Admin","MD","Chief Manager","Accountant"].includes(user.role)?deliveries:deliveries.filter(d=>d.driver_id===user.id);
  const update=async(id,data)=>{
    await db("deliveries","update",{data,eq:{id}});
    setDeliveries(prev=>prev.map(d=>d.id===id?{...d,...data}:d));
  };

  const deliveryStatusValue=d=>{
    if(d.delivery_distance_m==null)return"Unknown";
    return proximityStatus(d.delivery_distance_m/1000);
  };

  return <div>
    <PageHeader title="Deliveries" subtitle="Trip management and delivery proof"/>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <StatCard label="Total" value={myDels.length}/>
      <StatCard label="Delivered" value={myDels.filter(d=>d.status==="Delivered").length} color="#0F6E56"/>
      <StatCard label="In Transit" value={myDels.filter(d=>d.status==="In Transit").length} color="#378ADD"/>
      <StatCard label="Delayed" value={myDels.filter(d=>d.status==="Delayed").length} color="#C74C51"/>
      <StatCard label="Verified GPS" value={myDels.filter(d=>deliveryStatusValue(d)==="Confirmed").length} color="#0F6E56"/>
      <StatCard label="Suspicious" value={myDels.filter(d=>deliveryStatusValue(d)==="Suspicious").length} color="#C74C51"/>
      <StatCard label="GRV Pending" value={myDels.filter(d=>!d.grv_confirmed).length} color="#C4A747"/>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Delivery #","Shop","Driver","Status","GPS","On Time","GRV","Proof","Actions"]}
        rows={myDels.map(d=>{
          const shop=shops.find(s=>s.id===d.shop_id);
          const driver=profiles.find(p=>p.id===d.driver_id);
          return [
            <span style={{fontSize:"13px",fontWeight:"600",color:"#0F6E56"}}>{d.delivery_number}</span>,
            <div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{shop?.name}</div><div style={{fontSize:"11px",color:"#999999"}}>{shop?.branch}</div></div>,
            <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={driver?.full_name} role={driver?.role} size={28}/><span style={{fontSize:"13px"}}>{driver?.full_name?.split(" ")[0]}</span></div>,
            <StatusBadge s={d.status}/>,
            <LocationBadge distance={d.delivery_distance_m!=null?d.delivery_distance_m/1000:null}/>,
            d.is_on_time===null?<span style={{color:"#999999",fontSize:"13px"}}>—</span>:<span style={{fontSize:"13px"}}>{d.is_on_time?"✅ Yes":"❌ No"}</span>,
            <span style={{fontSize:"13px",fontWeight:d.grv_confirmed?"600":"400"}}>{d.grv_confirmed?"✅ Confirmed":"⏳ Pending"}</span>,
            d.delivery_proof_url?<span style={{fontSize:"13px",color:"#0F6E56",fontWeight:"600"}}>✅ Uploaded</span>:<span style={{fontSize:"13px",color:"#999999"}}>—</span>,
            <div style={{display:"flex",gap:6}}>
              {user.role==="Driver"&&d.driver_id===user.id&&d.status==="In Transit"&&
                <Btn size="sm" variant="success" onClick={()=>update(d.id,{status:"Delivered",reach_time:new Date().toISOString(),is_on_time:true})}>Delivered</Btn>}
              {user.role==="Driver"&&d.driver_id===user.id&&d.status==="In Transit"&&
                <Btn size="sm" variant="danger" onClick={()=>{const r=prompt("Delay reason:");if(r)update(d.id,{status:"Delayed",delay_reason:r,is_on_time:false});}}>Delay</Btn>}
              {["Admin","MD","Accountant"].includes(user.role)&&!d.grv_confirmed&&
                <Btn size="sm" onClick={()=>update(d.id,{grv_confirmed:true,grv_confirmed_by:user.id})}>Confirm GRV</Btn>}
            </div>
          ];
        })}/>
    </Card>
  </div>;
}

// LPO
function LPOPage({user,shops,profiles,lpos,setLpos}){
  const myLpos=["Admin","MD","Chief Manager","Accountant"].includes(user.role)?lpos:lpos.filter(l=>l.salesman_id===user.id);
  const update=async(id,data)=>{
    await db("lpos","update",{data,eq:{id}});
    setLpos(prev=>prev.map(l=>l.id===id?{...l,...data}:l));
  };

  return <div>
    <PageHeader title="LPO Management" subtitle="Local purchase orders — upload, approve and track"/>
    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
      <StatCard label="Total LPOs" value={myLpos.length}/>
      <StatCard label="Pending" value={myLpos.filter(l=>l.status==="Pending").length} color="#C4A747"/>
      <StatCard label="Approved" value={myLpos.filter(l=>l.status==="Approved").length} color="#0F6E56"/>
      <StatCard label="Total Value" value={`OMR ${myLpos.reduce((s,l)=>s+(l.amount||0),0).toFixed(3)}`}/>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["LPO #","Shop","Salesman","Amount (OMR)","Status","Date","Actions"]}
        rows={myLpos.map(l=>{
          const shop=shops.find(s=>s.id===l.shop_id);
          const sales=profiles.find(p=>p.id===l.salesman_id);
          return [
            <span style={{fontSize:"13px",fontWeight:"600",color:"#0F6E56"}}>{l.lpo_number}</span>,
            <div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{shop?.name}</div><div style={{fontSize:"11px",color:"#999999"}}>{shop?.branch}</div></div>,
            <span style={{fontSize:"13px"}}>{sales?.full_name}</span>,
            <span style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{(l.amount||0).toFixed(3)}</span>,
            <StatusBadge s={l.status}/>,
            <span style={{fontSize:"13px"}}>{fmtDate(l.created_at)}</span>,
            <div style={{display:"flex",gap:6}}>
              {["Admin","MD","Chief Manager"].includes(user.role)&&l.status==="Pending"&&<>
                <Btn size="sm" variant="success" onClick={()=>update(l.id,{status:"Approved"})}>Approve</Btn>
                <Btn size="sm" variant="danger" onClick={()=>update(l.id,{status:"Rejected"})}>Reject</Btn>
              </>}
              {user.role==="Accountant"&&l.status==="Approved"&&
                <Btn size="sm" onClick={()=>update(l.id,{status:"Invoiced"})}>Mark Invoiced</Btn>}
            </div>
          ];
        })}/>
    </Card>
  </div>;
}

// SCORES
function ScoresPage({profiles,scores,areas}){
  const today=new Date().toISOString().split("T")[0];
  const todayScores=scores.filter(s=>s.score_date===today).sort((a,b)=>b.total_score-a.total_score);

  return <div>
    <PageHeader title="Daily Performance Scores" subtitle={`Scores for ${fmtDate(today)}`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:28}}>
      <StatCard label="Average Score" value={`${Math.round(todayScores.reduce((s,x)=>s+x.total_score,0)/(todayScores.length||1))}/100`}/>
      <StatCard label="≥80 (Good)" value={todayScores.filter(s=>s.total_score>=80).length} color="#0F6E56"/>
      <StatCard label="60-79 (OK)" value={todayScores.filter(s=>s.total_score>=60&&s.total_score<80).length} color="#C4A747"/>
      <StatCard label="<60 (Low)" value={todayScores.filter(s=>s.total_score<60).length} color="#C74C51"/>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Rank","Staff","Role","Score","Breakdown","Area"]}
        rows={todayScores.map((sc,i)=>{
          const p=profiles.find(x=>x.id===sc.user_id);
          const area=areas.find(a=>a.id===p?.area_id);
          return [
            <span style={{fontSize:"18px"}}>{"🥇🥈🥉"[i]||`#${i+1}`}</span>,
            <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={p?.full_name} role={p?.role} size={36}/><div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{p?.full_name}</div><div style={{fontSize:"11px",color:"#999999"}}>{p?.employee_id}</div></div></div>,
            p?<Badge label={p.role}/>:null,
            <ScoreCircle score={sc.total_score} size={52}/>,
            <ScoreBar score={sc.total_score}/>,
            <span style={{fontSize:"13px",color:"#666666"}}>{area?.name||"—"}</span>
          ];
        })}/>
    </Card>
  </div>;
}

// RANKINGS
function RankingsPage({profiles,scores,visits,deliveries,attendance}){
  const today=new Date().toISOString().split("T")[0];
  const ts=scores.filter(s=>s.score_date===today);
  const byRole=r=>ts.filter(s=>s.role===r).sort((a,b)=>b.total_score-a.total_score);
  const bestMerch=byRole("Merchandiser")[0];
  const bestSales=byRole("Salesman")[0];
  const bestDriver=byRole("Driver")[0];
  const weakStaff=ts.filter(s=>s.total_score<60);
  const fakeVisits=visits.filter(v=>v.is_fake_visit&&v.visit_date===today);
  const delays=deliveries.filter(d=>d.status==="Delayed"&&d.assigned_date===today);
  const absents=attendance.filter(a=>a.date===today&&a.status==="Absent");

  const PodiumCard=({title,sc})=>{
    if(!sc)return<Card><div style={{fontWeight:"600",marginBottom:10,fontSize:"13px",color:"#1F1F1F"}}>{title}</div><p style={{color:"#999999",fontSize:"13px"}}>No data yet</p></Card>;
    const p=profiles.find(x=>x.id===sc.user_id);
    return<Card>
      <div style={{fontWeight:"600",marginBottom:14,fontSize:"13px",color:"#1F1F1F"}}>{title}</div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <ScoreCircle score={sc.total_score} size={60}/>
        <div style={{flex:1}}>
          <Avatar name={p?.full_name} role={p?.role} size={40}/>
          <div style={{fontWeight:"600",fontSize:"14px",color:"#1F1F1F",marginTop:8}}>{p?.full_name}</div>
          <Badge label={p?.role}/>
        </div>
      </div>
    </Card>;
  };

  return <div>
    <PageHeader title="Rankings & Alerts" subtitle="Today's performance leaderboard"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:28}}>
      <PodiumCard title="🥇 Best Merchandiser" sc={bestMerch}/>
      <PodiumCard title="🥇 Best Salesman" sc={bestSales}/>
      <PodiumCard title="🥇 Best Driver" sc={bestDriver}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"13px",color:"#C74C51"}}>⚠️ Low Score Staff (Below 60)</div>
        {weakStaff.length===0?<p style={{color:"#999999",fontSize:"13px"}}>None today 🎉</p>:weakStaff.map(sc=>{
          const p=profiles.find(x=>x.id===sc.user_id);
          return<div key={sc.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #E5E5E5"}}>
            <Avatar name={p?.full_name} role={p?.role} size={32}/>
            <div style={{flex:1}}><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{p?.full_name}</div><div style={{fontSize:"11px",color:"#999999"}}>{p?.role}</div></div>
            <ScoreCircle score={sc.total_score} size={40}/>
          </div>;
        })}
      </Card>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"13px",color:"#C74C51"}}>🚩 Flagged Visits Today</div>
        {fakeVisits.length===0?<p style={{color:"#999999",fontSize:"13px"}}>No fake visits today ✅</p>:fakeVisits.map(v=>{
          const p=profiles.find(x=>x.id===v.user_id);
          return<div key={v.id} style={{padding:"10px 0",borderBottom:"1px solid #E5E5E5"}}>
            <div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{p?.full_name}</div>
            <div style={{fontSize:"12px",color:"#666666",marginTop:2}}>Distance: {v.distance_from_shop}km from shop</div>
          </div>;
        })}
      </Card>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"13px",color:"#C4A747"}}>🕐 Delayed Deliveries</div>
        {delays.length===0?<p style={{color:"#999999",fontSize:"13px"}}>No delays today ✅</p>:delays.map(d=>{
          const driver=profiles.find(p=>p.id===d.driver_id);
          return<div key={d.id} style={{padding:"10px 0",borderBottom:"1px solid #E5E5E5"}}>
            <div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{d.delivery_number}</div>
            <div style={{fontSize:"12px",color:"#666666",marginTop:2}}>{driver?.full_name} — {d.delay_reason||"No reason given"}</div>
          </div>;
        })}
      </Card>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"13px",color:"#C74C51"}}>🔴 Absent Today</div>
        {absents.length===0?<p style={{color:"#999999",fontSize:"13px"}}>Full attendance ✅</p>:absents.map(a=>{
          const p=profiles.find(x=>x.id===a.user_id);
          return<div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #E5E5E5"}}>
            <Avatar name={p?.full_name} role={p?.role} size={32}/>
            <div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{p?.full_name}</div><div style={{fontSize:"11px",color:"#999999"}}>{p?.role}</div></div>
          </div>;
        })}
      </Card>
    </div>
  </div>;
}

// REPORTS
function ReportsPage({profiles,attendance,visits,deliveries,lpos,scores,areas,shops}){
  const today=new Date().toISOString().split("T")[0];
  const todayAtt=attendance.filter(a=>a.date===today);
  const todayVis=visits.filter(v=>v.visit_date===today);
  const todayDel=deliveries.filter(d=>d.assigned_date===today);
  const todayScores=scores.filter(s=>s.score_date===today);

  const exportCSV=(data,name)=>{
    if(!data.length)return;
    const keys=Object.keys(data[0]);
    const csv=[keys.join(","),...data.map(r=>keys.map(k=>`"${r[k]||""}"`).join(","))].join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download=name+".csv";a.click();
  };

  return <div>
    <PageHeader title="Daily Closing Report" subtitle={`Generated for ${fmtDate(today)}`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:28}}>
      <StatCard label="Total Visits" value={todayVis.length}/>
      <StatCard label="Completed" value={todayVis.filter(v=>v.status==="Completed").length} color="#0F6E56"/>
      <StatCard label="LPOs Collected" value={lpos.filter(l=>new Date(l.created_at).toISOString().split("T")[0]===today).length}/>
      <StatCard label="Deliveries Done" value={todayDel.filter(d=>d.status==="Delivered").length} color="#0F6E56"/>
      <StatCard label="Delayed" value={todayDel.filter(d=>d.status==="Delayed").length} color="#C74C51"/>
      <StatCard label="GRV Pending" value={todayDel.filter(d=>!d.grv_confirmed).length} color="#C4A747"/>
      <StatCard label="Staff Present" value={todayAtt.filter(a=>a.status!=="Absent").length} color="#0F6E56"/>
      <StatCard label="Absent" value={todayAtt.filter(a=>a.status==="Absent").length} color="#C74C51"/>
      <StatCard label="Avg Score" value={Math.round(todayScores.reduce((s,x)=>s+x.total_score,0)/(todayScores.length||1))+"/100"}/>
      <StatCard label="Fake Visits" value={todayVis.filter(v=>v.is_fake_visit).length} color="#C74C51"/>
      <StatCard label="Pending Approvals" value={todayAtt.filter(a=>a.approval_status==="Pending").length} color="#C4A747"/>
      <StatCard label="LPO Pending" value={lpos.filter(l=>l.status==="Pending").length} color="#C4A747"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"14px",color:"#1F1F1F"}}>Area-wise Visit Summary</div>
        {areas.map(a=>{
          const aShops=shops.filter(s=>s.area_id===a.id).map(s=>s.id);
          const aVis=todayVis.filter(v=>aShops.includes(v.shop_id));
          const done=aVis.filter(v=>v.status==="Completed").length;
          return<div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #E5E5E5"}}>
            <span style={{fontSize:"13px",flex:1,fontWeight:"600",color:"#1F1F1F"}}>{a.name}</span>
            <span style={{fontSize:"12px",color:"#666666"}}>{done}/{aVis.length} visits</span>
            <ScoreBar score={aVis.length?Math.round((done/aVis.length)*100):0}/>
          </div>;
        })}
      </Card>
      <Card>
        <div style={{fontWeight:"600",marginBottom:16,fontSize:"14px",color:"#1F1F1F"}}>Export Reports</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["Attendance Report",todayAtt],["Visits Report",todayVis],["Delivery Report",todayDel],["LPO Report",lpos],["Score Report",todayScores]].map(([label,data])=>(
            <div key={label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #E5E5E5"}}>
              <span style={{fontSize:"13px",color:"#1F1F1F"}}>{label}</span>
              <Btn size="sm" onClick={()=>exportCSV(data,label.replace(/ /g,"_"))}>📥 CSV</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>;
}

// PRODUCT MASTER
function ProductMasterPage({products,setProducts}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const save=async()=>{
    if(modal==="create"){const rows=await db("products","insert",{data:{...form,id:`p${Date.now()}`}});if(rows.length)setProducts(prev=>[rows[0],...prev]);}
    else{await db("products","update",{data:form,eq:{id:form.id}});setProducts(prev=>prev.map(p=>p.id===form.id?form:p));}
    setModal(null);
  };
  const del=async id=>{if(!confirm("Delete product?"))return;await db("products","delete",{eq:{id}});setProducts(prev=>prev.filter(p=>p.id!==id));};
  return <div>
    <PageHeader title="Product Master" subtitle={`${products.length} products`} action={<Btn variant="primary" onClick={()=>{setForm({});setModal("create");}}>+ Add Product</Btn>} />
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Code","Name","Category","Brand","Price","Stock","Actions"]}
        rows={products.map(p=>[
          <div style={{fontWeight:600}}>{p.product_code}</div>,
          <div>{p.product_name}<div style={{fontSize:12,color:'#999'}}>{p.remarks}</div></div>,
          <div>{p.category}</div>,
          <div>{p.brand}</div>,
          <div>{p.selling_price!=null?`$${p.selling_price}`:'—'}</div>,
          <div>{p.stock_status}</div>,
          <div style={{display:'flex',gap:6}}><Btn size="sm" onClick={()=>{setForm({...p});setModal('edit');}}>Edit</Btn><Btn size="sm" variant="danger" onClick={()=>del(p.id)}>Delete</Btn></div>
        ])} />
    </Card>
    {modal&&<Modal title={modal==="create"?"Add Product":"Edit Product"} onClose={()=>setModal(null)}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[['Product Code','product_code'],['Name','product_name'],['Category','category'],['Brand','brand'],['Unit','unit'],['Barcode','barcode']].map(([l,k])=>(
          <div key={k}><label style={{fontSize:12,fontWeight:600,color:'#666',display:'block',marginBottom:6}}>{l}</label><Input value={form[k]} onChange={v=>setForm(f=>({...f,[k]:v}))}/></div>
        ))}
        <div><label style={{fontSize:12,fontWeight:600,color:'#666',display:'block',marginBottom:6}}>Selling Price</label><Input value={form.selling_price} onChange={v=>setForm(f=>({...f,selling_price:Number(v)}))}/></div>
        <div><label style={{fontSize:12,fontWeight:600,color:'#666',display:'block',marginBottom:6}}>Stock Status</label><Select value={form.stock_status} onChange={v=>setForm(f=>({...f,stock_status:v}))}><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></Select></div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:16}}><Btn onClick={()=>setModal(null)}>Cancel</Btn><Btn variant='primary' onClick={save}>{modal==='create'?'Create':'Save'}</Btn></div>
    </Modal>}
  </div>;
}

// MEMOS / DOCUMENTS
function MemoDocumentsPage({memo_documents,setMemoDocuments,profiles,products,shops}){
  const approve=async(id)=>{await db('memo_documents','update',{data:{approval_status:'Approved'},eq:{id}});setMemoDocuments(prev=>prev.map(m=>m.id===id?{...m,approval_status:'Approved'}:m));};
  return <div>
    <PageHeader title="Memo / Documents" subtitle={`${memo_documents.length} items`} />
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {memo_documents.map(m=>{
        const uploader=profiles.find(p=>p.id===m.uploaded_by);
        return <Card key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:600}}>{m.title} <span style={{fontSize:12,color:'#999'}}>{m.type}</span></div>
            <div style={{fontSize:12,color:'#666'}}>{m.related_reference_name||''} · Uploaded by {uploader?.full_name||'—'} · {fmt(m.upload_at)}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <a href={m.file_url} target="_blank" rel="noreferrer"><Btn size='sm' variant='ghost'>Preview</Btn></a>
            {m.approval_status!=='Approved'&&<Btn size='sm' variant='primary' onClick={()=>approve(m.id)}>Approve</Btn>}
          </div>
        </Card>;
      })}
    </div>
  </div>;
}

// AUTHORIZATIONS
function AuthorizationsPage({user,profiles,authorizations,setAuthorizations,setNotifications}){
  const canApprove=["Admin","MD","Chief Manager","Monitoring Manager","Accountant"].includes(user.role);
  const updateStatus=async(id,status)=>{
    setAuthorizations(prev=>prev.map(a=>a.id===id?{...a,status}:a));
    if(status==="Approved"){
      setNotifications(prev=>[{id:`n${Date.now()}`,user_id:user.id,title:"Authorization approved",body:`${user.full_name} approved request.`,type:"approval_pending",is_read:false,created_at:new Date().toISOString()},...prev]);
    }
  };
  return <div>
    <PageHeader title="Authorizations" subtitle="Approve operations that require manager consent"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:24}}>
      <StatCard label="Pending" value={authorizations.filter(a=>a.status==="Pending").length} color="#C4A747"/>
      <StatCard label="Approved" value={authorizations.filter(a=>a.status==="Approved").length} color="#0F6E56"/>
      <StatCard label="Rejected" value={authorizations.filter(a=>a.status==="Rejected").length} color="#C74C51"/>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Auth ID","Action","Requestor","Requested","Status","Review"]}
        rows={authorizations.map(a=>{
          const userReq=profiles.find(p=>p.id===a.user_id);
          return [
            <span style={{fontSize:"13px",fontWeight:"600",color:"#0F6E56"}}>{a.authorization_id}</span>,
            <div><div style={{fontSize:"13px",fontWeight:"600",color:"#1F1F1F"}}>{a.action}</div><div style={{fontSize:"11px",color:"#999999"}}>{a.note}</div></div>,
            userReq?<span style={{fontSize:"13px"}}>{userReq.full_name}</span>:<span style={{fontSize:"13px"}}>—</span>,
            <span style={{fontSize:"13px",color:"#666666"}}>{fmt(a.requested_at)}</span>,
            <StatusBadge s={a.status}/>,
            canApprove&&a.status==="Pending"?<div style={{display:"flex",gap:6}}>
              <Btn size="sm" variant="success" onClick={()=>updateStatus(a.id,"Approved")}>Approve</Btn>
              <Btn size="sm" variant="danger" onClick={()=>updateStatus(a.id,"Rejected")}>Reject</Btn>
            </div>:null
          ];
        })}/>
    </Card>
  </div>;
}

// BACKUP LOGS
function BackupLogsPage({user,profiles,backup_logs,setBackupLogs}){
  const takeBackup=()=>{
    const newLog={id:`b${Date.now()}`,backup_id:`BKP-${Math.random().toString(36).substring(2,10).toUpperCase()}`,backup_type:"Manual",backup_status:"Success",taken_by:user.id,taken_at:new Date().toISOString(),scheduled_for:null,file_url:`/backups/manual-${Date.now()}.zip`,size_bytes:Math.round(12000000 + Math.random()*8000000),notes:"Manual backup completed successfully."};
    setBackupLogs(prev=>[newLog,...prev]);
    alert("Manual backup completed and logged.");
  };
  return <div>
    <PageHeader title="Backup Logs" subtitle="Track database snapshots and scheduled exports" action={<Btn variant="primary" onClick={takeBackup}>Run Backup</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:24}}>
      <StatCard label="Total backups" value={backup_logs.length}/>
      <StatCard label="Success" value={backup_logs.filter(b=>b.backup_status==="Success").length} color="#0F6E56"/>
      <StatCard label="Failed" value={backup_logs.filter(b=>b.backup_status==="Failed").length} color="#C74C51"/>
      <StatCard label="Manual" value={backup_logs.filter(b=>b.backup_type==="Manual").length}/>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["Backup ID","Type","Status","By","Taken At","Size","Notes"]}
        rows={backup_logs.map(b=>{
          const owner=profiles.find(p=>p.id===b.taken_by);
          return [
            <span style={{fontSize:"13px",fontWeight:"600",color:"#0F6E56"}}>{b.backup_id}</span>,
            <span style={{fontSize:"13px"}}>{b.backup_type}</span>,
            <StatusBadge s={b.backup_status}/>,
            <span style={{fontSize:"13px"}}>{owner?.full_name||"System"}</span>,
            <span style={{fontSize:"13px"}}>{fmt(b.taken_at)}</span>,
            <span style={{fontSize:"13px"}}>{b.size_bytes?`${(b.size_bytes/1024/1024).toFixed(1)} MB`:"—"}</span>,
            <span style={{fontSize:"13px",color:"#666666"}}>{b.notes}</span>
          ];
        })}/>
    </Card>
  </div>;
}

// SESSIONS
function SessionsPage({profiles,login_sessions,setLoginSessions}){
  const activeCount=login_sessions.filter(s=>s.active).length;
  const staleCount=login_sessions.filter(s=>new Date(s.last_seen) < new Date(Date.now() - 1000*60*30)).length;
  const logoutSession=id=>{
    setLoginSessions(prev=>prev.map(s=>s.id===id?{...s,active:false,logout_at:new Date().toISOString(),last_seen:new Date().toISOString()}:s));
  };
  return <div>
    <PageHeader title="Session Tracker" subtitle="Monitor live logins and expire stale credentials"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:24}}>
      <StatCard label="Active sessions" value={activeCount} color="#0F6E56"/>
      <StatCard label="Total sessions" value={login_sessions.length}/>
      <StatCard label="Stale sessions" value={staleCount} color="#C74C51"/>
      <StatCard label="Unique devices" value={new Set(login_sessions.map(s=>s.device_name)).size}/>
    </div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["User","Device","OS","IP","Logged In","Last Seen","Status","Action"]}
        rows={login_sessions.map(s=>{
          const owner=profiles.find(p=>p.id===s.user_id);
          return [
            owner ? <span style={{fontSize:"13px"}}>{owner.full_name}</span> : <span style={{fontSize:"13px"}}>Unknown</span>,
            <span style={{fontSize:"13px"}}>{s.device_name}</span>,
            <span style={{fontSize:"13px"}}>{s.device_os}</span>,
            <span style={{fontSize:"13px"}}>{s.ip_address}</span>,
            <span style={{fontSize:"13px"}}>{fmt(s.login_at)}</span>,
            <span style={{fontSize:"13px"}}>{fmt(s.last_seen)}</span>,
            <StatusBadge s={s.active?"Active":"Expired"}/>,
            s.active ? <Btn size="sm" variant="danger" onClick={()=>logoutSession(s.id)}>Logout</Btn> : <span style={{fontSize:"13px",color:"#999999"}}>—</span>
          ];
        })}/>
    </Card>
  </div>;
}

// SETTINGS
function SettingsPage({company_settings,setCompanySettings,user,onInstallApp,canInstallApp,isStandalone}){
  return <div>
    <PageHeader title="System Settings" subtitle="Manage company branding, security and controls"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20,marginBottom:24}}>
      <Card style={{padding:"20px 22px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{width:72,height:72,background:"#F7F7F7",borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"1px solid #E5E5E5"}}>
            <img src={company_settings.company_logo_url||DEFAULT_LOGO} alt="Company logo" style={{width:"100%",height:"100%",objectFit:"contain"}} />
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#1F1F1F"}}>{company_settings.company_name}</div>
            <div style={{fontSize:12,color:"#777777",marginTop:4}}>{company_settings.company_subtitle}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#999999",marginBottom:6}}>Company name</div>
            <Input value={company_settings.company_name} onChange={v=>setCompanySettings({...company_settings,company_name:v})} />
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#999999",marginBottom:6}}>Subtitle</div>
            <Input value={company_settings.company_subtitle} onChange={v=>setCompanySettings({...company_settings,company_subtitle:v})} />
          </div>
        </div>
        <div style={{marginTop:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#999999",marginBottom:6}}>Company logo URL</div>
          <Input value={company_settings.company_logo_url} onChange={v=>setCompanySettings({...company_settings,company_logo_url:v})} />
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
          <Btn variant="primary" onClick={()=>alert('Settings saved in demo mode.')}>Save settings</Btn>
        </div>
      </Card>
      <Card style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{fontSize:14,fontWeight:700,color:"#1F1F1F"}}>Security & access</div>
        <div style={{fontSize:13,color:"#666666"}}>Use the demo role switcher to preview access for Admin, MD, Merchandiser and Salesman.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Btn size="sm" variant="ghost" onClick={()=>alert('Change password is available under user profile.')}>Change password</Btn>
          <Btn size="sm" variant="ghost" onClick={()=>alert('Notification settings will be available soon.')}>Notification rules</Btn>
          <Btn size="sm" variant="success" onClick={onInstallApp} style={{gridColumn:"1 / -1",justifyContent:"center"}}>
            {isStandalone?"App Installed":canInstallApp?"Install App":"Install App"}
          </Btn>
        </div>
        <div style={{background:"#F9F9F9",borderRadius:12,padding:16,border:"1px solid #E8E8E8"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#999999",marginBottom:8}}>ERP style</div>
          <div style={{fontSize:13,color:"#444444",lineHeight:1.6}}>Al Lewa General Trading LLC with professional FMCG dashboard styling, strong cards, clear status chips and rich navigation.</div>
        </div>
      </Card>
    </div>
  </div>;
}

// NOTIFICATIONS
function NotificationsPage({user,notifications,setNotifications}){
  const myNotifs=notifications.filter(n=>n.user_id===user.id||["Admin","MD"].includes(user.role));
  const markRead=async id=>{
    await db("notifications","update",{data:{is_read:true},eq:{id}});
    setNotifications(prev=>prev.map(n=>n.id===id?{...n,is_read:true}:n));
  };
  const markAll=()=>myNotifs.forEach(n=>!n.is_read&&markRead(n.id));

  const icons={absent:"🔴",visit_incomplete:"🟡",delivery_delayed:"🟠",lpo_uploaded:"🟢",approval_pending:"🔵",md_summary:"📊",grv_pending:"📦",low_score:"📉",accountant_pending:"📋",general:"💬"};

  return <div>
    <PageHeader title="Notifications" subtitle={`${myNotifs.filter(n=>!n.is_read).length} unread messages`}
      action={<Btn onClick={markAll}>Mark All Read</Btn>}/>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {myNotifs.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(n=>(
        <Card key={n.id} style={{display:"flex",gap:14,alignItems:"flex-start",opacity:n.is_read?0.65:1,borderLeft:`4px solid ${n.is_read?"#E5E5E5":"#0F6E56"}`,transition:"opacity 0.2s"}}>
          <span style={{fontSize:"22px",flexShrink:0}}>{icons[n.type]||"💬"}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:"600",fontSize:"13px",color:"#1F1F1F"}}>{n.title}</div>
            <div style={{fontSize:"12px",color:"#666666",marginTop:4}}>{n.body}</div>
            <div style={{fontSize:"11px",color:"#999999",marginTop:6}}>{fmt(n.created_at)}</div>
          </div>
          {!n.is_read&&<Btn size="sm" variant="ghost" onClick={()=>markRead(n.id)}>✓ Read</Btn>}
        </Card>
      ))}
      {myNotifs.length===0&&<Card><p style={{color:"#999999",fontSize:"13px"}}>No notifications.</p></Card>}
    </div>
  </div>;
}

// USERS PAGE
function UsersPage({user,profiles,setProfiles,areas}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const save=async()=>{
    if(modal==="create"){const rows=await db("profiles","insert",{data:{...form,id:`demo-${Date.now()}`}});if(rows.length)setProfiles(prev=>[rows[0],...prev]);}
    else{await db("profiles","update",{data:form,eq:{id:form.id}});setProfiles(prev=>prev.map(p=>p.id===form.id?form:p));}
    setModal(null);
  };
  const del=async id=>{if(!confirm("Delete user?"))return;await db("profiles","delete",{eq:{id}});setProfiles(prev=>prev.filter(p=>p.id!==id));};

  return<div>
    <PageHeader title="User Management" subtitle={`${profiles.length} users · ${profiles.filter(p=>p.status==="Active").length} active`}
      action={<Btn variant="primary" onClick={()=>{setForm({status:"Active",role:"Merchandiser"});setModal("create");}}>+ Add User</Btn>}/>
    <Card style={{padding:0,overflow:"hidden"}}>
      <Table headers={["User","Role","Area","Status","Last Login","Actions"]}
        rows={profiles.map(p=>{
          const area=areas.find(a=>a.id===p.area_id);
          return[
            <div style={{display:"flex",alignItems:"center",gap:12}}><Avatar name={p.full_name} role={p.role} size={36}/><div><div style={{fontWeight:"600",fontSize:"13px",color:"#1F1F1F"}}>{p.full_name}</div><div style={{fontSize:"11px",color:"#999999"}}>{p.employee_id} · {p.mobile}</div></div></div>,
            <Badge label={p.role}/>,
            <span style={{fontSize:"13px"}}>{area?.name||"—"}</span>,
            <StatusBadge s={p.status}/>,
            <span style={{fontSize:"13px",color:"#666666"}}>{fmt(p.last_login)||"Never"}</span>,
            <div style={{display:"flex",gap:6}}>
              <Btn size="sm" onClick={()=>{setForm({...p});setModal("edit");}}>Edit</Btn>
              <Btn size="sm" variant="danger" onClick={()=>del(p.id)}>Delete</Btn>
            </div>
          ];
        })}/>
    </Card>
    {modal&&<Modal title={modal==="create"?"Add User":"Edit User"} onClose={()=>setModal(null)} width={"500px"}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px",marginBottom:14}}>
        {[["Full Name","full_name"],["Employee ID","employee_id"],["Mobile","mobile"],["Email","email"],["Username","username"]].map(([l,k])=>(
          <div key={k} style={{marginBottom:14}}>
            <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>{l}</label>
            <Input value={form[k]} onChange={v=>setForm(f=>({...f,[k]:v}))}/>
          </div>
        ))}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Role</label>
          <Select value={form.role} onChange={v=>setForm(f=>({...f,role:v}))} style={{width:"100%"}}>
            {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Area</label>
          <Select value={form.area_id} onChange={v=>setForm(f=>({...f,area_id:v}))} style={{width:"100%"}}>
            <option value="">Select area</option>
            {areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Status</label>
          <Select value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} style={{width:"100%"}}>
            <option value="Active">Active</option><option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid #E5E5E5"}}>
        <Btn onClick={()=>setModal(null)}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>{modal==="create"?"Create User":"Save Changes"}</Btn>
      </div>
    </Modal>}
  </div>;
}

// AREAS PAGE  
function AreasPage({areas,setAreas,shops,canEdit}){
  const [modal,setModal]=useState(null);
  const [form,setForm]=useState({});
  const save=async()=>{
    if(modal==="create"){const rows=await db("areas","insert",{data:{...form,id:`area-${Date.now()}`}});if(rows.length)setAreas(p=>[rows[0],...p]);}
    else{await db("areas","update",{data:form,eq:{id:form.id}});setAreas(p=>p.map(a=>a.id===form.id?form:a));}
    setModal(null);
  };
  return<div>
    <PageHeader title="Geographic Areas" subtitle="Geographical zones and shop grouping"
      action={canEdit&&<Btn variant="primary" onClick={()=>{setForm({});setModal("create");}}>+ Add Area</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
      {areas.map(a=>{
        const aShops=shops.filter(s=>s.area_id===a.id);
        return<Card key={a.id}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
            <div><div style={{fontWeight:"600",fontSize:"15px",color:"#1F1F1F"}}>{a.name}</div><div style={{fontSize:"12px",color:"#999999",marginTop:2}}>{a.region}</div></div>
            {canEdit&&<Btn size="sm" onClick={()=>{setForm({...a});setModal("edit");}}>Edit</Btn>}
          </div>
          <div style={{fontSize:"13px",color:"#666666",marginBottom:12}}>{aShops.length} shops assigned</div>
          <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
            {aShops.slice(0,3).map(s=><span key={s.id} style={{fontSize:"11px",background:"#F5F5F5",padding:"4px 10px",borderRadius:6,color:"#666666",border:"1px solid #E5E5E5"}}>{s.name} {s.branch}</span>)}
            {aShops.length>3&&<span style={{fontSize:"11px",color:"#999999",padding:"4px 0"}}>+{aShops.length-3} more</span>}
          </div>
        </Card>;
      })}</div>
    {modal&&<Modal title={modal==="create"?"Add Area":"Edit Area"} onClose={()=>setModal(null)} width={420}>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Area Name</label>
        <Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))}/>
      </div>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Region</label>
        <Input value={form.region} onChange={v=>setForm(f=>({...f,region:v}))}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid #E5E5E5"}}>
        <Btn onClick={()=>setModal(null)}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>{modal==="create"?"Create Area":"Save Changes"}</Btn>
      </div>
    </Modal>}
  </div>;
}

// LOGIN
function LoginScreen({company_settings,loginForm,setLoginForm,loginError,onLogin}){
  return <div className="lewa-login-screen" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",background:"#F5F5F7",padding:24}}>
    <div className="lewa-login-card" style={{width:"100%",maxWidth:420,background:"#FFFFFF",border:"1px solid #E5E5E5",borderRadius:16,boxShadow:"0 16px 45px rgba(15,110,86,0.10)",padding:30}}>
      <div className="lewa-login-brand" style={{display:"flex",alignItems:"center",gap:14,marginBottom:26}}>
        <div className="lewa-login-logo" style={{width:64,height:64,borderRadius:18,background:"#F5F5F7",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"1px solid #E5E5E5",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",flexShrink:0}}>
          <img src={company_settings.company_logo_url||DEFAULT_LOGO} alt="Al Lewa General Trading LLC" style={{width:"100%",height:"100%",objectFit:"contain"}} />
        </div>
        <div>
          <div className="lewa-login-company" style={{fontSize:17,fontWeight:700,color:"#1F1F1F"}}>{company_settings.company_name}</div>
          <div className="lewa-login-subtitle" style={{fontSize:12,color:"#777777",marginTop:4}}>{company_settings.company_subtitle}</div>
        </div>
      </div>
      <form onSubmit={onLogin}>
        <div style={{fontSize:20,fontWeight:700,color:"#1F1F1F",marginBottom:6}}>Sign in</div>
        <div style={{fontSize:13,color:"#777777",marginBottom:20}}>Use your Al Lewa General Trading LLC ERP username and password.</div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,fontWeight:700,color:"#666666",display:"block",marginBottom:6}}>Username</label>
          <Input value={loginForm.username} onChange={v=>setLoginForm(f=>({...f,username:v}))} placeholder="admin" />
        </div>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,fontWeight:700,color:"#666666",display:"block",marginBottom:6}}>Password</label>
          <Input value={loginForm.password} onChange={v=>setLoginForm(f=>({...f,password:v}))} placeholder="admin123" type="password" />
        </div>
        {loginError&&<div style={{background:"#FEF2F2",border:"1px solid #E8B8B8",color:"#C74C51",borderRadius:8,padding:"10px 12px",fontSize:13,marginBottom:16}}>{loginError}</div>}
        <Btn variant="primary" size="lg" style={{width:"100%",justifyContent:"center"}}>Login</Btn>
      </form>
      {DEMO_MODE&&<div style={{marginTop:18,background:"#F9F9F9",border:"1px solid #E8E8E8",borderRadius:12,padding:14}}>
        <div style={{fontSize:12,fontWeight:700,color:"#999999",marginBottom:8}}>Demo users</div>
        <div style={{fontSize:12,color:"#666666",lineHeight:1.7}}>admin / admin123<br/>ashik / ashik123<br/>anees / anees123</div>
      </div>}
    </div>
  </div>;
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("Dashboard");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [currentUser,setCurrentUser]=useState(MOCK_USER);
  const [loginAs,setLoginAs]=useState("Admin");
  const [authenticated,setAuthenticated]=useState(false);
  const [loginForm,setLoginForm]=useState({username:"",password:""});
  const [loginError,setLoginError]=useState("");
  const [currentUsername,setCurrentUsername]=useState("");
  const [passwords,setPasswords]=useState({admin:"admin123",ashik:"ashik123",anees:"anees123"});
  const [userPasswords,setUserPasswords]=useState({admin:"admin123",ashik:"ashik123",anees:"anees123"});
  const [showPasswordModal,setShowPasswordModal]=useState(false);
  const [passwordForm,setPasswordForm]=useState({current:"",newPass:"",confirm:""});
  const [isOnline,setIsOnline]=useState(()=>typeof navigator==="undefined"?true:navigator.onLine);
  const [installPrompt,setInstallPrompt]=useState(null);
  const [newVersionAvailable,setNewVersionAvailable]=useState(false);
  const [updateSW,setUpdateSW]=useState(null);
  const [isStandalone,setIsStandalone]=useState(()=>typeof window!=="undefined"&&(window.matchMedia?.("(display-mode: standalone)")?.matches||window.navigator.standalone));

  // State
  const [areas,setAreas]=useState(MOCK_AREAS);
  const [shops,setShops]=useState(MOCK_SHOPS);
  const [profiles,setProfiles]=useState(MOCK_PROFILES);
  const [attendance,setAttendance]=useState(MOCK_ATTENDANCE);
  const [visits,setVisits]=useState(MOCK_VISITS);
  const [deliveries,setDeliveries]=useState(MOCK_DELIVERIES);
  const [lpos,setLpos]=useState(MOCK_LPOS);
  const [scores,setScores]=useState(MOCK_SCORES);
  const [notifications,setNotifications]=useState(MOCK_NOTIFICATIONS);
  const [authorizations,setAuthorizations]=useState(MOCK_AUTHORIZATIONS);
  const [backup_logs,setBackupLogs]=useState(MOCK_BACKUP_LOGS);
  const [login_sessions,setLoginSessions]=useState(MOCK_LOGIN_SESSIONS);
  const [company_settings,setCompanySettings]=useState(MOCK_COMPANY_SETTINGS);
  const [products,setProducts]=useState(MOCK_PRODUCTS);
  const [memo_documents,setMemoDocuments]=useState(MOCK_MEMO_DOCUMENTS);
  const [score_proofs,setScoreProofs]=useState(MOCK_SCORE_PROOFS);

  useEffect(()=>{
    const refreshSW=registerSW({
      onNeedRefresh(){
        setNewVersionAvailable(true);
      },
      onOfflineReady(){
        console.info("LEWA ERP is ready for offline static assets.");
      }
    });
    setUpdateSW(()=>refreshSW);
  },[]);

  useEffect(()=>{
    const updateOnline=()=>setIsOnline(navigator.onLine);
    window.addEventListener("online",updateOnline);
    window.addEventListener("offline",updateOnline);
    updateOnline();
    return()=>{
      window.removeEventListener("online",updateOnline);
      window.removeEventListener("offline",updateOnline);
    };
  },[]);

  useEffect(()=>{
    const onBeforeInstallPrompt=e=>{
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onInstalled=()=>{
      setInstallPrompt(null);
      setIsStandalone(true);
    };
    window.addEventListener("beforeinstallprompt",onBeforeInstallPrompt);
    window.addEventListener("appinstalled",onInstalled);
    return()=>{
      window.removeEventListener("beforeinstallprompt",onBeforeInstallPrompt);
      window.removeEventListener("appinstalled",onInstalled);
    };
  },[]);

  useEffect(()=>{
    const collapseForMobile=()=>{
      if(window.innerWidth<=820)setSidebarOpen(false);
    };
    collapseForMobile();
    window.addEventListener("resize",collapseForMobile);
    return()=>window.removeEventListener("resize",collapseForMobile);
  },[]);

  const unread=notifications.filter(n=>!n.is_read&&(n.user_id===currentUser.id||["Admin","MD"].includes(currentUser.role))).length;

  const navItems=NAV_ITEMS[currentUser.role]||NAV_ITEMS["Admin"];
  const canEdit=["Admin"].includes(currentUser.role);
  const canApprove=["Admin","MD","Chief Manager","Monitoring Manager"].includes(currentUser.role);

  const switchUser=(role)=>{
    const p=profiles.find(x=>x.role===role)||profiles[0];
    setCurrentUser(p);
    setPage("Dashboard");
    setLoginAs(role);
  };

  const handleLogin=(e)=>{
    e.preventDefault();
    const username=(loginForm.username||"").trim().toLowerCase();
    const password=loginForm.password||"";
    const known=AUTH_CREDENTIALS[username];
    const profile=known
      ? profiles.find(p=>p.id===known.user_id)
      : profiles.find(p=>(p.username||"").toLowerCase()===username);
    const expected=userPasswords[username]||known?.password;
    if(!profile||profile.status==="Inactive"||password!==expected){
      setLoginError("Invalid username or password.");
      return;
    }
    const session={id:`sess-${Date.now()}`,session_token:`sess-${Date.now()}`,user_id:profile.id,device_type:"Desktop",device_name:"Current Browser",device_os:navigator.platform||"Browser",ip_address:"Demo",login_at:new Date().toISOString(),last_seen:new Date().toISOString(),logout_at:null,active:true,created_at:new Date().toISOString()};
    setCurrentUser(profile);
    setLoginAs(profile.role);
    setCurrentUsername(username);
    setLoginSessions(prev=>[session,...prev]);
    setAuthenticated(true);
    setLoginError("");
    setLoginForm({username:"",password:""});
    setPage("Dashboard");
  };

  const handleLogout=()=>{
    setLoginSessions(prev=>prev.map(s=>s.user_id===currentUser.id&&s.active?{...s,active:false,logout_at:new Date().toISOString(),last_seen:new Date().toISOString()}:s));
    setAuthenticated(false);
    setCurrentUsername("");
    setLoginForm({username:"",password:""});
    setPage("Dashboard");
  };

  const changePassword=()=>{
    const current=userPasswords[currentUsername]||AUTH_CREDENTIALS[currentUsername]?.password;
    if(!currentUsername||passwordForm.current!==current){
      alert("Current password is incorrect.");
      return;
    }
    if(!passwordForm.newPass||passwordForm.newPass.length<4||passwordForm.newPass!==passwordForm.confirm){
      alert("New password must match and be at least 4 characters.");
      return;
    }
    setUserPasswords(prev=>({...prev,[currentUsername]:passwordForm.newPass}));
    setPasswordForm({current:"",newPass:"",confirm:""});
    setShowPasswordModal(false);
    alert("Password updated for this demo session.");
  };

  const handleInstallApp=async()=>{
    if(isStandalone){
      alert("LEWA ERP is already installed on this device.");
      return;
    }
    if(installPrompt){
      await installPrompt.prompt();
      const choice=await installPrompt.userChoice;
      if(choice.outcome==="accepted"){
        setInstallPrompt(null);
      }
      return;
    }
    alert("To install on iPhone or iPad, open Safari Share and choose Add to Home Screen. On desktop or Android Chrome, use the browser install option.");
  };

  const selectPage=(item)=>{
    setPage(item);
    if(typeof window!=="undefined"&&window.innerWidth<768){
      setSidebarOpen(false);
    }
  };

  const sharedProps={user:currentUser,areas,setAreas,shops,setShops,profiles,setProfiles,attendance,setAttendance,visits,setVisits,deliveries,setDeliveries,lpos,setLpos,scores,setScores,notifications,setNotifications,authorizations,setAuthorizations,backup_logs,setBackupLogs,login_sessions,setLoginSessions,company_settings,setCompanySettings,products,setProducts,memo_documents,setMemoDocuments,score_proofs,setScoreProofs,canEdit,canApprove,setPage};

  const pwaProps={onInstallApp:handleInstallApp,canInstallApp:!!installPrompt,isStandalone};

  const pageMap={
    "Dashboard":<Dashboard {...sharedProps}/>,
    "Users & Authorization":<UsersPage {...sharedProps}/>,
    "Authorizations":<AuthorizationsPage {...sharedProps}/>,
    "Session Tracker":<SessionsPage {...sharedProps}/>,
    "Shops & Locations":<ShopsPage {...sharedProps}/>,
    "Geographic Areas":<AreasPage {...sharedProps}/>,
    "Product Master":<ProductMasterPage {...sharedProps}/>,
    "Attendance":<AttendancePage {...sharedProps}/>,
    "Merchandiser Visits":<VisitsPage {...sharedProps}/>,
    "Delivery Tracking":<DeliveriesPage {...sharedProps}/>,
    "LPO Management":<LPOPage {...sharedProps}/>,
    "Sales Orders":<LPOPage {...sharedProps}/>,
    "Daily Scores":<ScoresPage {...sharedProps}/>,
    "Backup Logs":<BackupLogsPage {...sharedProps}/>,
    "Memo/Documents":<MemoDocumentsPage {...sharedProps}/>,
    "Reports":<ReportsPage {...sharedProps}/>,
    "Rankings":<RankingsPage {...sharedProps}/>,
    "Areas":<AreasPage {...sharedProps}/>,
    "Sessions":<SessionsPage {...sharedProps}/>,
    "Notifications":<NotificationsPage {...sharedProps}/>,
    "Settings":<SettingsPage {...sharedProps} {...pwaProps}/>,
  };

  const globalPwaStyles=<style>{`
    .mobile-button-icon { display: none; }
    .lewa-sidebar-scrim { display: none; }
    @media (max-width: 760px), (pointer: coarse) {
      button, input, select { min-height: 44px; }
    }
    @media (max-width: 767px) {
      html, body, #root {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }
      .lewa-login-screen {
        padding: 16px !important;
        align-items: center !important;
        overflow-x: hidden !important;
      }
      .lewa-login-card {
        max-width: none !important;
        width: 100% !important;
        padding: 24px 18px !important;
        border-radius: 14px !important;
        box-sizing: border-box !important;
      }
      .lewa-login-brand {
        flex-direction: column !important;
        justify-content: center !important;
        text-align: center !important;
        gap: 10px !important;
        margin-bottom: 24px !important;
      }
      .lewa-login-logo {
        width: 72px !important;
        height: 72px !important;
        border-radius: 18px !important;
      }
      .lewa-login-company {
        font-size: 20px !important;
        line-height: 1.2 !important;
      }
      .lewa-login-subtitle {
        font-size: 15px !important;
      }
      .lewa-login-card input {
        width: 100% !important;
        min-height: 48px !important;
        font-size: 15px !important;
        box-sizing: border-box !important;
      }
      .lewa-login-card button {
        min-height: 48px !important;
        font-size: 15px !important;
      }
      .lewa-app-shell {
        width: 100vw !important;
        overflow-x: hidden !important;
      }
      .lewa-sidebar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: min(82vw, 300px) !important;
        z-index: 300 !important;
        transform: translateX(-105%) !important;
        transition: transform 0.22s ease !important;
        box-shadow: 12px 0 30px rgba(0,0,0,0.18) !important;
      }
      .lewa-sidebar.is-open {
        transform: translateX(0) !important;
      }
      .lewa-sidebar-scrim {
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        background: rgba(0,0,0,0.32) !important;
        z-index: 250 !important;
      }
      .lewa-main-shell {
        width: 100vw !important;
        min-width: 0 !important;
      }
      .lewa-mobile-menu-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 44px !important;
        height: 44px !important;
        flex-shrink: 0 !important;
      }
      .lewa-topbar {
        height: 56px !important;
        min-height: 56px !important;
        padding: 0 8px !important;
        gap: 6px !important;
        overflow: hidden !important;
      }
      .lewa-topbar-brand {
        gap: 8px !important;
        min-width: 0 !important;
        flex: 1 1 auto !important;
      }
      .lewa-topbar-logo {
        width: 36px !important;
        height: 36px !important;
        border-radius: 10px !important;
      }
      .lewa-topbar-company {
        font-size: 13px !important;
        max-width: 128px !important;
        line-height: 1.15 !important;
      }
      .lewa-topbar-subtitle,
      .lewa-topbar-page-title {
        display: none !important;
      }
      .lewa-topbar-actions {
        gap: 4px !important;
        flex-wrap: nowrap !important;
        flex: 0 0 auto !important;
      }
      .lewa-demo-badge {
        font-size: 10px !important;
        padding: 4px 7px !important;
        border-radius: 999px !important;
        white-space: nowrap !important;
      }
      .lewa-icon-button,
      .lewa-topbar-actions button {
        width: 38px !important;
        min-width: 38px !important;
        height: 38px !important;
        min-height: 38px !important;
        padding: 0 !important;
        justify-content: center !important;
        border-radius: 10px !important;
      }
      .lewa-notification-button span:first-child {
        font-size: 19px !important;
      }
      .desktop-button-text {
        display: none !important;
      }
      .mobile-button-icon {
        display: inline !important;
        font-size: 17px !important;
        line-height: 1 !important;
      }
      .lewa-page-content {
        max-width: none !important;
        width: 100vw !important;
        padding: 16px 12px 24px !important;
        margin: 0 !important;
        overflow-x: hidden !important;
      }
      .lewa-page-header {
        margin-bottom: 16px !important;
        gap: 8px !important;
      }
      .lewa-page-header h1 {
        font-size: 26px !important;
        line-height: 1.18 !important;
        word-break: normal !important;
        overflow-wrap: break-word !important;
      }
      .lewa-page-header p {
        font-size: 15px !important;
        line-height: 1.35 !important;
      }
      .lewa-card {
        padding: 16px !important;
        border-radius: 12px !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .lewa-stat-card {
        padding: 14px 12px !important;
        border-radius: 12px !important;
        min-width: 0 !important;
      }
      .lewa-stat-card > div:first-child {
        font-size: 10px !important;
        letter-spacing: 0.08em !important;
        line-height: 1.2 !important;
      }
      .lewa-stat-card > div:nth-child(2) {
        font-size: 24px !important;
      }
      .lewa-page-content > div > div[style*="grid-template-columns"] {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }
      .lewa-page-content > div > div[style*="grid-template-columns: 1fr 1fr"] {
        grid-template-columns: 1fr !important;
      }
      .lewa-table-wrap {
        overflow-x: visible !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      .lewa-table-wrap table,
      .lewa-table-wrap thead,
      .lewa-table-wrap tbody,
      .lewa-table-wrap tr,
      .lewa-table-wrap th,
      .lewa-table-wrap td {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .lewa-table-wrap table {
        min-width: 0 !important;
        border-spacing: 0 !important;
      }
      .lewa-table-wrap thead {
        display: none !important;
      }
      .lewa-table-wrap tr {
        background: #FFFFFF !important;
        border: 1px solid #E8E8E8 !important;
        border-radius: 12px !important;
        margin-bottom: 12px !important;
        padding: 10px !important;
        box-shadow: 0 6px 18px rgba(15,110,86,0.06) !important;
      }
      .lewa-table-wrap td {
        padding: 8px 4px !important;
        white-space: normal !important;
        font-size: 15px !important;
        line-height: 1.35 !important;
        border-bottom: 1px solid #F0F0F0 !important;
      }
      .lewa-table-wrap td::before {
        content: attr(data-label);
        display: block;
        color: #888888;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .lewa-table-wrap td:last-child {
        border-bottom: 0 !important;
      }
      .lewa-page-content div,
      .lewa-page-content span,
      .lewa-page-content p,
      .lewa-page-content td {
        max-width: 100%;
      }
    }
  `}</style>;

  const systemBanners=<>
    {!isOnline&&<div style={{position:"fixed",top:0,left:0,right:0,zIndex:500,background:"#C74C51",color:"#FFFFFF",padding:"10px 16px",textAlign:"center",fontSize:13,fontWeight:700,boxShadow:"0 4px 14px rgba(0,0,0,0.16)"}}>
      Offline Mode - static ERP screens are available, Supabase synchronization will resume when internet returns.
    </div>}
    {newVersionAvailable&&<div style={{position:"fixed",top:isOnline?0:42,left:0,right:0,zIndex:501,background:"#0B6B2E",color:"#FFFFFF",padding:"9px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap",fontSize:13,fontWeight:700,boxShadow:"0 4px 14px rgba(0,0,0,0.16)"}}>
      <span>New Version Available</span>
      <button onClick={()=>updateSW?.(true)} style={{border:"1px solid rgba(255,255,255,0.65)",background:"#FFFFFF",color:"#0B6B2E",borderRadius:8,padding:"6px 12px",fontWeight:700,cursor:"pointer"}}>Update Now</button>
      <button onClick={()=>setNewVersionAvailable(false)} style={{border:"none",background:"transparent",color:"#FFFFFF",fontWeight:700,cursor:"pointer",padding:"6px 8px"}}>Dismiss</button>
    </div>}
  </>;

  if(!authenticated){
    return <>
      {globalPwaStyles}
      {systemBanners}
      <LoginScreen company_settings={company_settings} loginForm={loginForm} setLoginForm={setLoginForm} loginError={loginError} onLogin={handleLogin}/>
    </>;
  }

  return(
    <div className="lewa-app-shell" style={{display:"flex",height:"100vh",fontFamily:"'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",background:"#F5F5F7",overflow:"hidden"}}>
      {globalPwaStyles}
      {systemBanners}
      {sidebarOpen&&<div className="lewa-sidebar-scrim" onClick={()=>setSidebarOpen(false)} />}
      {/* SIDEBAR */}
      <div className={`lewa-sidebar ${sidebarOpen?"is-open":"is-closed"}`} style={{width:sidebarOpen?240:62,flexShrink:0,background:"#FFFFFF",borderRight:"1px solid #E5E5E5",display:"flex",flexDirection:"column",transition:"width 0.2s ease",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{padding:"18px 16px",borderBottom:"1px solid #E5E5E5",display:"flex",alignItems:"center",gap:14,minWidth:240}}>
          <div style={{width:50,height:50,borderRadius:14,background:"#F5F5F7",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"1px solid #E5E5E5",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",flexShrink:0}}>
            <img src={company_settings.company_logo_url||DEFAULT_LOGO} alt="Al Lewa General Trading LLC" style={{width:"100%",height:"100%",objectFit:"contain"}} />
          </div>
          {sidebarOpen&&<div style={{minWidth:0}}><div style={{fontWeight:"700",fontSize:"14px",color:"#1F1F1F",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{company_settings.company_name}</div><div style={{fontSize:"10px",color:"#777777",letterSpacing:"0.06em",marginTop:2}}>{company_settings.company_subtitle}</div></div>}
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#999999",fontSize:"18px",padding:"6px",flexShrink:0,transition:"color 0.2s"}}>☰</button>
        </div>

        {/* Role switcher (demo only) */}
        {sidebarOpen&&DEMO_MODE&&<div style={{padding:"10px 12px",borderBottom:"1px solid #E5E5E5",background:"#F9F9F9"}}>
          <div style={{fontSize:"10px",color:"#999999",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:"600"}}>Preview as</div>
          <select value={loginAs} onChange={e=>switchUser(e.target.value)} style={{width:"100%",padding:"7px 10px",border:"1px solid #D5D5D5",borderRadius:6,background:"#FFFFFF",color:"#1F1F1F",fontSize:"12px",fontWeight:"500",cursor:"pointer"}}>
            {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>}

        <nav style={{flex:1,overflowY:"auto",padding:"10px 8px"}}>
          {navItems.map(item=>(
            <button key={item} onClick={()=>selectPage(item)}
              style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 10px",borderRadius:8,border:"none",cursor:"pointer",background:page===item?"#E8F5F1":"transparent",color:page===item?"#0F6E56":"#666666",fontWeight:page===item?"600":"500",fontSize:"13px",textAlign:"left",whiteSpace:"nowrap",position:"relative",transition:"all 0.2s"}}>
              <span style={{flexShrink:0,fontSize:"16px"}}>
                {{"Dashboard":"🏠","Users":"👥","Authorizations":"✅","Session Tracker":"🔐","Geographic Areas":"🗺️","Shops":"🏪","Areas":"📍","Attendance":"📋","Visits":"🚶","My Visits":"🚶","Deliveries":"🚛","My Deliveries":"🚛","LPO":"📄","Sales Orders":"💼","My Shops":"🏪","Scores":"⭐","Rankings":"🏆","Reports":"📊","Notifications":"🔔","Settings":"⚙️"}[item]||MODULE_ICONS[item]||"•"}
              </span>
              {sidebarOpen&&<span style={{flex:1}}>{item}{item==="Notifications"&&unread>0&&<span style={{marginLeft:8,background:"#C74C51",color:"#FFFFFF",borderRadius:12,padding:"2px 8px",fontSize:"10px",fontWeight:"600"}}>{unread}</span>}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen&&<div style={{padding:"12px 14px",borderTop:"1px solid #E5E5E5",background:"#F9F9F9"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar name={currentUser.full_name} role={currentUser.role} size={36}/>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:"12px",fontWeight:"600",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#1F1F1F"}}>{currentUser.full_name}</div>
              <div style={{fontSize:"11px",color:"#999999"}}><Badge label={currentUser.role}/></div>
            </div>
          </div>
        </div>}
      </div>

      {/* MAIN */}
      <div className="lewa-main-shell" style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",background:"#F5F5F7"}}>
        {/* TOPBAR */}
        <div className="lewa-topbar" style={{height:84,borderBottom:"1px solid #E5E5E5",background:"#FFFFFF",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0,boxShadow:"0 2px 6px rgba(0,0,0,0.08)"}}>
          <button className="lewa-mobile-menu-btn" onClick={()=>setSidebarOpen(true)} style={{display:"none",background:"transparent",border:"none",fontSize:24,color:"#0F6E56",cursor:"pointer",padding:"6px 8px"}}>☰</button>
          <div className="lewa-topbar-brand" style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:0}}>
            <div className="lewa-topbar-logo" style={{width:54,height:54,display:"flex",alignItems:"center",justifyContent:"center",background:"#F5F5F7",borderRadius:16,overflow:"hidden",border:"1px solid #E5E5E5",flexShrink:0}}>
              <img src={company_settings.company_logo_url||DEFAULT_LOGO} alt="Al Lewa General Trading LLC" style={{width:"100%",height:"100%",objectFit:"contain"}} />
            </div>
            <div style={{display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
              <span className="lewa-topbar-company" style={{fontSize:"15px",fontWeight:"700",color:"#1F1F1F",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{company_settings.company_name}</span>
              <span className="lewa-topbar-subtitle" style={{fontSize:"12px",color:"#666666",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{company_settings.company_subtitle}</span>
            </div>
          </div>
          <div className="lewa-topbar-actions" style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <div className="lewa-topbar-page-title" style={{textAlign:"right"}}>
              <div style={{fontSize:"18px",fontWeight:"700",color:"#1F1F1F"}}>{page}</div>
              <div style={{fontSize:"12px",color:"#888888"}}>Enterprise ERP dashboard</div>
            </div>
            {DEMO_MODE&&<span className="lewa-demo-badge" style={{fontSize:"11px",background:"#FEF9E7",color:"#A68A2F",padding:"8px 12px",borderRadius:20,fontWeight:"600",border:"1px solid #E8D8A8"}}>Demo Mode</span>}
            <button className="lewa-icon-button lewa-notification-button" onClick={()=>selectPage("Notifications")} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:"8px",transition:"opacity 0.2s"}}>
              <span style={{fontSize:"22px"}}>🔔</span>
              {unread>0&&<span style={{position:"absolute",top:2,right:2,background:"#C74C51",color:"#FFFFFF",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:"600"}}>{unread}</span>}
            </button>
            <Btn size="sm" variant="ghost" onClick={()=>setShowPasswordModal(true)} style={{minWidth:44,justifyContent:"center"}}><span className="desktop-button-text">Password</span><span className="mobile-button-icon">⚙️</span></Btn>
            <Btn size="sm" variant="danger" onClick={handleLogout} style={{minWidth:44,justifyContent:"center"}}><span className="desktop-button-text">Logout</span><span className="mobile-button-icon">⏻</span></Btn>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="lewa-page-content" style={{flex:1,padding:"2rem 2rem",maxWidth:"1400px",width:"100%",margin:"0 auto",boxSizing:"border-box",overflowY:"auto"}}>
          {pageMap[page]||<div><p style={{color:"#999999"}}>Page not found.</p></div>}
        </div>
      </div>
      {showPasswordModal&&<Modal title="Change Password" onClose={()=>setShowPasswordModal(false)} width={420}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Current password</label>
          <Input value={passwordForm.current} onChange={v=>setPasswordForm(f=>({...f,current:v}))} type="password"/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>New password</label>
          <Input value={passwordForm.newPass} onChange={v=>setPasswordForm(f=>({...f,newPass:v}))} type="password"/>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:"12px",fontWeight:"600",color:"#666666",display:"block",marginBottom:6}}>Confirm new password</label>
          <Input value={passwordForm.confirm} onChange={v=>setPasswordForm(f=>({...f,confirm:v}))} type="password"/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:16,borderTop:"1px solid #E5E5E5"}}>
          <Btn onClick={()=>setShowPasswordModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={changePassword}>Update Password</Btn>
        </div>
      </Modal>}
    </div>
  );
}
