# خطة التنفيذ المعمارية: منصة إدارة وحجز عروض الفرق (Team Presentation Booking Platform)

## 1. ملخص النظام ونطاق العمل
نظام ويب تفاعلي عالي الأداء ومنظم لإدارة 10 فرق طلابية/عملية، حيث يتكون كل فريق من 7 أفراد (قائد الفريق + 6 أعضاء). يتيح النظام لقائد الفريق تسجيل الأسماء، الحصول على رمز تعريف مميز مكون من 6 أرقام (PIN)، ثم الدخول لحجز أحد أدوار العرض الـ 10 ("بريزنتيشن 1" إلى "بريزنتيشن 10") بنظام الأسبقية اللحظي (Real-time Booking). ترتبط هوية الفريق برقم الدور المحجوز تلقائياً. تتضمن المنصة لوحة تحكم كاملة للمشرف (Admin) بصلاحيات شاملة لتعديل البيانات، إدارة الحجوزات، والتصدير.

---

## 2. البنية المعمارية ومكونات النظام (Architecture & Tech Stack)
- **إطار العمل والواجهة:** React 18 + Vite + TypeScript.
- **التصميم وتجربة الاستخدام:** Tailwind CSS + Tokens من نظام `ui-ux-vault` + مكتبة الأيقونات الرسمية `lucide-react` (مع الالتزام الصارم بمنع استخدام الرموز التعبيرية Emojis).
- **التزامن وقاعدة البيانات:** Supabase (PostgreSQL Database + Realtime Channels via WebSockets).
- **إدارة الحالة:** Zustand / React Context مع دعم Optimistic Updates واستجابة فورية أقل من 100ms.
- **الحماية والأمان:** تشفير جلسة الأدمن عبر Local Storage + Hash Verification، وحماية عمليات الحجز لمنع التضارب (Race Conditions).

---

## 3. مخطط قاعدة البيانات (Database Schema - Supabase PostgreSQL)

### جدول `presentation_slots`:
- `id`: INT (1 to 10) - Primary Key
- `title`: TEXT ('بريزنتيشن 1' ... 'بريزنتيشن 10')
- `is_booked`: BOOLEAN (Default: false)
- `booked_at`: TIMESTAMPTZ (Nullable)
- `team_id`: UUID (Foreign Key to teams.id, Nullable, Unique)

### جدول `teams`:
- `id`: UUID (Primary Key, Default: gen_random_uuid())
- `pin_code`: VARCHAR(6) (Unique, Not Null) - الرمز السري المكون من 6 أرقام
- `slot_number`: INT (Nullable, Foreign Key to presentation_slots.id)
- `created_at`: TIMESTAMPTZ (Default: now())

### جدول `team_members`:
- `id`: UUID (Primary Key, Default: gen_random_uuid())
- `team_id`: UUID (Foreign Key to teams.id, On Delete Cascade)
- `full_name`: TEXT (Not Null)
- `is_leader`: BOOLEAN (Default: false)
- `member_order`: INT (1 to 7)

### جدول `system_settings`:
- `key`: TEXT (Primary Key)
- `value`: TEXT

---

## 4. مراحل التنفيذ وخطوات العمل التفصيلية

### المرحلة الأولى: إعداد بيئة العمل وهيكل المشروع (Scaffolding & Clean Architecture)
1. إنشاء مشروع Vite + React + TypeScript في المجلد الجذر.
2. تهيئة Tailwind CSS وإعداد رموز الألوان ونظام المقاسات المستمد من `D:\downloads\ui-ux-vault`.
3. تثبيت المكتبات الأساسية:
   - `lucide-react` للأيقونات الهندسية.
   - `@supabase/supabase-js` للاتصال وقنوات الـ Realtime.
   - `canvas-confetti` (تأثير بصري راقٍ عند نجاح الحجز).
4. إنشاء ملف `project_architecture.md` لتوثيق هيكل الملفات بالكامل.

