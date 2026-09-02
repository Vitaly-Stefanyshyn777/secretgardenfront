import api from "./api";
import {
  getLocaleHeaders,
  localizeCategoryRecord,
  localizeProductRecord,
} from "./localizedContent";
import { getAgeVerificationHeaders } from "./ageVerification";
import { resolveProductSlugParam } from "./slugUtils";

function getCatalogHeaders(): Record<string, string> {
  return { ...getLocaleHeaders(), ...getAgeVerificationHeaders() };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Новий Node бекенд для REST /auth, /user, /catalog (з глобальним префіксом /api)
const NODE_API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api`;

// Динамічні фільтри категорії (Виробник, Тип, Матеріал тощо)
export interface CatalogFilterValue {
  value: string;
  slug: string;
}

export interface CatalogFilter {
  name: string;
  slug: string;
  values: CatalogFilterValue[];
  order?: number;
}

// Категорії каталогу нового бекенду
export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: CatalogCategory[];
  filters?: CatalogFilter[];
}

export async function fetchCatalogCategories(): Promise<CatalogCategory[]> {
  const res = await fetch(`${NODE_API_BASE_URL}/catalog/categories`, {
    cache: "no-store",
    headers: getLocaleHeaders(),
  });
  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    throw new Error(`Failed to fetch catalog categories: ${res.status}`);
  }
  const data = (await res.json()) as CatalogCategory[];
  return (Array.isArray(data) ? data : []).map((c) =>
    localizeCategoryRecord(c as CatalogCategory & Record<string, unknown>),
  ) as CatalogCategory[];
}

export type FaqCategory = {
  id: number;
  name: string;
  slug: string;
};

export type FaqItem = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  acf?: {
    question?: string; // Питання
    answer?: string; // Відповідь
  };
  faq_category?: number[];
  faq_type?: number[]; // Альтернативна назва поля
};

export type EventPost = {
  id: number;
  date?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  // Нові поля з acf
  acf?: {
    // Нові поля
    city?: string;
    location?: string;
    description?: string;
    // image може бути рядком, масивом або об'єктом з desctop/mobile
    image?:
      | string
      | string[]
      | {
          desctop?: string;
          mobile?: string;
        };
    photo?: string | string[];
    banner?: string | string[];
    img_link_data_banner?: string | string[]; // Поле для зображення (може бути JSON рядок або масив)
    // Старі поля (для fallback)
    input_text_city?: string;
    input_text_location?: string;
    textarea_description?: string;
    // hl_data_result - може бути масив або JSON-рядок (нова структура)
    hl_data_result?:
      | Array<{
          title?: string;
          svg_code?: string;
          hl_input_text_text?: string;
          hl_img_svg_icon?: string;
        }>
      | string;
    // hl_data_schedule - може бути масив або JSON-рядок (нова структура)
    hl_data_schedule?:
      | Array<{
          date?: string;
          time?: string;
          hl_input_date_date?: string;
          hl_input_time_time?: string;
        }>
      | string;
  };
};

export type MainCoursePost = {
  id: number;
  title?: { rendered?: string };
  // Деякі поля можуть приходити як на верхньому рівні, так і в ACF
  Is_online?: number | string;
  Price?: string | number;
  Price_old?: string | number;
  Discount?: string | number;
  Image?: string;
  featured_media?: number;
  About_course?: string[];
  Result?: {
    hl_input_text_text: string;
    hl_img_svg_icon: string;
  }[];
  Course_info?:
    | {
        опис?: string;
        description?: string;
      }
    | Record<string, unknown>;
  acf?: {
    Is_online?: number | string;
    Course_include?: string[];
    What_learn?: string[];
    Price?: string | number;
    Price_old?: string | number;
    About?: string;
    description?: string;
    Image?: string;
    Course_info?:
      | {
          опис?: string;
          description?: string;
        }
      | Record<string, unknown>;
  } & Record<string, unknown>;
};

export type CourseData = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  course_data: {
    Course_themes: string[];
    What_learn: string[];
    Course_include: string[];
    Course_program: Array<{
      hl_input_text_title: string;
      hl_input_text_lesson_count: string;
      hl_textarea_description: string;
      hl_textarea_themes: string;
    }>;
    Date_start: string | null;
    Duration: string | null;
    Blocks: string | null;
    Course_coach: {
      ID: number;
      title: string;
      input_text_experience: string;
      input_text_status: string;
      input_text_status_1: string;
      input_text_status_2: string;
      input_text_count_training: string;
      input_text_history: string;
      input_text_certificates: string;
      input_text_link_instagram: string;
      input_text_text_instagram: string;
      textarea_description: string;
      textarea_about_me: string;
      textarea_my_mission: string;
      img_link_avatar: string;
      point_specialization: string;
    } | null;
    Required_equipment: string | null;
    Online_lessons: string | null;
  };
};

async function safeFetch<T>(url: string): Promise<T> {
  // Якщо URL вже повний (починається з http), використовуємо його як є
  // Якщо URL відносний і починається з /api/, це Next.js API роут - використовуємо як є
  // Інакше додаємо BASE_URL для зовнішніх API
  const fullUrl =
    url.startsWith("http") || url.startsWith("/api/")
      ? url
      : `${BASE_URL}${url}`;

  try {
    const res = await fetch(fullUrl, { next: { revalidate: 60 } });
    if (!res.ok) {
      throw new Error(`Request failed ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as T;
  } catch (error: any) {
    // Обробка мережевих помилок, які не потребують повторних спроб
    if (
      error?.message?.includes("ERR_NETWORK_IO_SUSPENDED") ||
      error?.message?.includes("ERR_NETWORK_CHANGED") ||
      error?.name === "NetworkError" ||
      (error instanceof TypeError && error.message.includes("Failed to fetch"))
    ) {
      // Створюємо помилку з інформацією про тип помилки для React Query
      const networkError = new Error(
        "Network request suspended or network changed"
      );
      (networkError as any).name = "NetworkError";
      (networkError as any).isNetworkError = true;
      throw networkError;
    }
    // Для інших помилок - пробрасуємо далі
    throw error;
  }
}

export async function fetchFaqCategories(): Promise<FaqCategory[]> {
  return safeFetch<FaqCategory[]>(`/api/faq_category`);
}

export async function fetchFaqByCategory(
  categoryId?: number
): Promise<FaqItem[]> {
  const qs = categoryId ? `?faq_category=${categoryId}` : "";
  return safeFetch<FaqItem[]>(`/api/faq${qs}`);
}

