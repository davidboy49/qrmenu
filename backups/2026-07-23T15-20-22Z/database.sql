PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_initial.sql','2026-07-18 14:31:01');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_seed_demo.sql','2026-07-18 14:31:01');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0003_access_and_audit.sql','2026-07-18 14:31:01');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(4,'0004_user_passwords.sql','2026-07-19 15:27:06');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(5,'0005_carousel.sql','2026-07-20 07:13:03');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(6,'0006_restaurant_logo.sql','2026-07-22 02:32:31');
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
, logo_asset_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL);
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at","logo_asset_id") VALUES('rest-demo','sabay-kitchen','Sabay Kitchen','active','Asia/Phnom_Penh','km-KH',1,1784385061,1784385061,NULL);
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at","logo_asset_id") VALUES('e4706beb-8847-42c8-8dd3-daf6c03d7805','nykuyteav','ចែនីគុយទាវឆ្ងាញ់-NyKuyTeav','active','Asia/Phnom_Penh','km-KH',1,1784475943,1784704997,'d5df338b-99e9-4bbf-8423-9a4a2e9b5308');
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at","logo_asset_id") VALUES('3d1b9868-4c26-4004-b950-f20851fe20ae','huddle-bar','Huddle Bar','active','Asia/Phnom_Penh','km-KH',1,1784476232,1784725163,'57fcdd57-4e5c-41fd-b9a8-8e5b102c62a7');
INSERT INTO "restaurants" ("id","slug","name","status","timezone","default_locale","public_menu_revision","created_at","updated_at","logo_asset_id") VALUES('323df97c-a99b-41b3-a97d-63187d6e43be','rv-shop','RV Shop','active','Asia/Phnom_Penh','km-KH',1,1784516065,1784516065,NULL);
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
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('branch-main','rest-demo','main','Main dining room','active','Asia/Phnom_Penh',1784385061,1784385061);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('0549b20a-8ef5-471d-9c3f-63a7853a7130','e4706beb-8847-42c8-8dd3-daf6c03d7805','main','សាខាចម្រើនផល','active','Asia/Phnom_Penh',1784475943,1784476070);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('460093e2-d672-4ee4-8fec-52b46e7aa789','3d1b9868-4c26-4004-b950-f20851fe20ae','main','Main Branch','active','Asia/Phnom_Penh',1784476232,1784476232);
INSERT INTO "branches" ("id","restaurant_id","slug","name","status","timezone","created_at","updated_at") VALUES('6068c1b8-f6ec-4739-841f-eb5cf2f73916','323df97c-a99b-41b3-a97d-63187d6e43be','main','សាខាទួលពង្រ','active','Asia/Phnom_Penh',1784516065,1784517283);
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('cat-local','rest-demo','active',10,1784385061,1784385061);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('cat-noodles','rest-demo','active',20,1784385061,1784385061);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('cat-drinks','rest-demo','active',30,1784385061,1784385061);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('6486ad9c-bd1c-4d37-888a-bdbe708ee98b','e4706beb-8847-42c8-8dd3-daf6c03d7805','active',2,1784475953,1784558613);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('b985dc69-eff5-4a26-83ae-49fe1e9f0b52','e4706beb-8847-42c8-8dd3-daf6c03d7805','active',0,1784475953,1784558613);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('a4f3cdf3-b1da-40b4-81b3-cc71d67094c9','e4706beb-8847-42c8-8dd3-daf6c03d7805','active',1,1784475953,1784558613);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('1bb2024a-9eb9-4692-88cc-c5f72035ce94','3d1b9868-4c26-4004-b950-f20851fe20ae','active',10,1784476232,1784476232);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('3343217d-bf3a-446c-909f-22def26e0941','3d1b9868-4c26-4004-b950-f20851fe20ae','active',20,1784476232,1784476232);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('1ab95340-6c05-47ab-b629-4d941ecf7251','3d1b9868-4c26-4004-b950-f20851fe20ae','active',30,1784476232,1784476232);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('50efa339-cc02-4cca-a32e-6d797d80999c','323df97c-a99b-41b3-a97d-63187d6e43be','active',999,1784516116,1784516116);
INSERT INTO "categories" ("id","restaurant_id","status","display_order","created_at","updated_at") VALUES('ae640dbd-ba44-4ed1-9f59-839dcf456a12','323df97c-a99b-41b3-a97d-63187d6e43be','active',999,1784516142,1784516142);
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
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('a4f3cdf3-b1da-40b4-81b3-cc71d67094c9','en','Drinks',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('a4f3cdf3-b1da-40b4-81b3-cc71d67094c9','km-KH','ភេសជ្ជៈ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('6486ad9c-bd1c-4d37-888a-bdbe708ee98b','en','Khmer favourites',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('6486ad9c-bd1c-4d37-888a-bdbe708ee98b','km-KH','ម្ហូបខ្មែរ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('b985dc69-eff5-4a26-83ae-49fe1e9f0b52','en','Noodles & rice',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('b985dc69-eff5-4a26-83ae-49fe1e9f0b52','km-KH','គុយទាវ និងបាយ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('1ab95340-6c05-47ab-b629-4d941ecf7251','en','Drinks',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('1ab95340-6c05-47ab-b629-4d941ecf7251','km-KH','ភេសជ្ជៈ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('1bb2024a-9eb9-4692-88cc-c5f72035ce94','en','Khmer favourites',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('1bb2024a-9eb9-4692-88cc-c5f72035ce94','km-KH','ម្ហូបខ្មែរ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('3343217d-bf3a-446c-909f-22def26e0941','en','Noodles & rice',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('3343217d-bf3a-446c-909f-22def26e0941','km-KH','គុយទាវ និងបាយ',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('50efa339-cc02-4cca-a32e-6d797d80999c','en','Charging Cable',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('50efa339-cc02-4cca-a32e-6d797d80999c','km-KH','ខ្សែរសាក',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('ae640dbd-ba44-4ed1-9f59-839dcf456a12','en','Tablet',NULL);
INSERT INTO "category_translations" ("category_id","locale","name","description") VALUES('ae640dbd-ba44-4ed1-9f59-839dcf456a12','km-KH','ថេប្លេត',NULL);
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
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-amok','rest-demo','cat-local','AMOK-01','active',10,2,1784385061,1784432398);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-loklak','rest-demo','cat-local','LOK-01','active',20,2,1784385061,1784442611);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-kuyteav','rest-demo','cat-noodles','KYT-01','active',10,2,1784385061,1784442442);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('item-coffee','rest-demo','cat-drinks','COF-01','active',10,3,1784385061,1784437332);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('04bcc6b3-fc45-4298-a575-41551bae6714','e4706beb-8847-42c8-8dd3-daf6c03d7805','a4f3cdf3-b1da-40b4-81b3-cc71d67094c9','COF-01','inactive',10,2,1784475953,1784476753);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('732978a9-7703-47fb-a767-b519a87f38ca','e4706beb-8847-42c8-8dd3-daf6c03d7805','6486ad9c-bd1c-4d37-888a-bdbe708ee98b','AMOK-01','inactive',10,2,1784475953,1784476757);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('2fe431d9-74d5-4d84-95f0-46cd382749f2','e4706beb-8847-42c8-8dd3-daf6c03d7805','6486ad9c-bd1c-4d37-888a-bdbe708ee98b','LOK-01','active',20,2,1784475953,1784476800);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('7ed12310-fbc2-43fb-aecc-92980c53b855','e4706beb-8847-42c8-8dd3-daf6c03d7805','b985dc69-eff5-4a26-83ae-49fe1e9f0b52','KYT-01','active',10,2,1784475953,1784476746);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('9d410a08-df83-47d3-8c03-b346227a2116','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'COF-01','inactive',10,2,1784476232,1784631553);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('53fa24c6-f4b0-42be-b909-ca5ed6a9cf72','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'AMOK-01','active',10,6,1784476232,1784732517);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('b4304d18-7287-43d4-a000-67db1090f918','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'LOK-01','inactive',20,2,1784476232,1784631563);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('e14094f7-eb07-4303-ae1c-f7df4dc1e043','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'KYT-01','inactive',10,2,1784476232,1784631558);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('fe822173-23c8-4ae3-92f4-fe5eaf4dc25f','e4706beb-8847-42c8-8dd3-daf6c03d7805','a4f3cdf3-b1da-40b4-81b3-cc71d67094c9',NULL,'active',999,3,1784476698,1784477032);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('b7992fac-7912-4be3-ad91-214ec52ef0de','323df97c-a99b-41b3-a97d-63187d6e43be',NULL,NULL,'active',999,5,1784516255,1784689766);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('09832d01-26cb-4da1-8de6-4bd76e855f87','323df97c-a99b-41b3-a97d-63187d6e43be','ae640dbd-ba44-4ed1-9f59-839dcf456a12',NULL,'active',999,3,1784516293,1784521344);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('7c7a931e-9790-4b14-b333-f7173d6e778c','323df97c-a99b-41b3-a97d-63187d6e43be','ae640dbd-ba44-4ed1-9f59-839dcf456a12',NULL,'active',999,3,1784521319,1784521331);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('d35dcf7a-28f0-4420-b179-4da306c5d242','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,NULL,'active',999,5,1784631615,1784732409);
INSERT INTO "menu_items" ("id","restaurant_id","category_id","sku","status","display_order","version","created_at","updated_at") VALUES('70806587-5c6c-4f55-a789-4d5a0c62eb80','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,NULL,'active',999,3,1784724977,1784780744);
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
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('732978a9-7703-47fb-a767-b519a87f38ca','en','Fish Amok','Steamed fish curry with coconut cream and fresh herbs.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('732978a9-7703-47fb-a767-b519a87f38ca','km-KH','អាម៉ុកត្រី','គ្រឿងការីត្រីចំហុយជាមួយខ្ទិះដូង។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('04bcc6b3-fc45-4298-a575-41551bae6714','en','Iced Khmer Coffee','Strong local coffee with condensed milk and ice.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('04bcc6b3-fc45-4298-a575-41551bae6714','km-KH','កាហ្វេទឹកដោះគោត្រជាក់','កាហ្វេខ្មែរជាមួយទឹកដោះគោខាប់ និងទឹកកក។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('7ed12310-fbc2-43fb-aecc-92980c53b855','en','Kuy Teav Sach Ko','Rice noodle soup with pork, herbs and a clear savoury broth.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('7ed12310-fbc2-43fb-aecc-92980c53b855','km-KH','គុយទាវសាច់គោ','គុយទាវទឹកសាច់ជ្រូក ជាមួយបន្លែ។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('2fe431d9-74d5-4d84-95f0-46cd382749f2','en','Bay Sach Jruk','Tender beef, pepper-lime dipping sauce, rice and fried egg.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('2fe431d9-74d5-4d84-95f0-46cd382749f2','km-KH','បាយសាច់ជ្រូក ពងទា','សាច់គោទន់ ជាមួយទឹកជ្រលក់ម្រេចក្រូចឆ្មា។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('53fa24c6-f4b0-42be-b909-ca5ed6a9cf72','en','Super Negroni',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('53fa24c6-f4b0-42be-b909-ca5ed6a9cf72','km-KH','ណេក្រូនី',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('9d410a08-df83-47d3-8c03-b346227a2116','en','Iced Khmer Coffee','Strong local coffee with condensed milk and ice.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('9d410a08-df83-47d3-8c03-b346227a2116','km-KH','កាហ្វេទឹកដោះគោត្រជាក់','កាហ្វេខ្មែរជាមួយទឹកដោះគោខាប់ និងទឹកកក។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('e14094f7-eb07-4303-ae1c-f7df4dc1e043','en','Phnom Penh Kuy Teav','Rice noodle soup with pork, herbs and a clear savoury broth.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('e14094f7-eb07-4303-ae1c-f7df4dc1e043','km-KH','គុយទាវភ្នំពេញ','គុយទាវទឹកសាច់ជ្រូក ជាមួយបន្លែ។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('b4304d18-7287-43d4-a000-67db1090f918','en','Beef Lok Lak','Tender beef, pepper-lime dipping sauce, rice and fried egg.');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('b4304d18-7287-43d4-a000-67db1090f918','km-KH','ឡុកឡាក់សាច់គោ','សាច់គោទន់ ជាមួយទឹកជ្រលក់ម្រេចក្រូចឆ្មា។');
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('fe822173-23c8-4ae3-92f4-fe5eaf4dc25f','en','Cambodia Cola Can 330ml',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('fe822173-23c8-4ae3-92f4-fe5eaf4dc25f','km-KH','កម្ពុជាកូឡា កំប៉ុង 330ml',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('b7992fac-7912-4be3-ad91-214ec52ef0de','en','IPhone Fast Charger 35W',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('b7992fac-7912-4be3-ad91-214ec52ef0de','km-KH','ឆ្នាំងសាក IPhone Fast Charger 35W',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('09832d01-26cb-4da1-8de6-4bd76e855f87','en','Redmi Pad2 8/256G',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('09832d01-26cb-4da1-8de6-4bd76e855f87','km-KH','Redmi Pad2 8/256G',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('7c7a931e-9790-4b14-b333-f7173d6e778c','en','Tecno Mega Pad Pro SIM+wifi',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('7c7a931e-9790-4b14-b333-f7173d6e778c','km-KH','Tecno Mega Pad Pro SIM+wifi',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('d35dcf7a-28f0-4420-b179-4da306c5d242','en','Hanuman Draft',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('d35dcf7a-28f0-4420-b179-4da306c5d242','km-KH','ថូហនុមាន',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('70806587-5c6c-4f55-a789-4d5a0c62eb80','en','Barrel Beer',NULL);
INSERT INTO "menu_item_translations" ("menu_item_id","locale","name","description") VALUES('70806587-5c6c-4f55-a789-4d5a0c62eb80','km-KH','បារ៉ែល',NULL);
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
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-amok-khr','item-amok',NULL,'KHR',28000,1784385061,1784432398);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-amok-usd','item-amok',NULL,'USD',700,1784385061,1784432398);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-loklak-khr','item-loklak',NULL,'KHR',26000,1784385061,1784442611);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-loklak-usd','item-loklak',NULL,'USD',650,1784385061,1784442611);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-kuyteav-khr','item-kuyteav',NULL,'KHR',14000,1784385061,1784442442);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-kuyteav-usd','item-kuyteav',NULL,'USD',350,1784385061,1784442442);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-coffee-khr','item-coffee',NULL,'KHR',8000,1784385061,1784437332);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('price-coffee-usd','item-coffee',NULL,'USD',200,1784385061,1784437332);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('6b2bc5a4-2be9-4c0f-ba2b-2808a3407a24','732978a9-7703-47fb-a767-b519a87f38ca',NULL,'KHR',28000,1784475953,1784476757);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('5e3ecce8-525c-4b1c-a948-8a4136b9c453','732978a9-7703-47fb-a767-b519a87f38ca',NULL,'USD',700,1784475953,1784476757);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('ffea0c0c-4ca0-4356-af3d-b3ddcf546a3c','04bcc6b3-fc45-4298-a575-41551bae6714',NULL,'KHR',8000,1784475953,1784476753);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('3ae4796f-154f-4005-bb6a-95814bb818f5','04bcc6b3-fc45-4298-a575-41551bae6714',NULL,'USD',200,1784475953,1784476753);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('7623076f-bf34-4d03-95cc-a7ebed90d533','7ed12310-fbc2-43fb-aecc-92980c53b855',NULL,'KHR',14000,1784475953,1784476746);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('e58e7717-1821-4730-8a97-5edc297debd1','7ed12310-fbc2-43fb-aecc-92980c53b855',NULL,'USD',350,1784475953,1784476746);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('e0e826b1-7cd1-4fce-8a86-8199cbe44430','2fe431d9-74d5-4d84-95f0-46cd382749f2',NULL,'KHR',5000,1784475953,1784476800);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('1c4ab3ed-3136-422d-89ea-826c459105aa','2fe431d9-74d5-4d84-95f0-46cd382749f2',NULL,'USD',125,1784475953,1784476800);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('0e54e345-fb29-4e14-a7ef-b0a850704ba0','53fa24c6-f4b0-42be-b909-ca5ed6a9cf72',NULL,'KHR',16000,1784476232,1784732517);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('8f469f66-2452-46dc-8269-dae3fc27d489','53fa24c6-f4b0-42be-b909-ca5ed6a9cf72',NULL,'USD',400,1784476232,1784732517);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('825f3ec6-cc41-4ebe-afac-02f77d08df1e','9d410a08-df83-47d3-8c03-b346227a2116',NULL,'KHR',8000,1784476232,1784631553);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('a0f5f172-0a97-4114-83da-7e4daad14717','9d410a08-df83-47d3-8c03-b346227a2116',NULL,'USD',200,1784476232,1784631553);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('c1818dd6-3f0e-416c-99ae-546a42d1135b','e14094f7-eb07-4303-ae1c-f7df4dc1e043',NULL,'KHR',14000,1784476232,1784631558);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('f199b3ae-a7bb-443f-bc21-a0b30fac2fb1','e14094f7-eb07-4303-ae1c-f7df4dc1e043',NULL,'USD',350,1784476232,1784631558);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('d7b075fd-af8e-47fb-9a65-b3ed6beb0817','b4304d18-7287-43d4-a000-67db1090f918',NULL,'KHR',26000,1784476232,1784631563);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('e2c620cb-a728-44a3-8fcd-1338af4e3e79','b4304d18-7287-43d4-a000-67db1090f918',NULL,'USD',650,1784476232,1784631563);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('08f0b376-7ccf-4df9-a5a6-7c1c019aa5c5','fe822173-23c8-4ae3-92f4-fe5eaf4dc25f',NULL,'KHR',3000,1784476698,1784477032);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('8397bfd2-d92a-40ef-9362-5518047c903c','fe822173-23c8-4ae3-92f4-fe5eaf4dc25f',NULL,'USD',75,1784476698,1784477032);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('3de0a8a2-5b31-4752-ac3b-1b6da21afb64','b7992fac-7912-4be3-ad91-214ec52ef0de',NULL,'KHR',40000,1784516255,1784689766);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('540b9937-7578-4ee0-92ea-cff460d6d8e7','b7992fac-7912-4be3-ad91-214ec52ef0de',NULL,'USD',1000,1784516255,1784689766);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('437cd275-79d1-4ce6-a712-0b1859a87338','09832d01-26cb-4da1-8de6-4bd76e855f87',NULL,'KHR',400000,1784516293,1784521344);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('b77f4568-dc79-4dc3-97da-fe8dfdd83e3a','09832d01-26cb-4da1-8de6-4bd76e855f87',NULL,'USD',10000,1784516293,1784521344);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('721b0835-ba7b-442a-81c2-abb702d59731','7c7a931e-9790-4b14-b333-f7173d6e778c',NULL,'KHR',800000,1784521319,1784521331);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('b80bf59f-dab9-412a-9a6c-796fd8c0a47d','7c7a931e-9790-4b14-b333-f7173d6e778c',NULL,'USD',20000,1784521319,1784521331);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('a094d65b-611e-467e-b4ab-129879d3dc4a','d35dcf7a-28f0-4420-b179-4da306c5d242',NULL,'KHR',28000,1784631615,1784732409);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('55625e18-03b3-4faa-b2f0-830c54797ddb','d35dcf7a-28f0-4420-b179-4da306c5d242',NULL,'USD',700,1784631615,1784732409);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('9422db1f-081e-46bb-aaa9-ca2dc2f47607','70806587-5c6c-4f55-a789-4d5a0c62eb80',NULL,'KHR',200000,1784724977,1784780744);
INSERT INTO "menu_item_prices" ("id","menu_item_id","branch_id","currency","amount_minor","created_at","updated_at") VALUES('153bd048-be1e-4c33-ae39-9dc139e85717','70806587-5c6c-4f55-a789-4d5a0c62eb80',NULL,'USD',2700,1784724977,1784780744);
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
INSERT INTO "menu_schedules" ("id","restaurant_id","branch_id","name","status","priority","valid_from","valid_to","created_at","updated_at") VALUES('schedule-all-day','rest-demo','branch-main','All day','active',100,NULL,NULL,1784385061,1784385061);
INSERT INTO "menu_schedules" ("id","restaurant_id","branch_id","name","status","priority","valid_from","valid_to","created_at","updated_at") VALUES('ede6bd2d-e4c4-4539-a9c6-c60e89ae5352','e4706beb-8847-42c8-8dd3-daf6c03d7805','0549b20a-8ef5-471d-9c3f-63a7853a7130','All day','active',100,NULL,NULL,1784475953,1784475953);
INSERT INTO "menu_schedules" ("id","restaurant_id","branch_id","name","status","priority","valid_from","valid_to","created_at","updated_at") VALUES('c52f059c-fe72-41a7-aa79-440ebbaa7ad9','3d1b9868-4c26-4004-b950-f20851fe20ae','460093e2-d672-4ee4-8fec-52b46e7aa789','All day','active',100,NULL,NULL,1784476232,1784476232);
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
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('4189adb9-82a4-4eb5-8f6f-d4d6a3e0319a','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',1,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('d9d2c21d-2cc1-47d0-a9d0-48b0f35c35a9','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',2,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('8ce0d9ea-d794-4c9b-b583-f6db778a1e92','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',3,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('4d39675f-ce69-4d8d-9e0e-5df28312f36a','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',4,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('d0971aab-8677-4e0d-bf8b-673830d7dc6d','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',5,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('d856c77b-5981-48cc-8560-ae70f16f8a2d','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',6,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('b912548c-2263-4bff-bb2c-33e57f4616ab','ede6bd2d-e4c4-4539-a9c6-c60e89ae5352',7,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('c10f4fef-eaaf-496b-a911-50a27e86e2c6','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',1,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('1881794a-b727-4768-a81d-eeb9add8af8f','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',2,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('73a0a1ee-39f1-446c-8814-053080af77c3','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',3,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('8d0db401-81ec-4c6c-9778-1ad175127c92','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',4,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('2afffd21-2363-49af-91bc-bf9a274e5d45','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',5,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('38cc24a7-35d2-45a0-840e-acaf87dfb93e','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',6,0,0,1);
INSERT INTO "schedule_windows" ("id","schedule_id","iso_weekday","start_minute","end_minute","end_day_offset") VALUES('4ba4b2e7-9437-4fa6-850e-12e50e43893c','c52f059c-fe72-41a7-aa79-440ebbaa7ad9',7,0,0,1);
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
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('ede6bd2d-e4c4-4539-a9c6-c60e89ae5352','732978a9-7703-47fb-a767-b519a87f38ca',10);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('ede6bd2d-e4c4-4539-a9c6-c60e89ae5352','04bcc6b3-fc45-4298-a575-41551bae6714',40);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('ede6bd2d-e4c4-4539-a9c6-c60e89ae5352','7ed12310-fbc2-43fb-aecc-92980c53b855',30);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('ede6bd2d-e4c4-4539-a9c6-c60e89ae5352','2fe431d9-74d5-4d84-95f0-46cd382749f2',20);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('c52f059c-fe72-41a7-aa79-440ebbaa7ad9','53fa24c6-f4b0-42be-b909-ca5ed6a9cf72',10);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('c52f059c-fe72-41a7-aa79-440ebbaa7ad9','9d410a08-df83-47d3-8c03-b346227a2116',40);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('c52f059c-fe72-41a7-aa79-440ebbaa7ad9','e14094f7-eb07-4303-ae1c-f7df4dc1e043',30);
INSERT INTO "schedule_items" ("schedule_id","menu_item_id","display_order") VALUES('c52f059c-fe72-41a7-aa79-440ebbaa7ad9','b4304d18-7287-43d4-a000-67db1090f918',20);
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
);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('7a98a14b-1e12-4399-bd0d-c226f752653a','rest-demo','restaurants/rest-demo/media/7a98a14b-1e12-4399-bd0d-c226f752653a.jpeg','image/jpeg',245558,NULL,NULL,NULL,'ready',1784431011,1784431011);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('9ceb762f-7fda-4fea-96cd-ffd36a90c8cb','rest-demo','restaurants/rest-demo/media/9ceb762f-7fda-4fea-96cd-ffd36a90c8cb.jpeg','image/jpeg',73408,NULL,NULL,NULL,'ready',1784437327,1784437327);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('064fa7d2-decb-470c-bd25-ea8906ef9493','rest-demo','restaurants/rest-demo/media/064fa7d2-decb-470c-bd25-ea8906ef9493.jpeg','image/jpeg',59754,NULL,NULL,NULL,'ready',1784442608,1784442608);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('e04696d0-236f-4bbf-a960-f2d23a619976','e4706beb-8847-42c8-8dd3-daf6c03d7805','restaurants/e4706beb-8847-42c8-8dd3-daf6c03d7805/media/e04696d0-236f-4bbf-a960-f2d23a619976.jpeg','image/jpeg',126600,NULL,NULL,NULL,'ready',1784476672,1784476672);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('321e54e5-f26d-443b-8a88-7a6d83d11170','e4706beb-8847-42c8-8dd3-daf6c03d7805','restaurants/e4706beb-8847-42c8-8dd3-daf6c03d7805/media/321e54e5-f26d-443b-8a88-7a6d83d11170.jpeg','image/jpeg',245558,NULL,NULL,NULL,'ready',1784476741,1784476741);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('4bb371c1-3f2d-4740-acd1-7cc70bfe6701','e4706beb-8847-42c8-8dd3-daf6c03d7805','restaurants/e4706beb-8847-42c8-8dd3-daf6c03d7805/media/4bb371c1-3f2d-4740-acd1-7cc70bfe6701.jpeg','image/jpeg',59754,NULL,NULL,NULL,'ready',1784476796,1784476796);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('646ded4d-3ebf-4ffa-b580-b04ec4cb7569','323df97c-a99b-41b3-a97d-63187d6e43be','restaurants/323df97c-a99b-41b3-a97d-63187d6e43be/media/646ded4d-3ebf-4ffa-b580-b04ec4cb7569.jpeg','image/jpeg',265771,NULL,NULL,NULL,'ready',1784516246,1784516246);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('8425c743-4b53-402c-820c-66a19e9ca474','323df97c-a99b-41b3-a97d-63187d6e43be','restaurants/323df97c-a99b-41b3-a97d-63187d6e43be/media/8425c743-4b53-402c-820c-66a19e9ca474.jpeg','image/jpeg',87092,NULL,NULL,NULL,'ready',1784516266,1784516266);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('4fb4439f-36b7-4c74-ad0d-b0ef8e772f0f','323df97c-a99b-41b3-a97d-63187d6e43be','restaurants/323df97c-a99b-41b3-a97d-63187d6e43be/media/4fb4439f-36b7-4c74-ad0d-b0ef8e772f0f.jpeg','image/jpeg',400504,NULL,NULL,NULL,'ready',1784517429,1784517429);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('0cfd9bc4-75de-4301-acde-5896b893ce5d','323df97c-a99b-41b3-a97d-63187d6e43be','restaurants/323df97c-a99b-41b3-a97d-63187d6e43be/media/0cfd9bc4-75de-4301-acde-5896b893ce5d.jpeg','image/jpeg',61357,NULL,NULL,NULL,'ready',1784521295,1784521295);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('4a9cdbc2-8127-40a2-80b2-e012f54e111a','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/4a9cdbc2-8127-40a2-80b2-e012f54e111a.jpeg','image/jpeg',61357,NULL,NULL,NULL,'ready',1784618996,1784618996);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('d9d9e8ba-7016-4f98-a90c-36b7232cf105','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/d9d9e8ba-7016-4f98-a90c-36b7232cf105.jpeg','image/jpeg',26988,NULL,NULL,NULL,'ready',1784619304,1784619304);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('5beb2f39-f9a0-4a0e-ad6e-c04a90315019','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/5beb2f39-f9a0-4a0e-ad6e-c04a90315019.jpeg','image/jpeg',28321,NULL,NULL,NULL,'ready',1784631613,1784631613);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('08abcdc0-123b-4ed5-b510-82cebbcebb3f','rest-demo','restaurants/rest-demo/media/08abcdc0-123b-4ed5-b510-82cebbcebb3f.webp','image/webp',21290,NULL,NULL,NULL,'ready',1784687739,1784687739);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('7d0e9136-b48b-48d8-84a8-778fb3c66301','323df97c-a99b-41b3-a97d-63187d6e43be','restaurants/323df97c-a99b-41b3-a97d-63187d6e43be/media/7d0e9136-b48b-48d8-84a8-778fb3c66301.webp','image/webp',13816,NULL,NULL,NULL,'ready',1784689393,1784689393);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('b4e5c9ed-623d-4e11-ae63-8628708af9ff','323df97c-a99b-41b3-a97d-63187d6e43be','restaurants/323df97c-a99b-41b3-a97d-63187d6e43be/media/b4e5c9ed-623d-4e11-ae63-8628708af9ff.webp','image/webp',57216,NULL,NULL,NULL,'ready',1784689763,1784689763);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('d5df338b-99e9-4bbf-8423-9a4a2e9b5308','e4706beb-8847-42c8-8dd3-daf6c03d7805','restaurants/e4706beb-8847-42c8-8dd3-daf6c03d7805/media/d5df338b-99e9-4bbf-8423-9a4a2e9b5308.webp','image/webp',19170,NULL,NULL,NULL,'ready',1784704995,1784704995);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('050e56a2-ccc1-4918-a486-8ae9d0227d4e','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/050e56a2-ccc1-4918-a486-8ae9d0227d4e.webp','image/webp',19814,NULL,NULL,NULL,'ready',1784717312,1784717312);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('600b82fa-6ed9-482f-b2eb-4d3da8b12624','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/600b82fa-6ed9-482f-b2eb-4d3da8b12624.webp','image/webp',37622,NULL,NULL,NULL,'ready',1784724971,1784724971);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('57fcdd57-4e5c-41fd-b9a8-8e5b102c62a7','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/57fcdd57-4e5c-41fd-b9a8-8e5b102c62a7.webp','image/webp',33426,NULL,NULL,NULL,'ready',1784725160,1784725160);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('02bfcbc2-0c0f-478b-8b0b-6923ce38f4df','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/02bfcbc2-0c0f-478b-8b0b-6923ce38f4df.webp','image/webp',39458,NULL,NULL,NULL,'ready',1784732329,1784732329);
INSERT INTO "media_assets" ("id","restaurant_id","r2_key","mime_type","byte_size","width","height","checksum","status","created_at","updated_at") VALUES('bfd5bd6a-b270-44d1-8690-a59c3a9c0552','3d1b9868-4c26-4004-b950-f20851fe20ae','restaurants/3d1b9868-4c26-4004-b950-f20851fe20ae/media/bfd5bd6a-b270-44d1-8690-a59c3a9c0552.webp','image/webp',70922,NULL,NULL,NULL,'ready',1784732406,1784732406);
CREATE TABLE menu_item_media (
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  media_asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text_en TEXT,
  alt_text_km TEXT,
  PRIMARY KEY (menu_item_id, media_asset_id)
);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('item-amok','7a98a14b-1e12-4399-bd0d-c226f752653a',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('item-coffee','9ceb762f-7fda-4fea-96cd-ffd36a90c8cb',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('item-kuyteav','7a98a14b-1e12-4399-bd0d-c226f752653a',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('item-loklak','064fa7d2-decb-470c-bd25-ea8906ef9493',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('7ed12310-fbc2-43fb-aecc-92980c53b855','321e54e5-f26d-443b-8a88-7a6d83d11170',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('2fe431d9-74d5-4d84-95f0-46cd382749f2','4bb371c1-3f2d-4740-acd1-7cc70bfe6701',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('fe822173-23c8-4ae3-92f4-fe5eaf4dc25f','e04696d0-236f-4bbf-a960-f2d23a619976',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('7c7a931e-9790-4b14-b333-f7173d6e778c','0cfd9bc4-75de-4301-acde-5896b893ce5d',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('09832d01-26cb-4da1-8de6-4bd76e855f87','8425c743-4b53-402c-820c-66a19e9ca474',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('b7992fac-7912-4be3-ad91-214ec52ef0de','b4e5c9ed-623d-4e11-ae63-8628708af9ff',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('d35dcf7a-28f0-4420-b179-4da306c5d242','bfd5bd6a-b270-44d1-8690-a59c3a9c0552',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('53fa24c6-f4b0-42be-b909-ca5ed6a9cf72','d9d9e8ba-7016-4f98-a90c-36b7232cf105',1,0,NULL,NULL);
INSERT INTO "menu_item_media" ("menu_item_id","media_asset_id","is_primary","display_order","alt_text_en","alt_text_km") VALUES('70806587-5c6c-4f55-a789-4d5a0c62eb80','600b82fa-6ed9-482f-b2eb-4d3da8b12624',1,0,NULL,NULL);
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
  updated_at INTEGER NOT NULL, password TEXT,
  UNIQUE (restaurant_id, email)
);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('staff-owner','rest-demo','owner@example.com','Sokha Dara','owner','suspended',1784385061,1784385061,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('452af6b2-8d30-497f-b7ba-8241d3510486','3d1b9868-4c26-4004-b950-f20851fe20ae','','huddle','owner','active',1784478902,1784478902,'huddle');
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('27320fb1-eda2-4453-82f4-5f0ccdcc2625','e4706beb-8847-42c8-8dd3-daf6c03d7805','dany.6461','dany','owner','active',1784479319,1784479319,'dany');
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('f9143310-9a94-4057-8a4f-eba429af31c8','323df97c-a99b-41b3-a97d-63187d6e43be','ravy.7695','ravy','owner','active',1784558154,1784558154,'ravy');
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('06149639-c463-4e79-8d87-ccb530994edc','rest-demo','david@qrmenu.com','david','owner','active',1784559788,1784559788,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('da4800f4-736f-4025-818d-877e800f0821','e4706beb-8847-42c8-8dd3-daf6c03d7805','david@qrmenu.com','david','owner','active',1784559788,1784559788,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('eb8e18fc-2bd6-4bde-8be0-64edc68252f0','3d1b9868-4c26-4004-b950-f20851fe20ae','david@qrmenu.com','david','owner','active',1784559788,1784559788,NULL);
INSERT INTO "staff_users" ("id","restaurant_id","email","display_name","role","status","created_at","updated_at","password") VALUES('f89622a5-c99a-4ba6-9d90-1db00ebc1524','323df97c-a99b-41b3-a97d-63187d6e43be','david@qrmenu.com','david','owner','active',1784559788,1784559788,NULL);
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json TEXT,
  created_at INTEGER NOT NULL
);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('48886122-eb46-48a3-bc51-5edd7e3bfaa4','rest-demo',NULL,'staff.invited','staff_user','17780748-d5e2-4fc8-bca3-eb75ccb77743','{"email":"david@qrmenu.com","role":"owner"}',1784436818);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('89d013d9-b815-479c-a0fb-8f21fbccd8ef','e4706beb-8847-42c8-8dd3-daf6c03d7805',NULL,'staff.invited','staff_user','056dfd10-52f6-4b4a-bf6d-6008bf45a5a6','{"email":"","role":"owner"}',1784476023);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('19b68dc9-412c-48f3-b823-f0ea6ddabe1f','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'staff.invited','staff_user','271c81cc-fa8a-49b0-a922-0773a952359d','{"email":"","role":"owner"}',1784476249);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('f80cef9c-3d9e-4a3f-8a91-f8e82742d38f','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'staff.invited','staff_user','28408675-dbf5-4cce-b31b-98ccc2c00fcb','{"email":"","role":"owner"}',1784478261);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('7924bb85-ff3a-4079-b24a-1b8f11837b8e','e4706beb-8847-42c8-8dd3-daf6c03d7805',NULL,'staff.invited','staff_user','8b607e44-ea00-4993-8f95-5cd7f56549d5','{"email":"","role":"owner"}',1784478261);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('1a115a32-654e-41ed-870c-1538ff71ef93','rest-demo',NULL,'staff.invited','staff_user','4205390b-b0b4-4233-9fd2-2f0e65968775','{"email":"","role":"owner"}',1784478261);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('3c837d68-2934-45a9-86d0-e49b4543d302','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'staff.invited','staff_user','e7053863-c209-4e41-8e0b-4a59cc18d77f','{"email":"","role":"editor"}',1784478286);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('767c58e9-cb5e-496b-b070-b8b925dc58bd','e4706beb-8847-42c8-8dd3-daf6c03d7805',NULL,'staff.invited','staff_user','7748b9ca-0d3f-4adf-8f37-b5a7ab3dbe90','{"email":"","role":"owner"}',1784478889);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('f20a136d-e5e6-4faa-aa89-50cb788e93bf','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'staff.invited','staff_user','452af6b2-8d30-497f-b7ba-8241d3510486','{"email":"","role":"owner"}',1784478902);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('fa9dd82f-ac09-419d-a8a9-4bb6f4b9af6d','e4706beb-8847-42c8-8dd3-daf6c03d7805',NULL,'staff.invited','staff_user','27320fb1-eda2-4453-82f4-5f0ccdcc2625','{"email":"dany.6461","role":"owner"}',1784479319);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('3d3976ce-f096-43c8-a058-b244db84996a','323df97c-a99b-41b3-a97d-63187d6e43be',NULL,'staff.invited','staff_user','427f926b-3f3b-4038-9022-69dd8ef5a01f','{"email":"ravy.7695","role":"owner"}',1784516091);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('e64588d7-821c-47c9-8b20-a5fb5f582ebe','323df97c-a99b-41b3-a97d-63187d6e43be',NULL,'staff.invited','staff_user','f9143310-9a94-4057-8a4f-eba429af31c8','{"email":"ravy.7695","role":"owner"}',1784558154);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('561a8e4a-f235-4da2-8ce1-eeb9f5ac8080','rest-demo',NULL,'staff.invited','staff_user','06149639-c463-4e79-8d87-ccb530994edc','{"email":"david@qrmenu.com","role":"owner"}',1784559788);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('82c2736b-fce6-4ef0-80b9-4dffd067dd2e','e4706beb-8847-42c8-8dd3-daf6c03d7805',NULL,'staff.invited','staff_user','da4800f4-736f-4025-818d-877e800f0821','{"email":"david@qrmenu.com","role":"owner"}',1784559788);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('48742a4a-1679-4c7d-817b-3784084e93a2','3d1b9868-4c26-4004-b950-f20851fe20ae',NULL,'staff.invited','staff_user','eb8e18fc-2bd6-4bde-8be0-64edc68252f0','{"email":"david@qrmenu.com","role":"owner"}',1784559788);
INSERT INTO "audit_events" ("id","restaurant_id","actor_email","action","entity_type","entity_id","metadata_json","created_at") VALUES('bb88f33d-086c-45f8-ad75-05b583d3cc60','323df97c-a99b-41b3-a97d-63187d6e43be',NULL,'staff.invited','staff_user','f89622a5-c99a-4ba6-9d90-1db00ebc1524','{"email":"david@qrmenu.com","role":"owner"}',1784559788);
CREATE TABLE restaurant_carousel_media (
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  media_asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (restaurant_id, media_asset_id)
);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('323df97c-a99b-41b3-a97d-63187d6e43be','0cfd9bc4-75de-4301-acde-5896b893ce5d',10);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('323df97c-a99b-41b3-a97d-63187d6e43be','4fb4439f-36b7-4c74-ad0d-b0ef8e772f0f',20);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('323df97c-a99b-41b3-a97d-63187d6e43be','8425c743-4b53-402c-820c-66a19e9ca474',30);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('3d1b9868-4c26-4004-b950-f20851fe20ae','5beb2f39-f9a0-4a0e-ad6e-c04a90315019',10);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('3d1b9868-4c26-4004-b950-f20851fe20ae','d9d9e8ba-7016-4f98-a90c-36b7232cf105',20);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('323df97c-a99b-41b3-a97d-63187d6e43be','7d0e9136-b48b-48d8-84a8-778fb3c66301',40);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('e4706beb-8847-42c8-8dd3-daf6c03d7805','e04696d0-236f-4bbf-a960-f2d23a619976',10);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('e4706beb-8847-42c8-8dd3-daf6c03d7805','321e54e5-f26d-443b-8a88-7a6d83d11170',20);
INSERT INTO "restaurant_carousel_media" ("restaurant_id","media_asset_id","display_order") VALUES('e4706beb-8847-42c8-8dd3-daf6c03d7805','4bb371c1-3f2d-4740-acd1-7cc70bfe6701',30);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',6);
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
