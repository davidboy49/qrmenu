import { getCloudflareEnv } from "@/lib/server/cloudflare";
import type { AdminMenuItem, PublicMenuItem } from "@/lib/menu-types";

const restaurantId = "rest-demo";
const timestamp = () => Math.floor(Date.now() / 1000);

export async function listAdminMenuItems(): Promise<AdminMenuItem[]> {
 const { DB: db } = await getCloudflareEnv();
 const { results = [] } = await db.prepare(`SELECT mi.id, COALESCE(en.name,'') AS nameEn, COALESCE(km.name,'') AS nameKm, COALESCE(cat.name,'Uncategorised') AS category, mi.status, mi.updated_at AS updatedAt, COALESCE((SELECT amount_minor FROM menu_item_prices WHERE menu_item_id=mi.id AND currency='KHR' AND branch_id IS NULL),0) AS priceKhr, COALESCE((SELECT amount_minor FROM menu_item_prices WHERE menu_item_id=mi.id AND currency='USD' AND branch_id IS NULL),0) AS priceUsd, (SELECT media_asset_id FROM menu_item_media WHERE menu_item_id=mi.id AND is_primary=1 LIMIT 1) AS imageId, GROUP_CONCAT(DISTINCT ms.name) AS schedules FROM menu_items mi LEFT JOIN menu_item_translations en ON en.menu_item_id=mi.id AND en.locale='en' LEFT JOIN menu_item_translations km ON km.menu_item_id=mi.id AND km.locale='km-KH' LEFT JOIN categories c ON c.id=mi.category_id LEFT JOIN category_translations cat ON cat.category_id=c.id AND cat.locale='en' LEFT JOIN schedule_items si ON si.menu_item_id=mi.id LEFT JOIN menu_schedules ms ON ms.id=si.schedule_id AND ms.status='active' WHERE mi.restaurant_id=? AND mi.status!='archived' GROUP BY mi.id ORDER BY mi.display_order,mi.updated_at DESC`).bind(restaurantId).all<Record<string, unknown>>();
 return results.map((r) => ({ id:String(r.id), nameEn:String(r.nameEn), nameKm:String(r.nameKm), category:String(r.category), priceKhr:Number(r.priceKhr), priceUsd:Number(r.priceUsd)/100, schedules:r.schedules?String(r.schedules).split(','):[], status:r.status==='active'?'active':'inactive', translationComplete:Boolean(r.nameEn&&r.nameKm), updatedAt:new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric'}).format(new Date(Number(r.updatedAt)*1000)),imageId:r.imageId?String(r.imageId):null }));
}

export async function listPublicMenu(slug:string, locale:"en"|"km-KH"): Promise<{restaurant:string;items:PublicMenuItem[]}|null> {
 const { DB: db } = await getCloudflareEnv(); const restaurant=await db.prepare("SELECT id,name FROM restaurants WHERE slug=? AND status='active'").bind(slug).first<{id:string;name:string}>(); if(!restaurant)return null;
 const {results:windows=[]}=await db.prepare("SELECT s.id,s.valid_from,s.valid_to,w.iso_weekday,w.start_minute,w.end_minute,w.end_day_offset FROM menu_schedules s JOIN schedule_windows w ON w.schedule_id=s.id WHERE s.restaurant_id=? AND s.status='active'").bind(restaurant.id).all<Record<string,unknown>>();
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Phnom_Penh',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const part=(type:string)=>parts.find(p=>p.type===type)?.value??'';const dayMap:{[key:string]:number}={Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:7};const minute=Number(part('hour'))*60+Number(part('minute'));const today=`${part('year')}-${part('month')}-${part('day')}`;const active=[...new Set(windows.filter(w=>{const start=String(w.valid_from??'');const end=String(w.valid_to??'');if(start&&start>today||end&&end<today)return false;const same=Number(w.iso_weekday)===dayMap[part('weekday')];return same&&minute>=Number(w.start_minute)&&(Number(w.end_day_offset)===1||minute<Number(w.end_minute))}).map(w=>String(w.id)))];if(!active.length)return {restaurant:restaurant.name,items:[]};
 const alternate=locale==='en'?'km-KH':'en';const placeholders=active.map(()=>'?').join(',');const {results=[]}=await db.prepare(`SELECT mi.id,mi.category_id AS categoryId,COALESCE(ct.name,'Menu') AS category,COALESCE(t.name,alt.name) AS name,alt.name AS secondaryName,t.description,(SELECT amount_minor FROM menu_item_prices WHERE menu_item_id=mi.id AND currency='KHR' AND branch_id IS NULL) AS priceKhr,(SELECT amount_minor FROM menu_item_prices WHERE menu_item_id=mi.id AND currency='USD' AND branch_id IS NULL) AS priceUsd,(SELECT media_asset_id FROM menu_item_media WHERE menu_item_id=mi.id AND is_primary=1 LIMIT 1) AS imageId FROM menu_items mi JOIN schedule_items si ON si.menu_item_id=mi.id LEFT JOIN item_availability availability ON availability.menu_item_id=mi.id AND availability.branch_id='branch-main' LEFT JOIN menu_item_translations t ON t.menu_item_id=mi.id AND t.locale=? LEFT JOIN menu_item_translations alt ON alt.menu_item_id=mi.id AND alt.locale=? LEFT JOIN categories c ON c.id=mi.category_id LEFT JOIN category_translations ct ON ct.category_id=c.id AND ct.locale=? WHERE mi.restaurant_id=? AND mi.status='active' AND COALESCE(availability.state,'available')='available' AND si.schedule_id IN (${placeholders}) GROUP BY mi.id ORDER BY c.display_order,si.display_order,mi.display_order`).bind(locale,alternate,locale,restaurant.id,...active).all<PublicMenuItem>();return {restaurant:restaurant.name,items:results};
}

export async function createMenuItem(input: {
	nameEn: string;
	nameKm: string;
	priceKhr: number;
	priceUsd: number;
	imageId?: string | null;
}) {
	const { DB: db } = await getCloudflareEnv();
	const itemId = crypto.randomUUID();
	const now = timestamp();
	const statements = [
		db.prepare("INSERT INTO menu_items (id,restaurant_id,status,display_order,created_at,updated_at) VALUES (?,?,'inactive',999,?,?)").bind(itemId, restaurantId, now, now),
		db.prepare("INSERT INTO menu_item_translations (menu_item_id,locale,name) VALUES (?,'en',?),(?,'km-KH',?)").bind(itemId, input.nameEn, itemId, input.nameKm),
		db.prepare("INSERT INTO menu_item_prices (id,menu_item_id,currency,amount_minor,created_at,updated_at) VALUES (?,?,'KHR',?,?,?),(?,?,'USD',?,?,?)").bind(crypto.randomUUID(), itemId, input.priceKhr, now, now, crypto.randomUUID(), itemId, Math.round(input.priceUsd * 100), now, now),
	];
	if (input.imageId) {
		statements.push(
			db.prepare("INSERT INTO menu_item_media (menu_item_id,media_asset_id,is_primary,display_order) VALUES (?,?,1,0)").bind(itemId, input.imageId)
		);
	}
	await db.batch(statements);
	return { id: itemId };
}


export async function getMenuItem(itemId:string){return (await listAdminMenuItems()).find(item=>item.id===itemId)??null}
export async function updateMenuItem(itemId:string,input:{nameEn:string;nameKm:string;priceKhr:number;priceUsd:number;status:"active"|"inactive";imageId?:string|null}){const {DB:db}=await getCloudflareEnv();const now=timestamp();const exists=await db.prepare("SELECT id FROM menu_items WHERE id=? AND restaurant_id=?").bind(itemId,restaurantId).first();if(!exists)return null;const statements=[db.prepare("UPDATE menu_items SET status=?,version=version+1,updated_at=? WHERE id=?").bind(input.status,now,itemId),db.prepare("UPDATE menu_item_translations SET name=? WHERE menu_item_id=? AND locale='en'").bind(input.nameEn,itemId),db.prepare("UPDATE menu_item_translations SET name=? WHERE menu_item_id=? AND locale='km-KH'").bind(input.nameKm,itemId),db.prepare("UPDATE menu_item_prices SET amount_minor=?,updated_at=? WHERE menu_item_id=? AND currency='KHR' AND branch_id IS NULL").bind(input.priceKhr,now,itemId),db.prepare("UPDATE menu_item_prices SET amount_minor=?,updated_at=? WHERE menu_item_id=? AND currency='USD' AND branch_id IS NULL").bind(Math.round(input.priceUsd*100),now,itemId)];if(input.imageId!==undefined){statements.push(db.prepare("DELETE FROM menu_item_media WHERE menu_item_id=? AND is_primary=1").bind(itemId));if(input.imageId)statements.push(db.prepare("INSERT INTO menu_item_media (menu_item_id,media_asset_id,is_primary,display_order) VALUES (?,?,1,0)").bind(itemId,input.imageId))}await db.batch(statements);return {id:itemId};}

export type Category={id:string;nameEn:string;nameKm:string;status:"active"|"inactive";itemCount:number};
export async function listCategories():Promise<Category[]>{const {DB:db}=await getCloudflareEnv();const {results=[]}=await db.prepare(`SELECT c.id,COALESCE(en.name,'') nameEn,COALESCE(km.name,'') nameKm,c.status,COUNT(mi.id) itemCount FROM categories c LEFT JOIN category_translations en ON en.category_id=c.id AND en.locale='en' LEFT JOIN category_translations km ON km.category_id=c.id AND km.locale='km-KH' LEFT JOIN menu_items mi ON mi.category_id=c.id AND mi.status!='archived' WHERE c.restaurant_id=? AND c.status!='archived' GROUP BY c.id ORDER BY c.display_order`).bind(restaurantId).all<Category>();return results.map(r=>({...r,status:r.status==='active'?'active':'inactive',itemCount:Number(r.itemCount)}))}
export async function createCategory(input:{nameEn:string;nameKm:string}){const {DB:db}=await getCloudflareEnv();const categoryId=crypto.randomUUID();const now=timestamp();await db.batch([db.prepare("INSERT INTO categories (id,restaurant_id,status,display_order,created_at,updated_at) VALUES (?,?,'active',999,?,?)").bind(categoryId,restaurantId,now,now),db.prepare("INSERT INTO category_translations (category_id,locale,name) VALUES (?,'en',?),(?,'km-KH',?)").bind(categoryId,input.nameEn,categoryId,input.nameKm)]);return {id:categoryId}}

export type Schedule={id:string;name:string;status:"active"|"inactive";priority:number;windows:string;itemCount:number};
export async function listSchedules():Promise<Schedule[]>{const {DB:db}=await getCloudflareEnv();const {results=[]}=await db.prepare(`SELECT s.id,s.name,s.status,s.priority,GROUP_CONCAT(DISTINCT printf('%d:%d-%d:%d',w.iso_weekday,w.start_minute,w.iso_weekday+w.end_day_offset,w.end_minute)) windows,COUNT(DISTINCT si.menu_item_id) itemCount FROM menu_schedules s LEFT JOIN schedule_windows w ON w.schedule_id=s.id LEFT JOIN schedule_items si ON si.schedule_id=s.id WHERE s.restaurant_id=? AND s.status!='archived' GROUP BY s.id ORDER BY s.priority DESC,s.name`).bind(restaurantId).all<Schedule>();return results.map(r=>({...r,status:r.status==='active'?'active':'inactive',priority:Number(r.priority),itemCount:Number(r.itemCount),windows:r.windows??''}))}
export async function createSchedule(input:{name:string;startMinute:number;endMinute:number;days:number[];itemIds:string[]}){const {DB:db}=await getCloudflareEnv();const scheduleId=crypto.randomUUID(),now=timestamp();const statements=[db.prepare("INSERT INTO menu_schedules (id,restaurant_id,branch_id,name,status,priority,created_at,updated_at) VALUES (?,?,'branch-main',?,'active',0,?,?)").bind(scheduleId,restaurantId,input.name,now,now),...input.days.map(day=>db.prepare("INSERT INTO schedule_windows (id,schedule_id,iso_weekday,start_minute,end_minute,end_day_offset) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(),scheduleId,day,input.startMinute,input.endMinute,input.endMinute<=input.startMinute?1:0)),...input.itemIds.map((itemId,index)=>db.prepare("INSERT INTO schedule_items (schedule_id,menu_item_id,display_order) VALUES (?,?,?)").bind(scheduleId,itemId,index))];await db.batch(statements);return{id:scheduleId}}

export type StaffUser={id:string;email:string;displayName:string;role:"owner"|"manager"|"editor"|"viewer";status:"invited"|"active"|"suspended"};
export async function listStaffUsers():Promise<StaffUser[]>{const {DB:db}=await getCloudflareEnv();const {results=[]}=await db.prepare("SELECT id,email,display_name displayName,role,status FROM staff_users WHERE restaurant_id=? ORDER BY role,email").bind(restaurantId).all<StaffUser>();return results}
export async function createStaffUser(input:Omit<StaffUser,"id"|"status">){const {DB:db}=await getCloudflareEnv();const now=timestamp(),userId=crypto.randomUUID();await db.batch([db.prepare("INSERT INTO staff_users (id,restaurant_id,email,display_name,role,status,created_at,updated_at) VALUES (?,?,?,?,?,'invited',?,?)").bind(userId,restaurantId,input.email.toLowerCase(),input.displayName,input.role,now,now),db.prepare("INSERT INTO audit_events (id,restaurant_id,action,entity_type,entity_id,metadata_json,created_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),restaurantId,'staff.invited','staff_user',userId,JSON.stringify({email:input.email,role:input.role}),now)]);return{id:userId}}

export type MediaAsset={id:string;key:string;mimeType:string;byteSize:number;createdAt:number};
export async function listMedia():Promise<MediaAsset[]>{const {DB:db}=await getCloudflareEnv();const {results=[]}=await db.prepare("SELECT id,r2_key key,mime_type mimeType,byte_size byteSize,created_at createdAt FROM media_assets WHERE restaurant_id=? AND status='ready' ORDER BY created_at DESC").bind(restaurantId).all<MediaAsset>();return results.map(r=>({...r,byteSize:Number(r.byteSize),createdAt:Number(r.createdAt)}))}
export async function saveMedia(file:File){const {DB:db,BUCKET}=await getCloudflareEnv();const allowed=['image/jpeg','image/png','image/webp'];if(!allowed.includes(file.type)||file.size>5*1024*1024)throw new Error('Use a JPG, PNG, or WebP image smaller than 5 MB.');const mediaId=crypto.randomUUID(),now=timestamp(),extension=file.type.split('/')[1];const key=`restaurants/${restaurantId}/media/${mediaId}.${extension}`;await BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type},customMetadata:{restaurantId}});await db.prepare("INSERT INTO media_assets (id,restaurant_id,r2_key,mime_type,byte_size,status,created_at,updated_at) VALUES (?,?,?,?,?,'ready',?,?)").bind(mediaId,restaurantId,key,file.type,file.size,now,now).run();return{id:mediaId,key,mimeType:file.type,byteSize:file.size,createdAt:now}}

export async function deleteMedia(mediaId: string): Promise<boolean> {
	const { DB: db, BUCKET } = await getCloudflareEnv();
	const asset = await db
		.prepare("SELECT r2_key FROM media_assets WHERE id=? AND restaurant_id=?")
		.bind(mediaId, restaurantId)
		.first<{ r2_key: string }>();
	if (!asset) return false;

	try {
		await BUCKET.delete(asset.r2_key);
	} catch (e) {
		console.error("Failed to delete R2 object", e);
	}

	await db.batch([
		db.prepare("DELETE FROM menu_item_media WHERE media_asset_id=?").bind(mediaId),
		db.prepare("DELETE FROM media_assets WHERE id=? AND restaurant_id=?").bind(mediaId, restaurantId),
	]);
	return true;
}


export async function listAvailability(){const {DB:db}=await getCloudflareEnv();const {results=[]}=await db.prepare(`SELECT mi.id,COALESCE(t.name,'Unnamed item') name,COALESCE(a.state,'available') state FROM menu_items mi LEFT JOIN menu_item_translations t ON t.menu_item_id=mi.id AND t.locale='en' LEFT JOIN item_availability a ON a.menu_item_id=mi.id AND a.branch_id='branch-main' WHERE mi.restaurant_id=? AND mi.status='active' ORDER BY mi.display_order`).bind(restaurantId).all<{id:string;name:string;state:'available'|'sold_out'}>();return results}
export async function setAvailability(itemId:string,state:'available'|'sold_out'){const {DB:db}=await getCloudflareEnv();const exists=await db.prepare("SELECT id FROM menu_items WHERE id=? AND restaurant_id=?").bind(itemId,restaurantId).first();if(!exists)return null;await db.prepare("INSERT INTO item_availability (menu_item_id,branch_id,state,updated_at) VALUES (?,'branch-main',?,?) ON CONFLICT(menu_item_id,branch_id) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at").bind(itemId,state,timestamp()).run();return {id:itemId,state}}