// Функція для парсингу JSON рядків з meta_data
function parseMetaJson<T>(jsonString: string | undefined, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function fetchCourse(
  courseIdOrSlug?: number | string
): Promise<CourseData> {
  if (!courseIdOrSlug) {
    throw new Error("Course ID or slug is required");
  }

  // Якщо це число або числовий рядок, використовуємо як ID
  let wcCourse;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  if (
    typeof courseIdOrSlug === "number" ||
    /^\d+$/.test(String(courseIdOrSlug))
  ) {
    const wcResponse = await fetch(
      `${base}/api/catalog/products/${courseIdOrSlug}`
    );
    if (!wcResponse.ok) {
      throw new Error(`Failed to fetch course: ${wcResponse.status}`);
    }
    const raw = await wcResponse.json();
    wcCourse = raw?.data ?? raw;
  } else {
    const allCourses = (await fetchFilteredProducts({
      category: "72",
      per_page: 100,
    })) as Array<{ slug?: string; [k: string]: unknown }>;

    // Нормалізуємо slug: декодуємо URL-encoded значення та очищаємо від ____full____
    const normalizeSlug = (slug: string): string => {
      if (!slug) return "";
      try {
        // Спробуємо декодувати, якщо це encoded
        let decoded = slug;
        try {
          decoded = decodeURIComponent(slug);
        } catch {
          // Якщо не вдалося декодувати, використовуємо оригінал
          decoded = slug;
        }

        // Очищаємо від ____full____
        decoded = decoded.replace(/____full____/g, "");

        // Нормалізуємо: приводимо до нижнього регістру та прибираємо зайві пробіли
        return decoded.toLowerCase().trim();
      } catch {
        // Якщо виникла помилка, повертаємо як є
        return slug.toLowerCase().trim();
      }
    };

    // Next.js автоматично декодує slug з URL, тому courseIdOrSlug приходить декодованим
    const normalizedSlug = normalizeSlug(String(courseIdOrSlug));

    const course = allCourses.find((c) => {
      if (!c.slug) return false;

      // Нормалізуємо slug з API
      const normalizedCourseSlug = normalizeSlug(c.slug);

      // Порівнюємо нормалізовані значення
      const slugMatch =
        c.slug === String(courseIdOrSlug) || // Exact match
        normalizedCourseSlug === normalizedSlug || // Нормалізовані значення
        c.slug.toLowerCase() === String(courseIdOrSlug).toLowerCase() || // Case-insensitive
        normalizedCourseSlug === String(courseIdOrSlug).toLowerCase(); // Нормалізований API slug === URL slug

      return slugMatch;
    });

    if (!course) {
      throw new Error(`Course not found: ${courseIdOrSlug}`);
    }

    wcCourse = course;
  }

  // Витягуємо дані з ACF (з fallback на meta_data)
  const acf = wcCourse.acf || {};
  const metaData = wcCourse.meta_data || [];

  const getMetaValue = (key: string): string | undefined => {
    return metaData.find(
      (meta: { key: string; value: string }) => meta.key === key
    )?.value;
  };

  // Функція для отримання значення з ACF з fallback на meta_data
  const getAcfValue = (key: string) => {
    return acf[key] || getMetaValue(key);
  };

  // Функція для витягування масиву рядків з ACF (з fallback на meta_data)
  const extractStringArray = (acfData: unknown): string[] => {
    if (Array.isArray(acfData)) {
      // Якщо це ACF дані - витягуємо поле point з кожного об'єкта
      return acfData
        .map((item: any) => item?.point || item?.theme || item)
        .filter(Boolean);
    }
    // Fallback на meta_data парсинг
    return parseMetaJson<string[]>(acfData as string, []);
  };

  // Парсимо course_data з ACF (з fallback на meta_data)
  const courseThemes = extractStringArray(getAcfValue("cource_themes"));
  const whatLearn = extractStringArray(
    getAcfValue("point_data_course_what_learn")
  );
  const courseInclude = extractStringArray(
    getAcfValue("point_data_course_include")
  );
  const courseProgram = parseMetaJson<
    Array<{
      hl_input_text_title?: string;
      hl_input_text_lesson_count?: string;
      hl_textarea_description?: string;
      hl_textarea_themes?: string;
    }>
  >(getAcfValue("point_data_course_themes") as string, []);

  const dateStart = (getAcfValue("input_date_date_start") as string) || null;
  const duration = (getAcfValue("input_text_duration") as string) || null;
  const courseCoachData = getAcfValue("course_coach");
  const courseCoachId =
    typeof courseCoachData === "object" && courseCoachData?.ID
      ? String(courseCoachData.ID)
      : typeof courseCoachData === "string"
      ? courseCoachData
      : null;
  const requiredEquipment =
    (getAcfValue("required_equipment") as string) ||
    (getAcfValue("input_required_equipment") as string) ||
    null;

  // Отримуємо дані інструктора
  let courseCoach = null;
  if (typeof courseCoachData === "object" && courseCoachData?.ID) {
    // Якщо дані інструктора вже є, отримуємо також ACF дані
    try {
      const coachResponse = await fetch(
        `${BASE_URL}/api/trainers/${courseCoachData.ID}`
      );
      let coachAcf = {};
      if (coachResponse.ok) {
        const coachData = await coachResponse.json();
        coachAcf = coachData.acf || {};
      }

      courseCoach = {
        ID: courseCoachData.ID,
        title: courseCoachData.post_title || "",
        input_text_experience: (coachAcf as any).input_text_experience || "",
        input_text_status: (coachAcf as any).input_text_status || "",
        input_text_status_1: "",
        input_text_status_2: "",
        input_text_count_training:
          (coachAcf as any).input_text_count_training || "",
        input_text_history: (coachAcf as any).input_text_history || "",
        input_text_certificates:
          (coachAcf as any).input_text_certificates || "",
        input_text_link_instagram:
          ((coachAcf as any).instagram as any)?.url || "",
        input_text_text_instagram:
          ((coachAcf as any).instagram as any)?.title || "",
        textarea_description:
          (coachAcf as any).textarea_description ||
          courseCoachData.post_content ||
          "",
        textarea_about_me: (coachAcf as any).textarea_about_me || "",
        textarea_my_mission: (coachAcf as any).textarea_my_mission || "",
        img_link_avatar: (coachAcf as any).img_link_data_avatar || "",
        point_specialization: (() => {
          const specializations = Array.isArray(
            (coachAcf as any).point_data_specialization
          )
            ? (coachAcf as any).point_data_specialization
                .map((item: any) => item?.specialization || item?.point)
                .filter(Boolean)
            : [];
          return specializations.length > 0
            ? JSON.stringify(specializations)
            : "";
        })(),
      };
    } catch (error) {
      // Якщо не вдалося отримати ACF дані, використовуємо базові дані
      courseCoach = {
        ID: courseCoachData.ID,
        title: courseCoachData.post_title || "",
        input_text_experience: "",
        input_text_status: "",
        input_text_status_1: "",
        input_text_status_2: "",
        input_text_count_training: "",
        input_text_history: "",
        input_text_certificates: "",
        input_text_link_instagram: "",
        input_text_text_instagram: "",
        textarea_description: courseCoachData.post_content || "",
        textarea_about_me: "",
        textarea_my_mission: "",
        img_link_avatar: "",
        point_specialization: "",
      };
    }
  } else if (courseCoachId) {
    // Якщо є тільки ID, робимо запит для отримання даних
    try {
      const coachId = parseInt(courseCoachId);
      if (!isNaN(coachId)) {
        const coachResponse = await fetch(
          `${BASE_URL}/api/trainers/${coachId}`
        );
        if (coachResponse.ok) {
          const coachData = await coachResponse.json();
          const coachAcf = coachData.acf || {};
          // Отримуємо спеціалізації з ACF
          const specializations = Array.isArray(
            coachAcf.point_data_specialization
          )
            ? coachAcf.point_data_specialization
                .map((item: any) => item?.specialization || item?.point)
                .filter(Boolean)
            : [];

          courseCoach = {
            ID: coachId,
            title: coachData.title?.rendered || "",
            input_text_experience:
              (coachAcf.input_text_experience as string) || "",
            input_text_status: (coachAcf.input_text_status as string) || "",
            input_text_status_1: "",
            input_text_status_2: "",
            input_text_count_training:
              (coachAcf.input_text_count_training as string) || "",
            input_text_history: (coachAcf.input_text_history as string) || "",
            input_text_certificates:
              (coachAcf.input_text_certificates as string) || "",
            input_text_link_instagram:
              (coachAcf.instagram as { url?: string })?.url || "",
            input_text_text_instagram:
              (coachAcf.instagram as { title?: string })?.title || "",
            textarea_description:
              (coachAcf.textarea_description as string) || "",
            textarea_about_me: (coachAcf.textarea_about_me as string) || "",
            textarea_my_mission: (coachAcf.textarea_my_mission as string) || "",
            img_link_avatar: (coachAcf.img_link_data_avatar as string) || "",
            point_specialization:
              specializations.length > 0 ? JSON.stringify(specializations) : "",
          };
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[fetchCourse] Не вдалося завантажити дані інструктора:",
          error
        );
      }
    }
  }

  // Формуємо CourseData об'єкт
  const courseData: CourseData = {
    id: wcCourse.id,
    title: { rendered: wcCourse.name || "" },
    content: { rendered: wcCourse.description || "" },
    excerpt: { rendered: wcCourse.short_description || "" },
    featured_media: wcCourse.images?.[0]?.id || 0,
    course_data: {
      Course_themes: courseThemes,
      What_learn: whatLearn,
      Course_include: courseInclude,
      Course_program: courseProgram.map((p) => ({
        hl_input_text_title: p.hl_input_text_title || "",
        hl_input_text_lesson_count: p.hl_input_text_lesson_count || "",
        hl_textarea_description: p.hl_textarea_description || "",
        hl_textarea_themes: p.hl_textarea_themes || "",
      })),
      Date_start: dateStart,
      Duration: duration,
      Blocks: null,
      Course_coach: courseCoach,
      Required_equipment: requiredEquipment,
      Online_lessons: null,
    },
  };

  return courseData;
}

export async function fetchEvents(): Promise<EventPost[]> {
  return safeFetch<EventPost[]>(`/api/events`);
}

export async function fetchMainCourses(): Promise<MainCoursePost[]> {
  // Використовуємо спеціальний API route, який правильно обробляє адмін-токен
  const res = await fetch("/api/main-courses", {
    cache: "no-store",
    credentials: "include", // Важливо для передачі cookie
  });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as MainCoursePost[];
}

export type BannerPost = {
  id: number;
  title?: { rendered?: string };
  // Дозволяємо частину полів на верхньому рівні (WP ACF може віддавати їх саме так)
  Title?: string;
  Description?: string;
  Banner?: string;
  Banner_Mobile?: string;
  banner?: string;
  background?: string;
  Aside_video?: string | string[];
  Aside_photo?: string | string[];
  poster?: string | string[];
  video?: string | string[];
  video_url?: string | string[];
  image?: string | string[];
  acf?: {
    title?: string;
    title_sub?: string;
    description?: string;
    image?: {
      desctop?: string;
      mobile?: string;
    };
    video?:
      | {
          preview?: string;
          url?: string;
        }
      | string
      | string[];
    // Старі поля для зворотної сумісності
    Title?: string;
    Description?: string;
    Banner?: string;
    Banner_Mobile?: string;
    banner?: string;
    background?: string;
    Aside_video?: string | string[];
    Aside_photo?: string | string[];
    poster?: string | string[];
    video_url?: string | string[];
  } | null;
};

export async function fetchBanners(): Promise<BannerPost[]> {
  const res = await fetch("/api/banners", {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as BannerPost[];
}

// Видаляємо неіснуючі ендпоінти

export type ThemeSettingsPost = {
  id?: number;
  // Поля на верхньому рівні (згідно з API)
  input_text_phone?: string;
  input_text_schedule?: string;
  input_text_email?: string;
  input_text_address?: string;
  theme_video_url?: string;
  hl_data_contact?: Array<{
    hl_input_text_name?: string;
    hl_input_text_link?: string;
    hl_img_svg_icon?: string;
  }>;
  hl_data_gallery?: Array<{
    hl_img_link_photo?: string[];
  }>;
  map_markers?: Array<{
    title?: string;
    coordinates?: number[][];
  }>;
  user_city?: string[];
  user_country?: string[];
  // Fallback для старого формату (якщо дані в acf)
  acf?: {
    input_text_phone?: string;
    input_text_schedule?: string;
    input_text_email?: string;
    input_text_address?: string;
    theme_video_url?: string;
    hl_data_contact?: Array<{
      hl_input_text_name?: string;
      hl_input_text_link?: string;
      hl_img_svg_icon?: string;
    }>;
    hl_data_gallery?: Array<{
      hl_img_link_photo?: string[];
    }>;
    map_markers?: Array<{
      title?: string;
      coordinates?: number[][];
    }>;
    user_city?: string[];
    user_country?: string[];
  };
};

export async function fetchThemeSettings(): Promise<ThemeSettingsPost[]> {
  // Старі WP theme settings більше не використовуємо.
  // Повертаємо порожній масив, щоб не робити жодних proxy‑запитів.
  return [];
}

// Отримати проксований URL відео з налаштувань теми
export async function fetchThemeVideoUrl(): Promise<string | null> {
  // Без WP theme settings відео для інструкцій не підтягуємо.
  return null;
}

// Допоміжна функція для створення проксованого URL
export function createProxiedVideoUrl(originalUrl: string): string {
  return `/api/video-proxy?url=${encodeURIComponent(originalUrl)}`;
}

// Видаляємо неіснуючі ендпоінти calculator та board

export type CoursePost = {
  id: number;
  title: { rendered: string };
  acf?: {
    course_data?: {
      Course_themes?: string[];
      What_learn?: string[];
      Course_include?: string[];
      Course_program?: Array<{
        hl_input_text_title?: string;
        hl_input_text_lesson_count?: string;
        hl_textarea_description?: string;
        hl_textarea_themes?: string;
      }>;
      Date_start?: string;
      Duration?: string;
      Blocks?: string;
      Course_coach?: {
        ID?: number;
        first_name?: string;
        last_name?: string;
        avatar?: string;
        Experience?: string;
        Super_power?: string;
        Training_conducted?: string;
        Stories_of_transformations?: string;
        Social_media?: {
          telegram?: string;
          phone?: string;
          instagram?: string;
        };
      };
      Required_equipment?: string;
      Online_lessons?: string;
    };
    Is_online?: number;
  };
};

export async function fetchCourses(): Promise<CoursePost[]> {
  return safeFetch<CoursePost[]>(`/api/main-courses`);
}

export type InstructorPost = {
  id: number;
  title: { rendered: string };
  acf?: {
    // Поля для тренерів (з профілю)
    position?: string;
    experience?: string;
    location_city?: string;
    location_country?: string;
    social_phone?: string;
    social_telegram?: string;
    social_instagram?: string;
    boards?: string;
    super_power?: string;
    gallery?: string;
    certificate?: string[];
    avatar?: string;
    favourite_exercise?: string[];
    my_specialty?: string[];
    my_experience?: Array<{
      hl_input_text_gym?: string;
      hl_input_date_date_start?: string;
      hl_input_date_date_end?: string;
      hl_textarea_ex_description?: string;
    }>;
    my_wlocation?: Array<{
      hl_input_text_title?: string;
      hl_input_text_email?: string;
      hl_input_text_phone?: string;
      hl_input_text_schedule_five?: string;
      hl_input_text_schedule_two?: string;
      hl_input_text_address?: string;
      hl_input_text_coord_lat?: string;
      hl_input_text_coord_ln?: string;
      coord_lat?: string;
      coord_lng?: string;
      latitude?: string | number;
      longitude?: string | number;
      lat?: string | number;
      lng?: string | number;
    }>;
    // Нові поля для інструкторів (Засновниця BFB, Люди які створюють BFB)
    input_text_status?: string;
    img_link_data_avatar?: string;
    input_text_experience?: string;
    input_text_count_training?: string;
    input_text_certificates?: string;
    input_text_history?: string;
    textarea_about_me?: string;
    textarea_description?: string;
    textarea_my_mission?: string;
    instagram?: {
      title?: string;
      url?: string;
      target?: string;
    };
    point_data_specialization?: Array<{
      specialization?: string;
    }>;
    points?: Array<{
      point?: string;
    }>;
  };
};

export async function fetchInstructor(id: number): Promise<InstructorPost> {
  return safeFetch<InstructorPost>(`/api/trainers/${id}`);
}

export type CasePost = {
  id: number;
  title?: { rendered?: string };
  acf?: {
    img_link_data_avatar?: string;
    instagram?: {
      title?: string;
      url?: string;
      target?: string;
    };
    textarea_description?: string;
  };
  // Старі поля для сумісності
  Avatar?: string;
  Text_instagram?: string;
  Description?: string;
};

export async function fetchCases(): Promise<CasePost[]> {
  return safeFetch<CasePost[]>(`/api/cases`);
}

export type TariffPost = {
  id: number;
  title: { rendered: string };
  acf?: {
    tariff_name?: string;
    tariff_price?: string;
    tariff_discount?: string;
    tariff_period?: string;
    tariff_features?: string[];
    tariff_popular?: boolean;
    tariff_popular_text?: string;
  };
};

export type UserCategoryPost = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
};

export async function fetchUserCategories(): Promise<UserCategoryPost[]> {
  return safeFetch<UserCategoryPost[]>(`/api/user-category`);
}

export type ApplicationData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  type: "question" | "training";
};

export async function submitApplication(
  data: ApplicationData
): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint =
      data.type === "question"
        ? "/api/applications/question"
        : "/api/applications/training";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    return { success: true, message: "Заявка успішно відправлена" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося відправити заявку");
  }
}

