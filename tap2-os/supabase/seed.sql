-- ============================================================
-- Tap2 OS — Seed Data
-- Run after migrations to populate reference tables and mock data
-- ============================================================

-- ============================================================
-- PARTNERS
-- ============================================================
insert into partners (name, role, country_focus, language, active) values
  ('Giuseppe',      'Founder & CEO',      'Netherlands',        'NL/EN', true),
  ('Dorian',        'Sales',              'Netherlands',        'NL/EN', true),
  ('Joaquin',       'Sales - Spain',      'Spain',              'ES/EN', true),
  ('Jonathan',      'Sales - Colombia',   'Colombia',           'ES/EN', true),
  ('Carlo',         'Sales - Italy',      'Italy / Netherlands','IT/EN', true),
  ('Niels',         'Sales',              'Netherlands',        'NL/EN', true),
  ('Qubico Studio', 'Agency Partner',     'Netherlands',        'NL/EN', true),
  ('Other',         'Other',              null,                 null,    true)
on conflict (name) do nothing;

-- ============================================================
-- GTM SOURCES
-- ============================================================
insert into gtm_sources (name, category) values
  ('Horecava',          'Event'),
  ('HIP Spain',         'Event'),
  ('Cold Email',        'Outbound'),
  ('Cold Calling',      'Outbound'),
  ('LinkedIn',          'Outbound'),
  ('CitySales',         'Partner'),
  ('OptiDist',          'Partner'),
  ('Qubico Studio',     'Partner'),
  ('Referral',          'Inbound'),
  ('Website',           'Inbound'),
  ('Marketing Agency',  'Paid'),
  ('Colombia',          'Market'),
  ('Italy Outbound',    'Outbound'),
  ('Spain Outbound',    'Outbound'),
  ('Other',             'Other')
on conflict (name) do nothing;

-- ============================================================
-- CUSTOMERS (mock — 15 clients)
-- ============================================================
insert into customers (name, country, city, industry, source, partner_owner, status, current_mrr, start_date) values
  ('De Groenhoek',              'NL', 'Amsterdam',    'Restaurant', 'Horecava',      'Giuseppe',     'active',  89, '2025-01-15'),
  ('Vega Kitchen Amsterdam',    'NL', 'Amsterdam',    'Restaurant', 'Cold Calling',  'Dorian',       'active',  89, '2025-02-01'),
  ('El Vergel Madrid',          'ES', 'Madrid',       'Restaurant', 'HIP Spain',     'Joaquin',      'active',  49, '2025-03-10'),
  ('Roots & Co',                'NL', 'Utrecht',      'Restaurant', 'Referral',      'Giuseppe',     'active',  89, '2025-01-20'),
  ('Green Elephant',            'NL', 'Den Haag',     'Restaurant', 'LinkedIn',      'Niels',        'trial',   49, '2025-11-01'),
  ('La Floresta Barcelona',     'ES', 'Barcelona',    'Restaurant', 'HIP Spain',     'Joaquin',      'active',  49, '2025-04-05'),
  ('Plantiful Haarlem',         'NL', 'Haarlem',      'Restaurant', 'Cold Email',    'Carlo',        'active',  89, '2025-02-14'),
  ('Bio Bistro Utrecht',        'NL', 'Utrecht',      'Restaurant', 'Horecava',      'Giuseppe',     'active',  89, '2025-03-22'),
  ('Madre Tierra Bogotá',       'CO', 'Bogotá',       'Restaurant', 'Colombia',      'Jonathan',     'active',  29, '2025-05-01'),
  ('Naturverde Milan',          'IT', 'Milan',        'Restaurant', 'Italy Outbound','Carlo',        'active',  49, '2025-06-01'),
  ('The Sprout Rotterdam',      'NL', 'Rotterdam',    'Restaurant', 'Cold Calling',  'Dorian',       'active',  89, '2025-04-18'),
  ('Vegano Valencia',           'ES', 'Valencia',     'Restaurant', 'HIP Spain',     'Joaquin',      'churned', 49, '2025-02-01'),
  ('Conscious Kitchen Den Haag','NL', 'Den Haag',     'Restaurant', 'LinkedIn',      'Niels',        'active',  89, '2025-07-10'),
  ('Pura Vida Medellín',        'CO', 'Medellín',     'Restaurant', 'Colombia',      'Jonathan',     'active',  29, '2025-08-01'),
  ('Qubico Demo Client',        'NL', 'Amsterdam',    'Restaurant', 'Qubico Studio', 'Qubico Studio','trial',   89, '2025-11-15')