### المرحلة الثانية: محرك قاعدة البيانات وسكريبت الـ Realtime
1. صياغة ملف `supabase_schema.sql` متكامل يحتوي على:
   - إنشاء الجداول والفهارس (Indexes).
   - تفعيل الـ Realtime Replication على الجداول (`presentation_slots`, `teams`, `team_members`).
   - دالة محكمة لمنع حجز نفس الـ Slot لأكثر من فريق بالتزامن (Atomic Transaction Function).
2. إعداد طبقة الاتصال وقاعدة البيانات البديلة (Mock/Offline Fallback Provider) لضمان استمرارية عمل وتجربة التطبيق قبل إدخال مفاتيح Supabase.

### المرحلة سوم: تدفق تسجيل الفريق (Team Registration Flow)
1. واجهة تسجيل متناسقة تسمح لليدر بإدخال:
   - اسم قائد الفريق (Member 1).
   - أسماء الأعضاء الستة الآخرين (Members 2 to 7).
2. التحقق الفوري (Client-side Validation) لضمان عدم وجود حقول فارغة أو مكررة.
3. إنشاء الفريق وتوليد رمز الـ 6 أرقام (PIN Code) وعرضه بتصميم أمان راقٍ مع زر نسخ وتأكيد.
4. التوجيه المباشر أو الانتقال التلقائي لشاشة الدخول للحجز.

### المرحلة الرابعة: بوابة الحجز اللحظي (Real-time Slot Booking System)
1. شاشة تسجيل الدخول بواسطة الـ PIN Code.
2. فحص حالة الفريق:
   - إذا كان قد حجز بالفعل: تظهر له بطاقة تأكيد الحجز برقم وموعد البريزنتيشن وتفاصيل فريقه.
   - إذا لم يحجز: ينتقل لشبكة حجز الـ 10 أدوار.
3. شبكة تفاعلية للأدوار الـ 10 ("بريزنتيشن 1" حتى "بريزنتيشن 10"):
   - عرض حالة كل دور (متاح / محجوز لفريق آخر / محجوز لك).
   - التحديث الفوري المباشر عبر WebSocket بمجرد حجز أي دور من أي جهاز دون إعادة تحميل الصفحة.
   - تأكيد الحجز بضغطة زر وتثبيت الاسم تلقائياً ("تيم X").

### المرحلة الخامسة: لوحة تحكم المشرف (Admin Dashboard)
1. بوابة دخول مؤمنة للأدمن بكلمة مرور مشفرة.
2. شاشة مراقبة لحظية بنظام Live Grid تعرض الـ 10 أدوار وحالة كل دور.
3. جدول تفاعلي للفرق والأعضاء السبعة لكل فريق مع كود الـ PIN الخاص بهم.
4. أدوات تحكم إدارية كاملة:
   - إلغاء حجز دور (Release Slot).
   - تعديل أسماء الأعضاء والقائد.
   - إعادة تعيين رمز الدخول (Reset PIN).
   - حذف فريق بالكامل.
   - تصفير النظام (Reset All Data) للمناسبات الجديدة.
5. ميزة التصدير المباشر: تصدير بيانات الفرق وتوزيع البريزنتيشن بالكامل إلى ملف Excel / CSV.

### المرحلة السادسة: صقل واجهة المستخدم وتجربة الاستخدام (UI/UX Pro Polish)
1. تطبيق خط تجوال عربي حديث متناسق ومريح للقراءة.
2. تدرجات إضاءة خلفية احترافية ومؤثرات حركية خفيفة بدون أي بطء.
3. التجاوب الكامل مع الهواتف الذكية، الأجهزة اللوحية، وشاشات العرض الكبيرة.

---

## 5. مخرجات التوثيق والاختبار
- كود معياري نظيف بنظام المكونات المستقلة (Clean Architecture).
- ملف إرشادات الربط مع Supabase (`supabase_setup_guide.md`).
- ملف خريطة المشروع (`project_architecture.md`).