export async function submitContactQuestion(payload: {
  name: string;
  email?: string;
  phone?: string;
  nickname?: string;
  question?: string;
}) {
  const endpoint = `/api/applications/question`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export type PurchasedProduct = {
  id: number;
  name: string;
  price: string;
  image: string;
  purchase_date: string;
  status: string;
  telegram_link?: string;
};

export type PurchasedProductApiItem = {
  product_id: number;
  name?: string;
  image?: string;
  categories?: string[];
  purchase_date?: string;
  price_paid?: number;
  currency?: string;
  link_telegram?: string;
  order_id?: number;
};

export type Tariff = {
  id: number;
  title: { rendered: string };
  Price: string;
  Time: string;
  Points: Array<{
    Статус: string;
    Текст: string;
  }>;
};

export async function fetchTariffs(): Promise<Tariff[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/tariff`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити тарифи");
  }
}

export async function fetchPurchasedProductsApi(
  userId: number,
  token?: string
): Promise<Record<string, PurchasedProductApiItem>> {
  try {
    if (!Number.isFinite(userId) || userId <= 0) {
      return {};
    }
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BASE_URL}/api/user/purchased-products?user_id=${userId}&product_list=true`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити придбані курси");
  }
}

export async function fetchPurchasedProducts(
  userId: number,
  token?: string
): Promise<PurchasedProduct[]> {
  try {
    // Отримуємо список придбаних продуктів з API
    const purchasedItems = await fetchPurchasedProductsApi(userId, token);

    // Для кожного product_id отримуємо повну інформацію про продукт
    const purchasedProducts: PurchasedProduct[] = [];

    for (const item of Object.values(purchasedItems)) {
      try {
        const apiItem = item as PurchasedProductApiItem;

        // Отримуємо інформацію про продукт з WooCommerce API для додаткових даних
        const productResponse = await fetch(
          `${BASE_URL}/api/catalog/products/${apiItem.product_id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (productResponse.ok) {
          const productData = await productResponse.json();

          purchasedProducts.push({
            id: productData.id,
            name: apiItem.name || productData.name,
            price: productData.price,
            image: apiItem.image || productData.images?.[0]?.src || "",
            purchase_date: apiItem.purchase_date || new Date().toISOString(),
            status: "completed",

            telegram_link: apiItem.link_telegram,
          });
        }
      } catch (error) {
        // Якщо не вдалося отримати інформацію про продукт, пропускаємо його
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `Не вдалося отримати інформацію про продукт ${
              (item as PurchasedProductApiItem).product_id
            }:`,
            error
          );
        }
      }
    }

    return purchasedProducts;
  } catch (error) {
    console.error("Помилка при отриманні придбаних продуктів:", error);
    throw error;
  }
}

// Типи для інформації про підписку користувача
export interface UserSubscription {
  hasActivePlan: boolean;
  currentPlan?: {
    id: number;
    name: string;
    price: string;
    period: string;
    nextPaymentDate?: string;
    features: string[];
    status: "active" | "inactive" | "cancelled";
  };
  subscriptionHistory?: Array<{
    id: number;
    planName: string;
    price: string;
    period: string;
    purchaseDate: string;
    status: string;
  }>;
  paymentHistory?: Array<{
    id: number;
    date: string;
    description: string;
    amount: string;
    status: string;
  }>;
}

export async function fetchUserSubscription(
  userId: number,
  token?: string
): Promise<UserSubscription> {
  try {
    if (!Number.isFinite(userId) || userId <= 0) {
      return { hasActivePlan: false };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const userResponse = await fetch(
      `${BASE_URL}/api/user/profile/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!userResponse.ok) {
      // Якщо не вдалося отримати дані користувача, повертаємо порожній результат
      return { hasActivePlan: false };
    }

    const userData = await userResponse.json();
    const userMeta = userData.meta || {};

    // Отримуємо інформацію про активну підписку з мета-даних
    const activePlanId =
      userMeta.active_tariff_id || userMeta.subscription_plan_id;
    const nextPaymentDate =
      userMeta.next_payment_date || userMeta.subscription_next_payment;

    let currentPlan: UserSubscription["currentPlan"];

    if (activePlanId) {
      // Якщо є активний план, отримуємо його деталі
      try {
        const tariffs = await fetchTariffs();
        const activeTariff = tariffs.find(
          (t) => t.id === parseInt(activePlanId)
        );

        if (activeTariff) {
          currentPlan = {
            id: activeTariff.id,
            name: activeTariff.title.rendered,
            price: activeTariff.Price,
            period: `${activeTariff.Time} місяців`,
            nextPaymentDate: nextPaymentDate,
            features: activeTariff.Points.map((p) => p.Текст),
            status: "active",
          };
        }
      } catch (error) {
        // Якщо не вдалося отримати тариф, продовжуємо без деталей плану
        console.warn("Не вдалося отримати деталі тарифу:", error);
      }
    }

    // Отримуємо історію платежів та підписок (замовлень)
    let paymentHistory: UserSubscription["paymentHistory"] = [];
    let subscriptionHistory: UserSubscription["subscriptionHistory"] = [];

    try {
      const orders = await fetchUserOrders(userId);

      const hasOrderMetaKey = (order: WooCommerceOrder, key: string) =>
        Array.isArray(order?.meta_data) &&
        order.meta_data.some((m) => m?.key === key);

      // Відповідно до бекенд-документації: підписка маркується мета-ключем _subscription_tariff_id
      const subscriptionOrders = orders.filter((order) =>
        hasOrderMetaKey(order, "_subscription_tariff_id")
      );

      // Створюємо історію підписок
      subscriptionHistory = subscriptionOrders.map((order) => {
        const subscriptionItem = order.line_items?.[0];

        return {
          id: order.id,
          planName: subscriptionItem?.name || "Тариф",
          price: subscriptionItem?.total || order.total,
          period: "1 місяць", // Можна отримати з мета-даних товару
          purchaseDate: new Date(order.date_created).toLocaleDateString(
            "uk-UA"
          ),
          status: order.status,
        };
      });

      // Створюємо історію платежів (всі замовлення)
      paymentHistory = orders.slice(0, 10).map((order) => ({
        id: order.id,
        date: new Date(order.date_created).toLocaleDateString("uk-UA"),
        description: order.line_items.map((item) => item.name).join(", "),
        amount: order.total,
        status: order.status,
      }));
    } catch (error) {
      // Якщо не вдалося отримати історію платежів, продовжуємо без неї
      console.warn("Не вдалося отримати історію платежів:", error);
    }

    return {
      hasActivePlan: !!currentPlan,
      currentPlan,
      subscriptionHistory,
      paymentHistory,
    };
  } catch (error) {
    // Silent error handling
    console.error("Помилка при отриманні інформації про підписку:", error);
    return { hasActivePlan: false };
  }
}

export type InstructorAdvantagePost = {
  id: number;
  title: { rendered: string };
  acf?: {
    advantage_title?: string;
    advantage_description?: string;
    advantage_icons?: string[];
    advantage_images?: string[];
    advantage_has_icons?: boolean;
    advantage_has_images?: boolean;
    advantage_visual_type?: string;
  };
};

export async function fetchInstructorAdvantages(): Promise<
  InstructorAdvantagePost[]
> {
  try {
    const fullUrl = `${BASE_URL}/api/instructor-advantages`;
    const res = await fetch(fullUrl, { next: { revalidate: 60 } });

    // Якщо ендпоінт не існує (404) або інша помилка, повертаємо порожній масив без помилки
    if (!res.ok) {
      return [];
    }

    return (await res.json()) as InstructorAdvantagePost[];
  } catch (error) {
    // Ендпоінт може не існувати, повертаємо порожній масив без викидання помилки
    return [];
  }
}

export type WooCommerceCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
};

export async function fetchProductCategories(): Promise<WooCommerceCategory[]> {
  // Старий WooCommerce більше не використовуємо
  return [];
}

// Отримання категорій тренувань (батьківська категорія 55)
export async function fetchTrainingCategories(): Promise<
  WooCommerceCategory[]
> {
  return [];
}

// Отримання категорій курсів (батьківська категорія 72)
export async function fetchCourseCategories(): Promise<WooCommerceCategory[]> {
  return [];
}

// Отримання категорій FAQ
export async function fetchFAQCategories(): Promise<unknown[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/faq_category`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Silent logging
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити категорії FAQ");
  }
}

// Отримання FAQ з фільтрацією за категорією
export async function fetchFilteredFAQ(
  categoryId?: string
): Promise<unknown[]> {
  try {
    const url = categoryId
      ? `${BASE_URL}/api/faq?faq_category=${categoryId}`
      : `${BASE_URL}/api/faq`;

    // Silent logging

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Silent logging
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити FAQ");
  }
}

// Отримання атрибутів товарів (колір, розмір, тощо) – WooCommerce більше не використовуємо
export async function fetchProductAttributes(): Promise<
  WooCommerceAttribute[]
> {
  return [];
}

// Отримання термінів (опцій) атрибуту – також відключено від WooCommerce
export async function fetchAttributeTerms(
  _attributeId: number
): Promise<WooCommerceAttributeTerm[]> {
  return [];
}

export type WooCommerceAttribute = {
  id: number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
};

export type WooCommerceAttributeTerm = {
  id: number;
  name: string;
  slug: string;
  description: string;
  menu_order: number;
  count: number;
  acf?: {
    color?: string;
    [key: string]: unknown;
  };
};

export type PasswordResetData = {
  email: string;
};

export type PasswordResetResponse = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(
  data: PasswordResetData
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Silent logging
    return { success: true, message: "Код відновлення відправлено на email" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося відправити код відновлення");
  }
}

export type ValidateCodeData = {
  email: string;
  code: string;
};

export async function validateResetCode(
  data: ValidateCodeData
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/validate-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Silent logging
    return { success: true, message: "Код підтверджено" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося підтвердити код");
  }
}

export type SetPasswordData = {
  email: string;
  code: string;
  password: string;
};

export async function setNewPassword(
  data: SetPasswordData
): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/set-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Silent logging
    return { success: true, message: "Пароль успішно змінено" };
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося встановити новий пароль");
  }
}

export type WooCommerceOrder = {
  id: number;
  parent_id: number;
  status: string;
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone?: string;
  };
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_paid: string | null;
  cart_hash: string;
  number: string;
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: Array<{
      id: number;
      total: string;
      subtotal: string;
    }>;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
    sku: string;
    price: number;
  }>;
  tax_lines: Array<{
    id: number;
    rate_code: string;
    rate_id: number;
    label: string;
    compound: boolean;
    tax_total: string;
    shipping_tax_total: string;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  shipping_lines: Array<{
    id: number;
    method_title: string;
    method_id: string;
    total: string;
    total_tax: string;
    taxes: Array<{
      id: number;
      total: string;
      subtotal: string;
    }>;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  fee_lines: Array<{
    id: number;
    name: string;
    tax_class: string;
    tax_status: string;
    total: string;
    total_tax: string;
    taxes: Array<{
      id: number;
      total: string;
      subtotal: string;
    }>;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  coupon_lines: Array<{
    id: number;
    code: string;
    discount: string;
    discount_tax: string;
    meta_data: Array<{
      id: number;
      key: string;
      value: string;
    }>;
  }>;
  refunds: Array<{
    id: number;
    reason: string;
    total: string;
  }>;
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;
  date_created_gmt: string;
  date_modified_gmt: string;
  date_completed_gmt: string | null;
  date_paid_gmt: string | null;
  currency_symbol: string;
};

export async function fetchUserOrders(
  userId: number,
  token?: string
): Promise<WooCommerceOrder[]> {
  try {
    // Використовуємо proxy з адмінськими правами для отримання замовлень
    const response = await fetch(
      `${BASE_URL}/api/orders?customer=${encodeURIComponent(String(userId))}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-internal-admin": "1", // Адмінський доступ
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити історію замовлень");
  }
}

