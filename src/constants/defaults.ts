import { PresentationSlot } from '../types/slot';

export const TOTAL_TEAM_MEMBERS = 7;
export const TOTAL_SLOTS = 30;

export const NATURE_RESERVES = [
  'محمية رأس محمد',
  'محمية الزرانيق وسبخة البردويل',
  'محمية الأحراش',
  'محمية العميد',
  'محمية علبة',
  'محمية سالوجا وغزال',
  'محمية سانت كاترين',
  'محمية أشتوم الجميل وجزيرة تنيس',
  'محمية بحيرة قارون',
  'محمية وادي الريان',
  'محمية وادي العلاقي',
  'محمية وادي الأسيوطي',
  'محمية قبة الحسنة',
  'محمية الغابة المتحجرة',
  'محمية كهف وادي سنور',
  'محمية نبق',
  'محمية أبو جالوم',
  'محمية طابا',
  'محمية البرلس',
  'محمية جزر نهر النيل',
  'محمية وادي دجلة',
  'محمية سيوة',
  'محمية الصحراء البيضاء',
  'محمية وادي الجمال - حماطة',
  'محمية الجزر الشمالية للبحر الأحمر',
  'محمية الجلف الكبير',
  'محمية الدبابية',
  'محمية السلوم',
  'محمية الواحات البحرية',
  'محمية نيزك جبل كامل',
];

export const INITIAL_SLOTS: PresentationSlot[] = NATURE_RESERVES.map((title, i) => ({
  id: i + 1,
  title,
  is_booked: false,
  booked_at: null,
  team_id: null,
}));

export const STORAGE_KEYS = {
  TEAMS: 'presentation_teams_v2',
  SLOTS: 'presentation_slots_v2',
  ACTIVE_TEAM_PIN: 'active_team_pin',
  ADMIN_TOKEN: 'admin_authenticated',
};
