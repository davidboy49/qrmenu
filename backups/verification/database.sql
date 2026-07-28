PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_initial.sql','2026-07-19 10:28:00');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_seed_demo.sql','2026-07-19 10:28:01');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0003_access_and_audit.sql','2026-07-19 10:28:02');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(4,'0004_user_passwords.sql','2026-07-19 10:45:48');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(5,'0005_secure_passwords.sql','2026-07-23 12:51:25');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(6,'0006_security_events.sql','2026-07-23 13:15:36');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(7,'0007_production_readiness.sql','2026-07-23 13:42:11');
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Phnom_Penh',
  default_locale TEXT NOT NULL DEFAULT 'km-KH',
  public_menu_revision INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at") VALUES('rest-demo','sabay-kitchen','Sabay Kitchen','active','Asia/Phnom_Penh','km-KH',1,1784456881,1784456881);
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at") VALUES('6675c426-a938-431c-b22a-bc68666f1852','huddle-bar','Huddle Bar','active','Asia/Phnom_Penh','km-KH',1,1784457669,1784457669);
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at") VALUES('9a5cdef8-c978-4780-9f14-6c023611b750','ny-kuyteav','Ny Kuyteav','active','Asia/Phnom_Penh','km-KH',1,1784471311,1784471311);
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Phnom_Penh',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (restaurant_id, slug)
);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('branch-main','rest-demo','main','Main dining room','active','Asia/Phnom_Penh',1784456881,1784456881);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('7eba1a81-af0f-4a3c-992c-ba8f9725b638','6675c426-a938-431c-b22a-bc68666f1852','main','Main Branch','active','Asia/Phnom_Penh',1784457669,1784457669);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('8e606541-9bb6-4d42-bb51-565ec734ea5c','6675c426-a938-431c-b22a-bc68666f1852','siemreap','Siemreap','active','Asia/Phnom_Penh',1784471284,1784471284);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('cede5661-befb-4688-9ece-981f50c85ecc','9a5cdef8-c978-4780-9f14-6c023611b750','main','សាខា ចំរើនផល','active','Asia/Phnom_Penh',1784471311,1784472810);
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('cat-local','rest-demo','active',10,1784456881,1784456881);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('cat-noodles','rest-demo','active',20,1784456881,1784456881);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('cat-drinks','rest-demo','active',30,1784456881,1784456881);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('a10608e0-6fcf-4193-8023-023a33ae1615','9a5cdef8-c978-4780-9f14-6c023611b750','active',10,1784471336,1784471336);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('42d749aa-31d1-488d-add5-2dd008aa670c','9a5cdef8-c978-4780-9f14-6c023611b750','active',20,1784471336,1784471336);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('03858577-bca4-4792-b422-e3e596b6d21b','9a5cdef8-c978-4780-9f14-6c023611b750','active',30,1784471336,1784471336);
CREATE TABLE category_translations (
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (category_id, locale)
);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('cat-local','en','Khmer favourites',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('cat-local','km-KH','ម្ហូបខ្មែរ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('cat-noodles','en','Noodles & rice',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('cat-noodles','km-KH','គុយទាវ និងបាយ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('cat-drinks','en','Drinks',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('cat-drinks','km-KH','ភេសជ្ជៈ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('03858577-bca4-4792-b422-e3e596b6d21b','en','Drinks',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('03858577-bca4-4792-b422-e3e596b6d21b','km-KH','ភេសជ្ជៈ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('a10608e0-6fcf-4193-8023-023a33ae1615','en','Khmer favourites',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('a10608e0-6fcf-4193-8023-023a33ae1615','km-KH','ម្ហូបខ្មែរ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('42d749aa-31d1-488d-add5-2dd008aa670c','en','Noodles & rice',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('42d749aa-31d1-488d-add5-2dd008aa670c','km-KH','គុយទាវ និងបាយ',NULL);
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (restaurant_id, sku)
);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-amok','rest-demo','cat-local','AMOK-01','active',10,1,1784456881,1784456881);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-loklak','rest-demo','cat-local','LOK-01','active',20,1,1784456881,1784456881);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-kuyteav','rest-demo','cat-noodles','KYT-01','active',10,1,1784456881,1784456881);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-coffee','rest-demo','cat-drinks','COF-01','active',10,1,1784456881,1784456881);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('ffc9ba5f-5480-4787-983c-5a2461596a37','9a5cdef8-c978-4780-9f14-6c023611b750','03858577-bca4-4792-b422-e3e596b6d21b','COF-01','active',10,1,1784471336,1784471336);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('bbec8bd4-146a-42a5-8ee0-0d7c5ca7f30f','9a5cdef8-c978-4780-9f14-6c023611b750','a10608e0-6fcf-4193-8023-023a33ae1615','AMOK-01','active',10,1,1784471336,1784471336);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('c2905fa3-9502-40d8-bce0-afdcc4ef0288','9a5cdef8-c978-4780-9f14-6c023611b750','a10608e0-6fcf-4193-8023-023a33ae1615','LOK-01','active',20,1,1784471336,1784471336);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('8bb7ba0f-cd5c-4dd7-8b48-11b653a5bba4','9a5cdef8-c978-4780-9f14-6c023611b750','42d749aa-31d1-488d-add5-2dd008aa670c','KYT-01','active',10,1,1784471336,1784471336);
CREATE TABLE menu_item_translations (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (menu_item_id, locale)
);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-amok','en','Fish Amok','Steamed fish curry with coconut cream and fresh herbs.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-amok','km-KH','អាម៉ុកត្រី','គ្រឿងការីត្រីចំហុយជាមួយខ្ទិះដូង។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-loklak','en','Beef Lok Lak','Tender beef, pepper-lime dipping sauce, rice and fried egg.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-loklak','km-KH','ឡុកឡាក់សាច់គោ','សាច់គោទន់ ជាមួយទឹកជ្រលក់ម្រេចក្រូចឆ្មា។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-kuyteav','en','Phnom Penh Kuy Teav','Rice noodle soup with pork, herbs and a clear savoury broth.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-kuyteav','km-KH','គុយទាវភ្នំពេញ','គុយទាវទឹកសាច់ជ្រូក ជាមួយបន្លែ។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-coffee','en','Iced Khmer Coffee','Strong local coffee with condensed milk and ice.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('item-coffee','km-KH','កាហ្វេទឹកដោះគោត្រជាក់','កាហ្វេខ្មែរជាមួយទឹកដោះគោខាប់ និងទឹកកក។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('bbec8bd4-146a-42a5-8ee0-0d7c5ca7f30f','en','Fish Amok','Steamed fish curry with coconut cream and fresh herbs.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('bbec8bd4-146a-42a5-8ee0-0d7c5ca7f30f','km-KH','អាម៉ុកត្រី','គ្រឿងការីត្រីចំហុយជាមួយខ្ទិះដូង។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('ffc9ba5f-5480-4787-983c-5a2461596a37','en','Iced Khmer Coffee','Strong local coffee with condensed milk and ice.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('ffc9ba5f-5480-4787-983c-5a2461596a37','km-KH','កាហ្វេទឹកដោះគោត្រជាក់','កាហ្វេខ្មែរជាមួយទឹកដោះគោខាប់ និងទឹកកក។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('8bb7ba0f-cd5c-4dd7-8b48-11b653a5bba4','en','Phnom Penh Kuy Teav','Rice noodle soup with pork, herbs and a clear savoury broth.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('8bb7ba0f-cd5c-4dd7-8b48-11b653a5bba4','km-KH','គុយទាវភ្នំពេញ','គុយទាវទឹកសាច់ជ្រូក ជាមួយបន្លែ។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('c2905fa3-9502-40d8-bce0-afdcc4ef0288','en','Beef Lok Lak','Tender beef, pepper-lime dipping sauce, rice and fried egg.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('c2905fa3-9502-40d8-bce0-afdcc4ef0288','km-KH','ឡុកឡាក់សាច់គោ','សាច់គោទន់ ជាមួយទឹកជ្រលក់ម្រេចក្រូចឆ្មា។');
CREATE TABLE menu_item_prices (
  id TEXT PRIMARY KEY,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('KHR', 'USD')),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (menu_item_id, branch_id, currency)
);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-amok-khr','item-amok',NULL,'KHR',28000,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-amok-usd','item-amok',NULL,'USD',700,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-loklak-khr','item-loklak',NULL,'KHR',26000,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-loklak-usd','item-loklak',NULL,'USD',650,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-kuyteav-khr','item-kuyteav',NULL,'KHR',14000,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-kuyteav-usd','item-kuyteav',NULL,'USD',350,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-coffee-khr','item-coffee',NULL,'KHR',8000,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-coffee-usd','item-coffee',NULL,'USD',200,1784456881,1784456881);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('be4f91b3-e519-4778-adb0-db6181840da2','bbec8bd4-146a-42a5-8ee0-0d7c5ca7f30f',NULL,'KHR',28000,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('b85676de-3a54-4d8b-ba4a-dd167130e1ae','bbec8bd4-146a-42a5-8ee0-0d7c5ca7f30f',NULL,'USD',700,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('cd1b24d4-47a5-4aa2-a736-c53d86716c7b','ffc9ba5f-5480-4787-983c-5a2461596a37',NULL,'KHR',8000,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('fb171128-3507-49ba-914a-adbcc269cf49','ffc9ba5f-5480-4787-983c-5a2461596a37',NULL,'USD',200,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('0a34160a-692f-474e-996c-990a7b1f261c','8bb7ba0f-cd5c-4dd7-8b48-11b653a5bba4',NULL,'KHR',14000,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('e9ca8888-e541-40bc-9f8c-2ce90e036de8','8bb7ba0f-cd5c-4dd7-8b48-11b653a5bba4',NULL,'USD',350,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('012856d2-9ed3-4f5e-bf6c-7e6da7a4c3bd','c2905fa3-9502-40d8-bce0-afdcc4ef0288',NULL,'KHR',26000,1784471336,1784471336);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('7156be5b-d50a-4769-a9de-58ca1af1207d','c2905fa3-9502-40d8-bce0-afdcc4ef0288',NULL,'USD',650,1784471336,1784471336);
CREATE TABLE menu_schedules (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  priority INTEGER NOT NULL DEFAULT 0,
  valid_from TEXT,
  valid_to TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_from <= valid_to)
);
INSERT INTO "menu_schedules" ("id","restaurant_id","branch_id","name","status","priority","valid_from","valid_to","created_at","updated_at") VALUES('schedule-all-day','rest-demo','branch-main','All day','active',100,NULL,NULL,1784456881,1784456881);
INSERT INTO "menu_schedules" ("id","restaurant_id","branch_id","name","status","priority","valid_from","valid_to","created_at","updated_at") VALUES('a4020451-d24d-4eec-8813-fc14fc7e4865','9a5cdef8-c978-4780-9f14-6c023611b750','cede5661-befb-4688-9ece-981f50c85ecc','All day','active',100,NULL,NULL,1784471336,1784471336);
CREATE TABLE schedule_windows (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES menu_schedules(id) ON DELETE CASCADE,
  iso_weekday INTEGER NOT NULL CHECK (iso_weekday BETWEEN 1 AND 7),
  start_minute INTEGER NOT NULL CHECK (start_minute BETWEEN 0 AND 1439),
  end_minute INTEGER NOT NULL CHECK (end_minute BETWEEN 0 AND 1439),
  end_day_offset INTEGER NOT NULL DEFAULT 0 CHECK (end_day_offset IN (0, 1)),
  CHECK (end_day_offset = 1 OR start_minute < end_minute)
);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-1','schedule-all-day',1,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-2','schedule-all-day',2,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-3','schedule-all-day',3,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-4','schedule-all-day',4,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-5','schedule-all-day',5,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-6','schedule-all-day',6,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('window-7','schedule-all-day',7,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('ded8fae6-ce42-4ca9-9180-cb163578d46b','a4020451-d24d-4eec-8813-fc14fc7e4865',1,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('fe4cacf2-0389-46e0-b383-a922acbd478f','a4020451-d24d-4eec-8813-fc14fc7e4865',2,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('48f58f56-67a0-481f-8492-c76f51e64acd','a4020451-d24d-4eec-8813-fc14fc7e4865',3,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('fe0b0096-9ff9-44be-8d2f-9ed0c046dcb3','a4020451-d24d-4eec-8813-fc14fc7e4865',4,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('2f1d18b8-685a-4a73-9fbb-a0c1570bb88e','a4020451-d24d-4eec-8813-fc14fc7e4865',5,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('b87b8e25-c67d-46fa-b8e5-9afe13c8b876','a4020451-d24d-4eec-8813-fc14fc7e4865',6,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('28b63f20-62b2-4921-a621-06b16adab119','a4020451-d24d-4eec-8813-fc14fc7e4865',7,0,0,1);
CREATE TABLE schedule_items (
  schedule_id TEXT NOT NULL REFERENCES menu_schedules(id) ON DELETE CASCADE,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (schedule_id, menu_item_id)
);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('schedule-all-day','item-amok',10);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('schedule-all-day','item-loklak',20);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('schedule-all-day','item-kuyteav',30);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('schedule-all-day','item-coffee',40);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('a4020451-d24d-4eec-8813-fc14fc7e4865','bbec8bd4-146a-42a5-8ee0-0d7c5ca7f30f',10);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('a4020451-d24d-4eec-8813-fc14fc7e4865','ffc9ba5f-5480-4787-983c-5a2461596a37',40);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('a4020451-d24d-4eec-8813-fc14fc7e4865','8bb7ba0f-cd5c-4dd7-8b48-11b653a5bba4',30);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('a4020451-d24d-4eec-8813-fc14fc7e4865','c2905fa3-9502-40d8-bce0-afdcc4ef0288',20);
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  width INTEGER,
  height INTEGER,
  checksum TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('uploading', 'ready', 'failed', 'archived')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
, thumbnail_r2_key TEXT);
CREATE TABLE menu_item_media (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  media_asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text_en TEXT,
  alt_text_km TEXT,
  PRIMARY KEY (menu_item_id, media_asset_id)
);
CREATE TABLE item_availability (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'available' CHECK (state IN ('available', 'sold_out')),
  expires_at INTEGER,
  updated_by TEXT,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (menu_item_id, branch_id)
);
CREATE TABLE staff_users (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','manager','editor','viewer')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','suspended')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL, password TEXT, password_hash TEXT, session_version INTEGER NOT NULL DEFAULT 1, password_changed_at INTEGER,
  UNIQUE (restaurant_id, email)
);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password","password_hash","session_version","password_changed_at") VALUES('4968faf8-f3fe-49fc-ae06-5a079dfca344','6675c426-a938-431c-b22a-bc68666f1852','legendmonster485@gmail.com','david','owner','active',1784458250,1784458250,'david',NULL,1,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password","password_hash","session_version","password_changed_at") VALUES('4c939463-e410-4087-a364-405f356df5d2','6675c426-a938-431c-b22a-bc68666f1852','huddle@bar.com','huddle','editor','active',1784471083,1784471083,'huddle',NULL,1,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password","password_hash","session_version","password_changed_at") VALUES('9cf6819b-0c00-437e-b54f-e2f4c1751953','rest-demo','huddle@bar.com','huddle','editor','active',1784471083,1784471083,'huddle',NULL,1,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password","password_hash","session_version","password_changed_at") VALUES('bcd19ae4-7eff-4443-be6f-6f68dd5ae4e1','9a5cdef8-c978-4780-9f14-6c023611b750','dany@kuyteav.com','dany','owner','active',1784472474,1784472474,'dany',NULL,1,NULL);
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL
, before_json TEXT, after_json TEXT, request_id TEXT);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at","before_json","after_json","request_id") VALUES('a2d85727-fda3-4d8d-8c44-de840017721f','6675c426-a938-431c-b22a-bc68666f1852',NULL,'staff.invited','staff_user','4968faf8-f3fe-49fc-ae06-5a079dfca344','{"email":"legendmonster485@gmail.com","role":"owner"}',1784458250,NULL,NULL,NULL);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at","before_json","after_json","request_id") VALUES('f5d22b5f-5b93-4147-8f1b-d26bb90243de','6675c426-a938-431c-b22a-bc68666f1852',NULL,'staff.invited','staff_user','4c939463-e410-4087-a364-405f356df5d2','{"email":"huddle@bar.com","role":"editor"}',1784471083,NULL,NULL,NULL);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at","before_json","after_json","request_id") VALUES('8f832ad2-e9a1-4ca4-9f9a-62e091fd6916','rest-demo',NULL,'staff.invited','staff_user','9cf6819b-0c00-437e-b54f-e2f4c1751953','{"email":"huddle@bar.com","role":"editor"}',1784471083,NULL,NULL,NULL);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at","before_json","after_json","request_id") VALUES('651a064c-725c-4a7c-8c90-f780cfde2251','9a5cdef8-c978-4780-9f14-6c023611b750',NULL,'staff.invited','staff_user','bcd19ae4-7eff-4443-be6f-6f68dd5ae4e1','{"email":"dany@kuyteav.com","role":"owner"}',1784472474,NULL,NULL,NULL);
CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  subject TEXT,
  success INTEGER NOT NULL CHECK (success IN (0, 1)),
  metadata_json TEXT,
  created_at INTEGER NOT NULL
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',7);
CREATE INDEX idx_branches_restaurant_status ON branches (restaurant_id, status);
CREATE INDEX idx_categories_restaurant_status_order ON categories (restaurant_id, status, display_order);
CREATE INDEX idx_menu_items_restaurant_status_category ON menu_items (restaurant_id, status, category_id);
CREATE INDEX idx_menu_items_category_order ON menu_items (category_id, display_order);
CREATE INDEX idx_prices_item_branch ON menu_item_prices (menu_item_id, branch_id);
CREATE UNIQUE INDEX idx_prices_item_default_currency ON menu_item_prices (menu_item_id, currency) WHERE branch_id IS NULL;
CREATE INDEX idx_schedules_restaurant_branch_status ON menu_schedules (restaurant_id, branch_id, status);
CREATE INDEX idx_schedule_windows_schedule_day ON schedule_windows (schedule_id, iso_weekday);
CREATE INDEX idx_schedule_items_item ON schedule_items (menu_item_id);
CREATE INDEX idx_availability_branch_state ON item_availability (branch_id, state);
CREATE INDEX idx_staff_users_restaurant ON staff_users(restaurant_id, status);
CREATE INDEX idx_audit_events_restaurant_time ON audit_events(restaurant_id, created_at DESC);
CREATE INDEX idx_staff_users_email_status
ON staff_users (email, status);
CREATE INDEX idx_security_events_type_time
ON security_events (event_type, created_at DESC);
CREATE INDEX idx_audit_events_actor_time
ON audit_events (actor_email, created_at DESC);
CREATE INDEX idx_audit_events_action_time
ON audit_events (action, created_at DESC);
CREATE INDEX idx_security_events_success_time
ON security_events (success, created_at DESC);