export type MediaUploadData = {
  file: File;
  fieldType:
    | "img_link_data_avatar"
    | "img_link_data_gallery_"
    | "img_link_data_certificate_"
    | "img_link_data_personal_gallery_";
  token: string;
};

export type MediaUploadResponse = {
  success: boolean;
  message: string;
  url?: string;
  id?: number;
};

export async function uploadMedia(
  data: MediaUploadData
): Promise<MediaUploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    // field_type та token не потрібні для стандартного WordPress media endpoint
    // але залишаємо для сумісності

    // На клієнті використовуємо публічний базовий URL
    const browserBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;
    if (!browserBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL не встановлено");
    }

    const mediaUrl = `${browserBaseUrl}/api/media`;

    const response = await fetch(mediaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.token}`,
        // Не встановлюємо Content-Type, браузер сам встановить з multipart/form-data boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV !== "production") {
        console.error("[uploadMedia] Помилка завантаження:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: mediaUrl,
        });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: "Файл успішно завантажено",
      url: result.source_url,
      id: result.id,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[uploadMedia] Помилка:", error);
    }
    throw new Error("Не вдалося завантажити файл");
  }
}

// Custom media upload for coach fields (avatar/gallery/certificate)
// Custom media upload for coach fields (avatar/gallery/certificate)
export async function uploadCoachMedia(params: {
  token: string;
  fieldType:
    | "img_link_data_avatar"
    | "img_link_data_gallery_"
    | "img_link_data_certificate_"
    | "img_link_data_personal_gallery_";
  files: File[];
}): Promise<{
  success: boolean;
  field_type?: string;
  processed_count?: number;
  files?: Array<{ id: string | number; url: string; filename?: string }>;
  current_field_value?: string;
}> {
  const form = new FormData();
  form.append("token", params.token);
  form.append("field_type", params.fieldType);
  for (const f of params.files) form.append("files", f);

  // На клієнті використовуємо тільки публічний базовий URL
  const browserBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string;
  const targetUrl = `${browserBaseUrl}/api/upload-media`;

  const res = await fetch(targetUrl, {
    method: "POST",
    body: form,
  });

  let data: {
    success?: boolean;
    field_type?: string;
    processed_count?: number;
    files?: Array<{ id: string | number; url: string; filename?: string }>;
    current_field_value?: string;
    message?: string;
    error?: string;
  };

  try {
    data = await res.json();
  } catch {
    // Якщо не вдалося розпарсити JSON, спробуємо отримати текст
    const text = await res.text();

    // ⭐️ ЛОГ 3: Помилка парсингу JSON (якщо WP повернув HTML або невірний формат)
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[Media Upload] ❌ Помилка парсингу. Статус: ${res.status}. Сирий текст:`,
        text
      );
    }

    throw new Error(
      text || `uploadCoachMedia failed with status ${res.status}`
    );
  }

  if (!res.ok) {
    // ⭐️ ЛОГ 4: Помилка HTTP (4xx або 5xx)
    const errorMessage =
      data?.error ||
      data?.message ||
      `uploadCoachMedia failed with status ${res.status}`;
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[Media Upload] 🛑 HTTP Помилка. Статус: ${res.status}. Повідомлення: ${errorMessage}`
      );
    }
    throw new Error(errorMessage);
  }

  return data as {
    success: boolean;
    field_type?: string;
    processed_count?: number;
    files?: Array<{ id: string | number; url: string; filename?: string }>;
    current_field_value?: string;
  };
}
export type ProductFilters = {
  category?: string | string[];
  /** Динамічні фільтри: { manufacturer: ['raw','phoenix'], type: ['organic'] } → ?manufacturer=raw,phoenix&type=organic */
  categoryFilters?: Record<string, string[]>;
  attribute?: string | string[];
  attribute_term?: string | string[];
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  featured?: boolean;
  status?: string;
  search?: string;
  orderby?: "date" | "price" | "popularity" | "rating" | "title";
  order?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

// Функція для отримання категорій товару з WordPress API
export async function fetchProductCategoriesFromWp(
  productId: number
): Promise<Array<{ id: number; name: string; slug: string }>> {
  try {
    const response = await fetch(`/api/wp/products/${productId}`);
    if (!response.ok) return [];
    const product = await response.json();
    return product.categories || [];
  } catch (error) {
    // Silent error handling
    return [];
  }
}

function mapCatalogProductListItem(item: Record<string, unknown>) {
  const localized = localizeProductRecord(item);
  const name = String(localized.name ?? "");
  const label = localized.label ? String(localized.label) : "";
  const price = Number(item.price ?? 0);
  const saleRaw = item.salePrice;
  const salePrice =
    saleRaw != null && saleRaw !== "" ? Number(saleRaw) : undefined;
  const onSale =
    typeof salePrice === "number" &&
    Number.isFinite(salePrice) &&
    salePrice > 0 &&
    salePrice < price;
  const imageUrl =
    (typeof item.mainImageUrl === "string" && item.mainImageUrl) ||
    (Array.isArray(item.imageUrls) && typeof item.imageUrls[0] === "string"
      ? item.imageUrls[0]
      : "");
  const createdAt =
    item.createdAt != null ? String(item.createdAt) : undefined;

  return {
    id: item.id,
    name,
    price: onSale && salePrice != null ? salePrice : price,
    regularPrice: price,
    salePrice: onSale ? salePrice : undefined,
    onSale,
    image: imageUrl,
    images: imageUrl
      ? [{ id: 1, src: imageUrl, name, alt: name }]
      : [],
    categories: label ? [{ id: label, name: label, slug: label }] : [],
    stockStatus: item.inStock ? "instock" : "outofstock",
    dateCreated: createdAt,
    date_created: createdAt,
    slug: item.slug,
    ratingAverage: Number(item.ratingAverage ?? 0),
    ratingCount: Number(item.ratingCount ?? 0),
  };
}

export async function fetchFilteredProducts(
  filters: ProductFilters = {},
): Promise<unknown[]> {
  try {
    const params = new URLSearchParams();
    const localeHeaders = getCatalogHeaders();

    const rawCats = filters.category
      ? Array.isArray(filters.category)
        ? filters.category
        : [filters.category]
      : [];

    const categorySlugs = rawCats
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.trim())
      .filter((c) => c !== "" && !/^\d+$/.test(c));

    if (filters.search) {
      params.append("search", String(filters.search));
    }

    if (filters.categoryFilters && Object.keys(filters.categoryFilters).length > 0) {
      for (const [key, values] of Object.entries(filters.categoryFilters)) {
        if (Array.isArray(values) && values.length > 0) {
          params.append(key, values.join(","));
        }
      }
    }

    if (filters.page) {
      params.append("page", String(filters.page));
    }

    if (filters.per_page) {
      params.append("limit", String(filters.per_page));
      if (!filters.page) {
        params.append("page", "1");
      }
    }

    const queryString = params.toString();
    const baseUrl = `${NODE_API_BASE_URL}/catalog/products`;

    if (categorySlugs.length > 1) {
      const urls = categorySlugs.map((slug) => {
        const p = new URLSearchParams(queryString);
        p.set("categorySlug", slug);
        return `${baseUrl}?${p.toString()}`;
      });

      const responses = await Promise.all(
        urls.map((u) =>
          fetch(u, { cache: "no-store", headers: localeHeaders }),
        ),
      );

      const jsons = await Promise.all(
        responses.map(async (res) => {
          if (!res.ok) return null;
          try {
            return (await res.json()) as { items: Array<Record<string, unknown>> };
          } catch {
            return null;
          }
        }),
      );

      const mergedById = new Map<string, Record<string, unknown>>();
      for (const data of jsons) {
        for (const item of data?.items ?? []) {
          const id = String(item.id ?? "");
          if (id && !mergedById.has(id)) {
            mergedById.set(id, item);
          }
        }
      }

      return Array.from(mergedById.values()).map(mapCatalogProductListItem);
    }

    if (categorySlugs.length === 1) {
      params.set("categorySlug", categorySlugs[0]);
    }

    const url = `${baseUrl}${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: localeHeaders,
    });
    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as {
      items: Array<Record<string, unknown>>;
    };

    return data.items.map(mapCatalogProductListItem);
  } catch (error) {
    console.error("fetchFilteredProducts error", error);
    return [];
  }
}