on conflict do nothing;

-- ============================================================
-- DEALS (mock pipeline — 20 deals)
-- ============================================================
insert into deals (company_name, deal_name, stage, value, expected_mrr, probability, source, partner_owner, close_date) values
  ('Groene Tafel Amsterdam',  'Loyalty Wallet - Basic',    'Lead',           1068,  89, 10, 'Cold Email',    'Carlo',         '2026-01-15'),
  ('Sabor Natural Seville',   'Loyalty Wallet - Spain',    'Contacted',       588,  49, 20, 'HIP Spain',     'Joaquin',       '2026-01-10'),
  ('Plant Base Rotterdam',    'Wallet + Email',             'Meeting Booked', 1068,  89, 35, 'LinkedIn',      'Niels',         '2026-01-20'),
  ('Biocenter Antwerp',       'Loyalty Wallet - Basic',    'Demo Completed', 1068,  89, 50, 'Cold Calling',  'Dorian',        '2026-02-01'),
  ('EcoEat Bogotá',           'Colombia Plan',             'Proposal Sent',   348,  29, 65, 'Colombia',      'Jonathan',      '2025-12-28'),
  ('Madre Natura Torino',     'Italy Standard',            'Trial Started',   588,  49, 75, 'Italy Outbound','Carlo',         '2025-12-20'),
  ('Green Garden Den Haag',   'Wallet + Winback',          'Negotiation',    1068,  89, 85, 'Horecava',      'Giuseppe',      '2025-12-15'),
  ('Veggie World Leiden',     'Loyalty Wallet',            'Lead',           1068,  89, 10, 'Cold Calling',  'Dorian',        '2026-02-15'),
  ('Organic Hub Madrid',      'Spain Basic',               'Meeting Booked',  588,  49, 35, 'Spain Outbound','Joaquin',       '2026-01-25'),
  ('The Plant Bar Utrecht',   'Full Suite',                'Contacted',      1068,  89, 20, 'Website',       'Giuseppe',      '2026-02-10'),
  ('Floresta Viva Lisbon',    'Wallet Basic',              'Demo Completed',  588,  49, 50, 'Referral',      'Giuseppe',      '2026-01-18'),
  ('Kale & Roots Eindhoven',  'Loyalty + Notifications',  'Proposal Sent',  1068,  89, 65, 'LinkedIn',      'Niels',         '2025-12-30'),
  ('Qubico Restaurant Group', 'Agency White Label',        'Trial Started',  2136, 178, 75, 'Qubico Studio', 'Qubico Studio', '2025-12-22'),
  ('Vegano Milano',           'Italy Standard',            'Lead',            588,  49, 10, 'Italy Outbound','Carlo',         '2026-02-20'),
  ('Broccoli Bar Groningen',  'Wallet Basic',              'Contacted',      1068,  89, 20, 'Cold Email',    'Carlo',         '2026-02-05'),
  ('CitySales Demo NL',       'CitySales Bundle',          'Meeting Booked', 2136, 178, 35, 'CitySales',     'Giuseppe',      '2026-01-30'),
  ('Naturaleza Cali',         'Colombia Starter',          'Lead',            348,  29, 10, 'Colombia',      'Jonathan',      '2026-02-28'),
  ('The Herbivore Brussels',  'Wallet Pro',                'Demo Completed', 1068,  89, 50, 'Cold Email',    'Dorian',        '2026-01-28'),
  ('Verde Gourmet Barcelona', 'Spain Standard',            'Negotiation',     588,  49, 85, 'HIP Spain',     'Joaquin',       '2025-12-18'),
  ('OptiDist Partner',        'Distribution Deal',         'Proposal Sent',  3204, 267, 65, 'OptiDist',      'Giuseppe',      '2026-01-08')
