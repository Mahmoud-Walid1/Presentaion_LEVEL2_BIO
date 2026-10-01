-- ============================================================================
-- سكريبت إنشاء قاعدة بيانات منصة حجز عروض الفرق (المحميات الطبيعية - 30 محمية)
-- يتضمن ترقيم الفرق حسب أسبقية الحجز (تيم 1، تيم 2 ... تيم 10)
-- ============================================================================

-- 1. جدول أدوار العروض التقديمية (Presentation Slots)
CREATE TABLE IF NOT EXISTS public.presentation_slots (
    id INT PRIMARY KEY,
    title TEXT NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE NOT NULL,
    booked_at TIMESTAMPTZ,
    team_id UUID
);

-- 2. جدول الفرق (Teams)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_code VARCHAR(6) UNIQUE NOT NULL,
    slot_number INT UNIQUE REFERENCES public.presentation_slots(id) ON DELETE SET NULL,
    team_number INT, -- رقم الفريق حسب أسبقية الحجز (تيم 1، تيم 2 ...)
    booked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.presentation_slots 
    DROP CONSTRAINT IF EXISTS fk_slot_team;

ALTER TABLE public.presentation_slots
    ADD CONSTRAINT fk_slot_team FOREIGN KEY (team_id) 
    REFERENCES public.teams(id) ON DELETE SET NULL;

-- 3. جدول أعضاء الفرق (Team Members)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    is_leader BOOLEAN DEFAULT FALSE NOT NULL,
    member_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. إدراج المحميات الـ 30
INSERT INTO public.presentation_slots (id, title, is_booked)
VALUES 
    (1, 'محمية رأس محمد', false),
    (2, 'محمية الزرانيق وسبخة البردويل', false),
    (3, 'محمية الأحراش', false),
    (4, 'محمية العميد', false),
    (5, 'محمية علبة', false),
    (6, 'محمية سالوجا وغزال', false),
    (7, 'محمية سانت كاترين', false),
    (8, 'محمية أشتوم الجميل وجزيرة تنيس', false),
    (9, 'محمية بحيرة قارون', false),
    (10, 'محمية وادي الريان', false),
    (11, 'محمية وادي العلاقي', false),
    (12, 'محمية وادي الأسيوطي', false),
    (13, 'محمية قبة الحسنة', false),
    (14, 'محمية الغابة المتحجرة', false),
    (15, 'محمية كهف وادي سنور', false),
    (16, 'محمية نبق', false),
    (17, 'محمية أبو جالوم', false),
    (18, 'محمية طابا', false),
    (19, 'محمية البرلس', false),
    (20, 'محمية جزر نهر النيل', false),
    (21, 'محمية وادي دجلة', false),
    (22, 'محمية سيوة', false),
    (23, 'محمية الصحراء البيضاء', false),
    (24, 'محمية وادي الجمال - حماطة', false),
    (25, 'محمية الجزر الشمالية للبحر الأحمر', false),
    (26, 'محمية الجلف الكبير', false),
    (27, 'محمية الدبابية', false),
    (28, 'محمية السلوم', false),
    (29, 'محمية الواحات البحرية', false),
    (30, 'محمية نيزك جبل كامل', false)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 5. الدالة الذرية لمنع التضارب وحساب ترتيب الحجز تلقائياً
CREATE OR REPLACE FUNCTION public.book_presentation_slot(p_team_id UUID, p_slot_number INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_slot INT;
    v_is_slot_booked BOOLEAN;
    v_booked_count INT;
    v_new_team_number INT;
    v_now TIMESTAMPTZ := now();
BEGIN
    SELECT slot_number INTO v_current_slot FROM public.teams WHERE id = p_team_id;
    IF v_current_slot IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'الفريق قام بحجز موضوع مسبقاً');
    END IF;

    SELECT is_booked INTO v_is_slot_booked 
    FROM public.presentation_slots 
    WHERE id = p_slot_number 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'المحمية غير مسجلة بالنظام');
    END IF;

    IF v_is_slot_booked THEN
        RETURN jsonb_build_object('success', false, 'message', 'عذراً، هذه المحمية تم حجزها للتو من فريق آخر');
    END IF;

    -- حساب كم فريق حجز قبلك لتحديد رقم الفريق
    SELECT count(*) INTO v_booked_count FROM public.teams WHERE slot_number IS NOT NULL;
    v_new_team_number := v_booked_count + 1;

    UPDATE public.presentation_slots 
    SET is_booked = true, team_id = p_team_id, booked_at = v_now
    WHERE id = p_slot_number;

    UPDATE public.teams
    SET slot_number = p_slot_number, team_number = v_new_team_number, booked_at = v_now
    WHERE id = p_team_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'تم تأكيد حجز موضوع البريزنتيشن بنجاح! أصبحتم رسمياً: تيم ' || v_new_team_number, 
        'slot_number', p_slot_number,
        'team_number', v_new_team_number
    );
END;
$$;

-- 6. سياسات RLS
ALTER TABLE public.presentation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read slots" ON public.presentation_slots FOR SELECT USING (true);
CREATE POLICY "Allow public update slots" ON public.presentation_slots FOR UPDATE USING (true);
CREATE POLICY "Allow public all teams" ON public.teams FOR ALL USING (true);
CREATE POLICY "Allow public all members" ON public.team_members FOR ALL USING (true);

-- 7. Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.presentation_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