// Відгуки товару (новий REST API)
export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title?: string;
  text: string;
  createdAt?: string;
  productName?: string;
  productSlug?: string;
}

function parseReviewsPayload(data: unknown): ProductReview[] {
  if (Array.isArray(data)) return data as ProductReview[];
  if (data && typeof data === "object") {
    const arr = (data as Record<string, unknown>).items
      ?? (data as Record<string, unknown>).reviews
      ?? (data as Record<string, unknown>).data;
    if (Array.isArray(arr)) return arr as ProductReview[];
  }
  return [];
}

export async function fetchAllProductReviews(
  limit = 50,
): Promise<ProductReview[]> {
  const res = await fetch(
    `${NODE_API_BASE_URL}/catalog/reviews?limit=${limit}`,
    { cache: "no-store", headers: getLocaleHeaders() },
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch reviews: ${res.status}`);
  }
  const data = await res.json();
  return parseReviewsPayload(data);
}

export async function fetchProductReviews(
  productSlug: string
): Promise<ProductReview[]> {
  const normalizedSlug = resolveProductSlugParam(productSlug);
  const res = await fetch(
    `${NODE_API_BASE_URL}/catalog/products/${encodeURIComponent(normalizedSlug)}/reviews`,
    { cache: "no-store", headers: getLocaleHeaders() },
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch reviews: ${res.status}`);
  }
  const data = await res.json();
  return parseReviewsPayload(data);
}