on conflict do nothing;

-- ============================================================
-- OUTBOUND CAMPAIGNS (mock)
-- ============================================================
insert into outbound_campaigns (name, market, segment, owner, status, emails_sent, open_rate, reply_rate, positive_reply_rate, meetings_booked, demos_completed, deals_created, pipeline_generated, mrr_closed) values
  ('NL Restaurant Owners Q4 2025', 'Netherlands', 'Independent Restaurant', 'Carlo',   'active',    480, 38.5, 8.1, 3.8, 14, 10, 7, 7560,  356),
  ('Spain Vegan Restaurants 2025', 'Spain',       'Independent Restaurant', 'Joaquin', 'active',    320, 34.2, 6.9, 3.1,  9,  6, 4, 3528,  196),
  ('Colombia Pilot 2025',          'Colombia',    'Independent Restaurant', 'Jonathan','completed', 180, 29.4, 5.6, 2.2,  4,  3, 2, 1392,   58),
  ('Italy Outbound Q4 2025',       'Italy',       'Independent Restaurant', 'Carlo',   'active',    240, 36.8, 7.2, 3.3,  7,  5, 3, 2646,  147),
  ('LinkedIn NL Decision Makers',  'Netherlands', 'Chain / Group',          'Niels',   'paused',    156, 42.3, 9.6, 4.5,  6,  4, 3, 6372,  267)
on conflict do nothing;

-- ============================================================
-- CASH SNAPSHOTS (last 12 months)
-- ============================================================
insert into cash_snapshots (snapshot_date, bank_balance, monthly_burn, runway_months, accounts_receivable, outstanding_invoices) values
  ('2025-01-31', 52000, 6800, 7.6,  400,  0),
  ('2025-02-28', 47100, 7100, 6.6,  430,  0),
  ('2025-03-31', 41720, 7200, 5.8,  460,  0),
  ('2025-04-30', 35980, 7400, 4.9,  490,  0),
  ('2025-05-31', 30200, 7600, 4.0,  510,  0),
  ('2025-06-30', 24200, 7800, 3.1,  540,  0),
  ('2025-07-31', 17420, 7900, 2.2,  560,  0),
  ('2025-08-31', 10580, 8000, 1.3,  580,  0),
  ('2025-09-30', 38500, 8100, 4.7,  610, 890),
  ('2025-10-31', 31630, 8100, 3.9,  640, 890),
  ('2025-11-30', 24490, 8200, 3.0,  670, 890),
  ('2025-12-31', 38500, 8200, 4.7,  700, 890)
on conflict (snapshot_date) do nothing;

-- ============================================================
-- PRODUCT METRICS (last 12 months)
-- ============================================================
insert into product_metrics (date, active_clients, active_wallets, wallet_installs, active_cards, notifications_sent, scans, redemptions) values
  ('2025-01-01', 18,  820, 1100, 1800,  7200, 3400,  820),
  ('2025-02-01', 20,  920, 1240, 2050,  8100, 3900,  940),
  ('2025-03-01', 22, 1020, 1380, 2300,  9400, 4400, 1060),
  ('2025-04-01', 24, 1120, 1520, 2600, 10500, 5000, 1200),
  ('2025-05-01', 25, 1180, 1620, 2800, 11400, 5400, 1280),
  ('2025-06-01', 26, 1280, 1740, 3050, 12600, 5900, 1400),
  ('2025-07-01', 28, 1380, 1880, 3300, 13800, 6400, 1520),
  ('2025-08-01', 29, 1480, 2000, 3560, 14900, 6900, 1640),
  ('2025-09-01', 30, 1580, 2140, 3780, 16000, 7400, 1760),
  ('2025-10-01', 31, 1660, 2240, 3960, 16900, 7900, 1880),
  ('2025-11-01', 32, 1760, 2340, 4100, 17800, 8400, 2000),
  ('2025-12-01', 32, 1850, 2420, 4200, 18500, 8900, 2100)
on conflict (date) do nothing;