export async function createProductReview(
  productSlug: string,
  body: {
    rating: number;
    title?: string;
    text?: string;
    authorName?: string;
  }
): Promise<{ success: boolean; review?: ProductReview }> {
  const normalizedSlug = resolveProductSlugParam(productSlug);
  const res = await fetch(
    `${NODE_API_BASE_URL}/catalog/products/${encodeURIComponent(normalizedSlug)}/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to create review: ${res.status}`);
  }
  return (await res.json()) as { success: boolean; review?: ProductReview };
}

// Trainer profile update
export interface TrainerProfileUpdatePayload {
  id?: string | number;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  acf?: Record<string, unknown>;
}

// Функція для очищення control characters з об'єкта перед серіалізацією
function cleanControlCharacters(obj: unknown): unknown {
  if (typeof obj === "string") {
    // Видаляємо некоректні control characters, залишаємо тільки стандартні (\n, \r, \t)
    return obj.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanControlCharacters);
  }
  if (obj && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanControlCharacters(value);
    }
    return cleaned;
  }
  return obj;
}

export async function updateTrainerProfile(
  payload: TrainerProfileUpdatePayload,
  bearerToken?: string
) {
  // Очищаємо дані від некоректних control characters перед серіалізацією
  const cleanedPayload = cleanControlCharacters(
    payload
  ) as TrainerProfileUpdatePayload;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

  const res = await fetch("/api/profile/trainer", {
    method: "PATCH",
    headers,
    body: JSON.stringify(cleanedPayload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update trainer profile");
  }
  return res.json();
}

// WooCommerce product reviews
export interface WcReview {
  id: number;
  product_id: number | string;
  review: string;
  reviewer_name?: string;
  reviewer?: string;
  date_created?: string;
  date_created_gmt?: string;
  rating?: number;
}

export async function fetchWcReviews(_params?: Record<string, string | number>) {
  return { reviews: [] };
}

export async function createWcReview(_body: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}) {
  throw new Error("WooCommerce reviews відключено");
}

// WooCommerce products and categories (proxying our API routes)
// Старі WooCommerce proxy‑ендпоїнти більше не використовуємо
export async function fetchWcProducts(
  _params?: Record<string, string | number>
) {
  return [];
}

export async function fetchWcCategories(
  _params?: Record<string, string | number>
) {
  return [];
}

// FAQ Functions with logging
export async function fetchFAQCategoriesWithLogging(): Promise<FaqCategory[]> {
  try {
    const data = await fetchFaqCategories();
    return data;
  } catch (error) {
    throw new Error("Не вдалося завантажити категорії FAQ");
  }
}

export async function fetchFAQByCategoryWithLogging(
  categoryId?: number
): Promise<FaqItem[]> {
  try {
    const data = await fetchFaqByCategory(categoryId);
    return data;
  } catch (error) {
    throw new Error("Не вдалося завантажити FAQ");
  }
}

// Trainer Types
export interface Trainer {
  id: number;
  name: string;
  slug: string;
  description?: string;
  avatar_urls?: {
    "24": string;
    "48": string;
    "96": string;
  };
  location_city?: string;
  location_country?: string;
  acf?: {
    full_name?: string;
    bio?: string;
    avatar?: {
      url: string;
      alt: string;
    };
    location_city?: string;
    location_country?: string;
    country?: string;
    city?: string;
    experience?: string;
    position?: string;
    social_instagram?: string;
    social_telegram?: string;
    social_phone?: string;
    certificate?: string;
    clients_count?: string;
    my_wlocation?: Array<{
      city: string;
      country: string;
    }>;
  };
}

export interface TrainerFilters {
  countries?: string[];
  cities?: string[];
  roles?: string[];
  categories?: number[];
}

// Trainer Functions
export async function fetchTrainersWithLogging(
  filters: TrainerFilters = {}
): Promise<Trainer[]> {
  try {
    const params = new URLSearchParams();

    // Додаємо фільтри до параметрів
    if (filters.countries && filters.countries.length > 0) {
      filters.countries.forEach((country) => {
        params.append("countries[]", country);
      });
    }

    if (filters.cities && filters.cities.length > 0) {
      filters.cities.forEach((city) => {
        params.append("cities[]", city);
      });
    }

    if (filters.roles && filters.roles.length > 0) {
      filters.roles.forEach((role) => {
        params.append("roles[]", role);
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((category) => {
        params.append("categories[]", category.toString());
      });
    }

    const queryString = params.toString();
    // За замовчуванням додаємо роль тренера
    const roleSuffix = queryString ? `&roles=bfb_coach` : `?roles=bfb_coach`;
    const url = `/api/trainers${
      queryString ? `?${queryString}` : ""
    }${roleSuffix}`;

    const data = await safeFetch<Trainer[]>(url);

    return data;
  } catch (error) {
    // Silent error handling
    throw new Error("Не вдалося завантажити тренерів");
  }
}

// (duplicated CasePost removed)

// Orders API (NestJS)
export interface CreateOrderPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  email: string;
  deliveryToAnother?: boolean;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientPhone?: string;
  deliveryMethod?: string;
  deliveryCity?: string;
  deliveryAddress?: string;
  comment?: string;
  newsletterConsent?: boolean;
  termsAccepted: boolean;
  discountAmount?: number;
  deliveryCost?: number;
  /** wayforpay | cod | bacs | ... */
  paymentMethod?: string;
  /** Код знижки з адмінки */
  promoCode?: string;
  items?: Array<{ productId: string; quantity: number }>;
}

export interface OrderResponse {
  id: string;
  status?: string;
  total?: number;
  subtotal?: number;
  discountAmount?: number;
  deliveryCost?: number;
  /** NestJS GET /api/orders/:id — готові підстановки для UI */
  createdAt?: string;
  deliveryAddress?: string;
  paymentLabel?: string;
  recipient?: string;
  phoneLabel?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    price?: number;
    product?: { name?: string; mainImageUrl?: string; [key: string]: unknown };
  }>;
  line_items?: Array<{
    product_id: number | string;
    quantity: number;
    name?: string;
    total?: string;
    subtotal?: string;
    image?: string;
  }>;
  billing?: { first_name?: string; last_name?: string; phone?: string; email?: string; address_1?: string; city?: string };
  shipping?: { first_name?: string; last_name?: string; phone?: string; address_1?: string; address_2?: string; city?: string };
  number?: string;
  date_created?: string;
  payment_method_title?: string;
}

/** Нормалізує NestJS order до єдиного формату для відображення */
export function normalizeOrderForDisplay(raw: OrderResponse | Record<string, unknown> | null): OrderResponse | null {
  if (!raw) return null;
  const r = raw as Record<string, unknown>;

  if (r.line_items && Array.isArray(r.line_items) && r.line_items.length > 0) {
    return raw as OrderResponse;
  }

  if (r.items && Array.isArray(r.items) && r.items.length > 0) {
    const items = r.items as Array<{
      productId?: string;
      product?: { id?: string; name?: string; mainImageUrl?: string };
      quantity: number;
      price?: number;
    }>;
    const line_items = items.map((it) => ({
      product_id: it.productId ?? (it.product as { id?: string })?.id ?? "",
      quantity: it.quantity,
      name: (it.product as { name?: string })?.name ?? "",
      total: String(((it.price ?? 0) * it.quantity)),
      subtotal: String(((it.price ?? 0) * it.quantity)),
      image: (it.product as { mainImageUrl?: string })?.mainImageUrl,
    }));
    const out = { ...r, line_items } as OrderResponse;

    if (!out.billing && r.firstName) {
      out.billing = {
        first_name: String(r.firstName),
        last_name: String(r.lastName ?? ""),
        phone: String(r.phone ?? ""),
        email: String(r.email ?? ""),
      };
    }
    if (!out.shipping && r.deliveryCity) {
      out.shipping = {
        first_name: String(r.recipientFirstName ?? ""),
        last_name: String(r.recipientLastName ?? ""),
        address_1: String(r.deliveryAddress ?? ""),
        city: String(r.deliveryCity ?? ""),
      };
    }
    return out;
  }

  return raw as OrderResponse;
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<OrderResponse> => {
  const res = await api.post("/api/orders", payload);
  return res.data as OrderResponse;
};

export type PromoCodeValidation = {
  code: string;
  discountPercent: number;
};

export const validatePromoCode = async (
  code: string,
): Promise<PromoCodeValidation> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("bfb_token") ||
      localStorage.getItem("bfb_token_old");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${NODE_API_BASE_URL}/promo-codes/validate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ code }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    code?: string;
    discountPercent?: number;
    message?: string | string[];
  };
  if (!res.ok) {
    throw { response: { data: { message: data.message || "Промокод недійсний" } } };
  }
  return {
    code: String(data.code || code),
    discountPercent: Number(data.discountPercent || 0),
  };
};

export const getOrders = async (): Promise<OrderResponse[]> => {
  const res = await api.get("/api/orders");
  const data = res.data;
  return Array.isArray(data) ? data : (data?.items ?? data?.orders ?? []);
};

// WooCommerce Orders API (deprecated)
export const createWcOrder = async (orderData: {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    address_1?: string;
    city: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1?: string;
    city: string;
    country: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
    price: number;
    subtotal?: string;
    total?: string;
    meta_data?: Array<{
      key: string;
      value: string;
    }>;
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
  customer_note?: string;
}): Promise<unknown> => {
  try {
    throw new Error(
      "WooCommerce відключено. Оформлення замовлень потребує альтернативного бекенду."
    );
  } catch (error) {
    throw error;
  }
};

export const fetchWcPaymentGateways = async (): Promise<unknown[]> => {
  // Платіжні шлюзи WooCommerce більше не потрібні на новому бекенді
  return [];
};

// MyPlugin Subscription API (assign tariff / cancel subscription)
export type AssignTariffResponse = {
  message?: string;
  order_id?: number;
  subscription?: {
    action: string;
    fields: Record<string, unknown>;
  };
};

export async function assignTariff(params: {
  userId: number;
  tariffId: number;
}): Promise<AssignTariffResponse> {
  const res = await api.post("/api/myplugin/assign-tariff", {
    user_id: params.userId,
    tariff_id: params.tariffId,
  });
  return res.data as AssignTariffResponse;
}

export type CancelSubscriptionResponse = {
  message?: string;
  order_id?: number;
  code?: string;
  data?: { status?: number };
};

export async function cancelSubscription(params: {
  userId: number;
}): Promise<CancelSubscriptionResponse> {
  const res = await api.post("/api/myplugin/cancel-subscription", {
    user_id: params.userId,
  });
  return res.data as CancelSubscriptionResponse;
}

// Cart API — підтримка NestJS (productId, product) та WooCommerce (product_id)
export interface CartItemResponse {
  cart_item_key?: string;
  product_id?: number;
  productId?: string;
  variation_id?: number;
  quantity: number;
  product_name?: string;
  name?: string;
  product_price?: string;
  product_regular_price?: string;
  product_sale_price?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  product_image?: string;
  image?: string;
  mainImageUrl?: string;
  item_total?: number;
  added_at?: string;
  product?: { name?: string; price?: string; mainImageUrl?: string; slug?: string; [key: string]: unknown };
}

export interface CartResponse {
  user_id: number;
  items: CartItemResponse[];
  items_count: number;
  total: number;
  currency: string;
}

export const getCart = async (): Promise<CartResponse> => {
  const response = await api.get("/api/cart");
  return response.data;
};

export const addToCart = async (
  productId: number,
  quantity: number = 1,
  variationId: number = 0
): Promise<{
  success: boolean;
  message: string;
  cart_item_key: string;
  cart: CartResponse;
}> => {
  const response = await api.post("/api/cart", {
    product_id: productId,
    quantity,
    variation_id: variationId,
  });
  return response.data;
};

export const updateCartItem = async (
  cartItemKey: string,
  quantity: number
): Promise<{
  success: boolean;
  message: string;
  cart: CartResponse;
}> => {
  const response = await api.put(`/api/cart?cart_item_key=${cartItemKey}`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (
  cartItemKey: string
): Promise<{
  success: boolean;
  message: string;
  cart: CartResponse;
}> => {
  const response = await api.delete(`/api/cart?cart_item_key=${cartItemKey}`);
  return response.data;
};

export const clearCart = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.delete("/api/cart?clear=true");
  return response.data;
};

export interface SyncCartItem {
  productId?: string;
  slug?: string;
  quantity: number;
}

function toProductIdString(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  const s = String(value).trim();
  return s === "" ? undefined : s;
}

export const syncCart = async (items: SyncCartItem[]): Promise<CartResponse> => {
  const body = {
    items: items
      .filter((i) => (i.productId != null || i.slug) && (i.quantity ?? 0) > 0)
      .map((i) => {
        const productId = toProductIdString(i.productId);
        const slug = i.slug ? String(i.slug).trim() || undefined : undefined;
        if (!productId && !slug) return null;
        return {
          ...(productId != null ? { productId } : {}),
          ...(slug ? { slug } : {}),
          quantity: typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 1,
        };
      })
      .filter((i): i is NonNullable<typeof i> => i != null && (i.productId != null || i.slug != null)),
  };
  const response = await api.post("/api/cart/sync", body);
  return response.data;
};

// Wishlist API (NestJS)
export interface WishlistProductResponse {
  id: string;
  name: string;
  slug: string;
  price?: string;
  mainImageUrl?: string;
  [key: string]: unknown;
}

export interface WishlistApiItem {
  productId?: string;
  slug?: string;
  product?: WishlistProductResponse;
}

export interface WishlistItemResponse {
  product_id?: number;
  productId?: string;
  variation_id?: number;
  product_name?: string;
  product_price?: string;
  product_image?: string;
  product_url?: string;
  in_stock?: boolean;
  added_at?: string;
  product?: WishlistProductResponse;
}

export interface WishlistResponse {
  user_id?: number;
  items: WishlistItemResponse[];
  items_count?: number;
  productIds?: string[];
}

export const getWishlist = async (): Promise<WishlistResponse> => {
  try {
    const response = await api.get("/api/wishlist");
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return {
        user_id: 0,
        items: [],
        items_count: 0,
      };
    }
    throw error;
  }
};

export const addToWishlist = async (
  productId: number,
  variationId: number = 0
): Promise<{
  success: boolean;
  message: string;
  wishlist: WishlistResponse;
}> => {
  try {
    const response = await api.post("/api/wishlist", {
      product_id: productId,
      variation_id: variationId,
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      throw new Error(
        "Wishlist API не доступний. Будь ласка, перевірте налаштування на сервері."
      );
    }
    throw error;
  }
};

export const removeFromWishlist = async (
  productId: number
): Promise<{
  success: boolean;
  message: string;
  wishlist: WishlistResponse;
}> => {
  try {
    const response = await api.delete(`/api/wishlist?product_id=${productId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return {
        success: true,
        message: "Item removed",
        wishlist: {
          user_id: 0,
          items: [],
          items_count: 0,
        },
      };
    }
    throw error;
  }
};

export const checkWishlistItem = async (
  productId: number
): Promise<{ in_wishlist: boolean }> => {
  try {
    const response = await api.get(
      `/api/wishlist?check=true&product_id=${productId}`
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return { in_wishlist: false };
    }
    throw error;
  }
};

export const clearWishlist = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete("/api/wishlist?clear=true");
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return {
        success: true,
        message: "Wishlist cleared",
      };
    }
    throw error;
  }
};

export interface SyncWishlistItem {
  productId?: string;
  slug?: string;
}

export const syncWishlist = async (
  items: SyncWishlistItem[]
): Promise<WishlistResponse> => {
  const body = {
    items: items
      .filter((i) => i.productId || i.slug)
      .map((i) => ({
        productId: i.productId != null ? String(i.productId).trim() : undefined,
        slug: i.slug ? String(i.slug).trim() : undefined,
      }))
      .filter((i) => i.productId || i.slug),
  };
  const response = await api.post("/api/wishlist/sync", body);
  return response.data;
};
