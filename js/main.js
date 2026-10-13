/* ==========================================================================
   js/main.js — COACH [NAME] website
   Features:
   0. Language switcher (Persian default, English secondary, saved in localStorage)
   1. Header scroll state
   2. Active navigation link (IntersectionObserver)
   3. Scroll reveal animations
   4. Contact form validation (messages follow the active language)
   5. External link safety
   6. Transformation image lightbox

   Each feature runs independently, so one failing never disables the others.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     Configuration
     ------------------------------------------------------------------------ */
  const CONFIG = {
    // Leave empty until a real form service or backend is configured.
    // Example later: 'https://formspree.io/f/your-form-id'
    formEndpoint: '',
    headerScrolledAfter: 8, // px scrolled before the header gets its "is-scrolled" class
    defaultLanguage: 'fa',
    storageKey: 'coach-site-language',
  };

  const LANGUAGES = {
    fa: { dir: 'rtl' },
    en: { dir: 'ltr' },
  };

  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  /* ------------------------------------------------------------------------
     Translation dictionary
     HTML elements are linked to these keys with:
       data-i18n="key"                       -> replaces the text content
       data-i18n-attr="attr:key;attr2:key2"  -> replaces attributes
                                                (placeholder, aria-label, alt, content)
     To change any wording, edit it here (and keep the Persian text in
     index.html in sync if you want it to match for visitors without JavaScript).
     ------------------------------------------------------------------------ */
  const TRANSLATIONS = {
    fa: {
      /* Metadata */
      'meta.title': 'مربی ایمان صادقی نژاد | مربی بدنسازی و تمرین شخصی',
      'meta.description': 'مربیگری بدنسازی و تمرین شخصی با تمرکز بر تمرینات مقاومتی ساختارمند، پیشرفت منضبط و برنامه‌های اختصاصی. مسیر خود را با مربی ایمان صادقی نژاد آغاز کنید.',
      'meta.ogDescription': 'قدرت بسازید؛ میراث خود را شکل دهید. تمرین شخصی‌سازی‌شده و پیشرفت منضبط با مربی ایمان صادقی نژاد.',
      'meta.ogLocale': 'fa_IR',
      'meta.ogLocaleAlt': 'en_US',

      /* Global */
      'skip.link': 'رفتن به محتوای اصلی',
      'brand.name': ' مربی ایمان صادقی نژاد ',
      'brand.logoLabel': 'مربی ایمان صادقی نژاد - بازگشت به بالای صفحه',
      'lang.groupLabel': 'انتخاب زبان',
      'loader.label': 'در حال بارگذاری…',

      /* Navigation */
      'nav.aria': 'منوی اصلی',
      'nav.home': 'خانه',
      'nav.about': 'درباره مربی ',
      'nav.programs': 'برنامه‌ها',
      'nav.transformations': 'تحول شاگردان',
      'nav.contact': 'تماس',
      'nav.cta': 'شروع تمرین',
      'nav.menuToggle': 'منو',

      /* Hero */
      'hero.eyebrow': 'آموزش شخصی و بدنسازی',
      'hero.title': 'قدرت بسازید؛ میراث خود را شکل دهید.',
      'hero.text': 'تمرینات شخصی‌سازی‌شده بر اساس هدف، بدن و برنامه زمانی شما. با برنامه‌ریزی ساختارمند و پیشرفتی منضبط، هر جلسه شما را یک قدم به قوی‌ترین نسخه خودتان نزدیک‌تر می‌کند.',
      'hero.ctaPrimary': 'مسیر خود را آغاز کنید',
      'hero.ctaSecondary': 'مشاهده برنامه‌ها',
      'hero.imgAlt': 'پرتره مربی ایمان صادقی نژاد در محیط باشگاه',

      /* About */
      'about.label': 'با مربی خود آشنا شوید',
      'about.title': 'انضباط، تعهد و پیشرفت؛ در کنار هم ساخته می‌شود',
      'about.text1': 'من ایمان صادقی‌نژاد هستم؛ مربی بدنسازی که با برنامه‌ریزی اصولی و تمرینات شخصی‌سازی‌شده، همراه شما در مسیر ساختن بدنی قوی‌تر و سالم‌تر است.',
      'about.text2': 'شاگردان در مسیر همکاری با من، از برنامه‌های تمرینی شخصی‌سازی‌شده، راهنمایی تخصصی، پیگیری مستمر و پشتیبانی حرفه‌ای بهره‌مند می‌شن تا با تمرکز بر اهدافشون، به پیشرفت اصولی و نتایجی پایدار دست پیدا کنن.',
      'about.experience.title': 'تجربه',
      'about.experience.text':'۲۷ سال تجربه ورزشی مستمر، فعالیت حرفه‌ای از سال ۱۳۷۵ و برخورداری از مدارک تخصصی و پیشرفته در رشته‌های ورزشی مختلف.',
      'about.certifications.title': 'مدارک و گواهینامه‌ها',
      'about.certifications.text': 'دکترای حرفه‌ای فیزیولوژی ورزشی با گرایش عصب‌عضله، مربی رسمی فدراسیون بدنسازی با مدارک درجه ۲ و ۳، متخصص برنامه‌نویسی ورزشی، کاهش و افزایش وزن و تناسب اندام، دارای گواهینامه تخصصی مکمل‌های ورزشی از دانشگاه تهران و دارای تجربه در ارزیابی توانایی‌های ورزشی و تعیین سطح آمادگی جسمانی.',
      'about.specialties.title': 'تخصص‌ها',
      'about.specialties.text': 'فیزیولوژی ورزشی، بدنسازی حرفه‌ای، برنامه‌نویسی تمرینی، کاهش و افزایش وزن، تناسب اندام، تمرینات فانکشنال، کیک‌بوکسینگ، بوکس، MMA، دفاع شخصی، ارزیابی آمادگی جسمانی و مشاوره تخصصی مکمل‌های ورزشی.',
      'about.imgAlt': 'مربی ایمان صادقی نژاد در حال تمرین در باشگاه',

      /* Programs */
      'programs.label': 'برنامه‌های تمرینی',
      'programs.title': 'برنامه‌هایی متناسب با اهداف شما',
      'programs.intro': 'برنامه‌های تمرینی متناسب با اهداف و شرایط شما، از افزایش قدرت و عضله‌سازی تا کاهش وزن و تناسب اندام؛ با رویکردی اصولی، برنامه‌ریزی تخصصی و تمرکز بر پیشرفت مستمر.',
      'programs.bannerAlt': 'جلسه تمرین با هالتر در باشگاه',
      'programs.learnMore': 'اطلاعات بیشتر',
      'programs.muscle.title': 'عضله‌سازی',
      'programs.muscle.text': 'تمرین مقاومتی ساختارمند بر پایه اضافه‌بار تدریجی، با برنامه‌ای روشن برای افزایش قدرت و حجم عضلانی در طول زمان.',
      'programs.muscle.aria': 'اطلاعات بیشتر درباره عضله‌سازی',
      'programs.fat.title': 'کاهش چربی',
      'programs.fat.text': 'تمرین پایدار با هدف پیشرفت تدریجی و قابل‌اندازه‌گیری، بدون میان‌برهای افراطی.',
      'programs.fat.aria': 'اطلاعات بیشتر درباره کاهش چربی',
      'programs.coaching.title': 'مربیگری اختصاصی',
      'programs.coaching.text': 'برنامه‌های تمرینی فردی و پشتیبانی مربی، متناسب با سطح تجربه، اهداف و برنامه زمانی شما.',
      'programs.coaching.aria': 'اطلاعات بیشتر درباره مربیگری اختصاصی',

      /* Transformations */
      'transformations.label': 'تحول شاگردان',
      'transformations.title': 'پیشرفتی که با پایداری ساخته می‌شود',
      'transformations.intro': 'روایت پیشرفت شاگردانم با تمرین اصولی، استمرار و برنامه‌ریزی هدفمند.',
      'transformations.alt1': 'نمونه: عکس پیشرفت شاگرد ۱',
      'transformations.alt2': 'نمونه: عکس پیشرفت شاگرد ۲',
      'transformations.alt3': 'نمونه: عکس پیشرفت شاگرد ۳',
      'transformations.caption1': 'پیشرفت در تناسب اندام و عضله‌سازی.',
      'transformations.caption2': 'بهبود تناسب اندام و افزایش قدرت بدنی.',
      'transformations.caption3': 'عضله‌سازی و افزایش حجم عضلانی.',

      /* Testimonials */
      'testimonials.label': 'نظرات شاگردان',
      'testimonials.title': 'شاگردان چه می‌گویند',
      'testimonials.notice': 'از تجربه‌های واقعی شاگردانم بخوانید و با مسیر پیشرفت آن‌ها در دنیای بدنسازی آشنا شوید.',
      'testimonials.quote': 'با برنامه‌های تمرینی منظم و راهنمایی‌های ایمان صادقی‌نژاد، تونستم با انگیزه بیشتری تمرین کنم و قدم‌به‌قدم به اهداف ورزشی‌ام نزدیک‌تر بشم.',
      'testimonials.author': 'نام شاگرد - شایان',
      'testimonials.quote2': 'با تمرینات هدفمند و برنامه‌ای متناسب با شرایطم، پیشرفت خوبی در قدرت بدنی و تناسب اندامم داشتم و حالا با انگیزه بیشتری تمرین می‌کنم.',
      'testimonials.author2': 'نام شاگرد - محمد',

      /* Contact */
      'contact.label': 'تماس و رزرو',
      'contact.title': 'آماده شروع هستید؟ همین امروز تمرین را آغاز کنید.',
      'contact.text': 'اهداف خود را برایم بنویسید تا با هم برنامه‌ای بسازیم. از طریق فرم پیام بفرستید یا مستقیم تماس بگیرید.',
      'contact.emailLabel': 'ایمیل:',
      'contact.phoneLabel': 'تلفن:',
      'contact.locationLabel': 'موقعیت:',
      'contact.locationValue': 'مشهد ،   ایران',
      'contact.socialAria': 'تماس از طریق شبکه‌های اجتماعی',

      /* Social (visible names and accessible labels) */
      'social.instagram': 'اینستاگرام',
      'social.whatsapp': 'واتس‌اپ',
      'social.youtube': 'یوتیوب',
      'aria.instagram': 'اینستاگرام (لینک نمونه)',
      'aria.whatsapp': 'واتس‌اپ (لینک نمونه)',
      'aria.youtube': 'یوتیوب (لینک نمونه)',

      /* Form */
      'form.name.label': 'نام',
      'form.name.placeholder': 'نام شما',
      'form.email.label': 'ایمیل',
      'form.email.placeholder': 'you@example.com',
      'form.message.label': 'پیام',
      'form.message.placeholder': 'درباره اهداف خود بنویسید',
      'form.submit': 'ارسال پیام',
      'form.error.nameRequired': 'لطفاً نام خود را وارد کنید.',
      'form.error.emailRequired': 'لطفاً آدرس ایمیل خود را وارد کنید.',
      'form.error.messageRequired': 'لطفاً پیام کوتاهی درباره اهداف خود بنویسید.',
      'form.error.emailInvalid': 'لطفاً یک ایمیل معتبر وارد کنید، مثلاً name@example.com.',
      'form.error.required': 'این فیلد الزامی است.',
      'form.error.invalid': 'لطفاً این فیلد را بررسی کنید.',
      'form.status.fix': 'لطفاً فیلدهایی را که پیام خطا دارند اصلاح کنید.',
      'form.status.sending': 'در حال ارسال پیام شما…',
      'form.status.sent': 'متشکریم! پیام شما ارسال شد.',
      'form.status.failed': 'متأسفیم، پیام شما ارسال نشد. متن شما همچنان در فرم موجود است؛ لطفاً دوباره تلاش کنید یا مستقیماً با من تماس بگیرید.',
      'form.status.notConnected': 'اطلاعات شما معتبر به نظر می‌رسد، اما این فرم هنوز به سرویس دریافت پیام متصل نشده و چیزی ارسال نشده است. لطفاً از اطلاعات تماس همین بخش استفاده کنید.',

      /* Footer */
      'footer.navAria': 'ناوبری پایین صفحه',
      'footer.socialAria': 'شبکه‌های اجتماعی',
      'footer.copy': '© ۲۰۲۶ مربی ایمان صادقی نژاد. تمامی حقوق محفوظ است.',

      /* Lightbox */
      'lightbox.dialogLabel': 'عکس بزرگ‌شده پیشرفت شاگرد',
      'lightbox.close': 'بستن تصویر بزرگ‌شده',
      'lightbox.enlargePrefix': 'بزرگ‌نمایی عکس: ',
    },

    en: {
  /* Metadata */
  'meta.title': 'COACH Iman SadeghiNejad | Personal Training & Bodybuilding Coach',
  'meta.description': 'Professional bodybuilding and personal coaching focused on structured resistance training, consistent progress, and individualized programs. Start your journey with COACH Iman SadeghiNejad.',
  'meta.ogDescription': 'Build strength. Shape your legacy. Personalized training, expert coaching, and consistent progress with COACH Iman SadeghiNejad.',
  'meta.ogLocale': 'en_US',
  'meta.ogLocaleAlt': 'fa_IR',

  /* Global */
  'skip.link': 'Skip to main content',
  'brand.name': 'COACH Iman SadeghiNejad',
  'brand.logoLabel': 'COACH Iman SadeghiNejad - Back to top',
  'lang.groupLabel': 'Select language',
  'loader.label': 'Loading…',

  /* Navigation */
  'nav.aria': 'Main navigation',
  'nav.home': 'Home',
  'nav.about': 'About the Coach',
  'nav.programs': 'Programs',
  'nav.transformations': 'Client Transformations',
  'nav.contact': 'Contact',
  'nav.cta': 'START TRAINING',
  'nav.menuToggle': 'Menu',

  /* Hero */
  'hero.eyebrow': 'PERSONAL TRAINING & BODYBUILDING',
  'hero.title': 'BUILD STRENGTH. SHAPE YOUR LEGACY.',
  'hero.text': 'Personalized training tailored to your goals, body, and schedule. With structured programming and consistent progress, every session brings you one step closer to becoming the strongest version of yourself.',
  'hero.ctaPrimary': 'START YOUR JOURNEY',
  'hero.ctaSecondary': 'EXPLORE PROGRAMS',
  'hero.imgAlt': 'Portrait of COACH Iman SadeghiNejad in a gym',

  /* About */
  'about.label': 'MEET YOUR COACH',
  'about.title': 'Discipline, Dedication, and Progress — Built Together',
  'about.text1': 'I am Iman SadeghiNejad, a bodybuilding coach dedicated to helping you build a stronger, healthier body through structured training and personalized workout programs.',
  'about.text2': 'When you work with me, you benefit from personalized training plans, professional guidance, consistent progress tracking, and ongoing support. Together, we focus on your individual goals to help you achieve meaningful progress and sustainable results.',
  'about.experience.title': 'Experience',
  'about.experience.text': '27 years of continuous experience in sports, with professional activity dating back to 1996 and advanced qualifications across various sports disciplines.',
  'about.certifications.title': 'Qualifications & Certifications',
  'about.certifications.text': 'Professional doctorate in Exercise Physiology, specializing in neuromuscular physiology; certified Level 2 and Level 3 bodybuilding coach with the national bodybuilding federation; specialist in exercise programming, weight loss and weight gain, and fitness; holder of a sports supplementation certification from the University of Tehran; and experienced in athletic performance assessment and physical fitness evaluation.',
  'about.specialties.title': 'Areas of Expertise',
  'about.specialties.text': 'Exercise physiology, advanced bodybuilding, workout programming, weight loss and weight gain, fitness, functional training, kickboxing, boxing, MMA, self-defense, physical fitness assessment, and professional sports supplementation guidance.',
  'about.imgAlt': 'COACH Iman SadeghiNejad training in the gym',

  /* Programs */
  'programs.label': 'TRAINING PROGRAMS',
  'programs.title': 'Programs Designed Around Your Goals',
  'programs.intro': 'Training programs tailored to your goals and individual circumstances, from strength development and muscle building to weight loss and overall fitness. Every program is built around sound training principles, expert planning, and consistent progress.',
  'programs.bannerAlt': 'Barbell training session in the gym',
  'programs.learnMore': 'LEARN MORE',
  'programs.muscle.title': 'Muscle Building',
  'programs.muscle.text': 'Structured resistance training based on progressive overload, with a clear plan to develop strength and build muscle over time.',
  'programs.muscle.aria': 'Learn more about Muscle Building',
  'programs.fat.title': 'Fat Loss',
  'programs.fat.text': 'Sustainable training designed to support gradual, measurable progress without extreme shortcuts.',
  'programs.fat.aria': 'Learn more about Fat Loss',
  'programs.coaching.title': 'Personalized Coaching',
  'programs.coaching.text': 'Individualized workout plans and professional coaching support tailored to your experience, goals, and schedule.',
  'programs.coaching.aria': 'Learn more about Personalized Coaching',

  /* Transformations */
  'transformations.label': 'CLIENT TRANSFORMATIONS',
  'transformations.title': 'Progress Built Through Consistency',
  'transformations.intro': 'Real client progress built through structured training, consistency, and goal-oriented programming.',
  'transformations.alt1': 'Example photo showing a client fitness transformation',
  'transformations.alt2': 'Example photo showing a client fitness transformation',
  'transformations.alt3': 'Example photo showing a client fitness transformation',
  'transformations.caption1': 'Progress in fitness and muscle development.',
  'transformations.caption2': 'Improved fitness and increased physical strength.',
  'transformations.caption3': 'Muscle development and increased muscle mass.',

  /* Testimonials */
  'testimonials.label': 'CLIENT TESTIMONIALS',
  'testimonials.title': 'What My Clients Say',
  'testimonials.notice': 'Discover my clients’ experiences and learn about their progress in bodybuilding and fitness.',
  'testimonials.quote': 'With Iman SadeghiNejad’s structured training plans and guidance, I was able to train with greater motivation and move step by step toward my fitness goals.',
  'testimonials.author': 'Client — Shayan',
  'testimonials.quote2': 'With goal-oriented training and a program tailored to my circumstances, I made good progress in strength and fitness. Now I feel more motivated to keep training.',
  'testimonials.author2': 'Client — Mohammad',

  /* Contact */
  'contact.label': 'CONTACT & BOOKING',
  'contact.title': 'Ready to Begin? Start Training Today.',
  'contact.text': 'Tell me about your goals, and together we will build a plan to help you pursue them. Send a message through the form or contact me directly.',
  'contact.emailLabel': 'Email:',
  'contact.phoneLabel': 'Phone:',
  'contact.locationLabel': 'Location:',
  'contact.locationValue': 'Mashhad, Iran',
  'contact.socialAria': 'Contact via social media',

  /* Social */
  'social.instagram': 'Instagram',
  'social.whatsapp': 'WhatsApp',
  'social.youtube': 'YouTube',
  'aria.instagram': 'Instagram',
  'aria.whatsapp': 'WhatsApp',
  'aria.youtube': 'YouTube',

  /* Form */
  'form.name.label': 'Name',
  'form.name.placeholder': 'Your name',
  'form.email.label': 'Email',
  'form.email.placeholder': 'you@example.com',
  'form.message.label': 'Message',
  'form.message.placeholder': 'Tell me about your goals',
  'form.submit': 'SEND MESSAGE',
  'form.error.nameRequired': 'Please enter your name.',
  'form.error.emailRequired': 'Please enter your email address.',
  'form.error.messageRequired': 'Please write a short message about your goals.',
  'form.error.emailInvalid': 'Please enter a valid email address, for example name@example.com.',
  'form.error.required': 'This field is required.',
  'form.error.invalid': 'Please check this field.',
  'form.status.fix': 'Please correct the fields with error messages.',
  'form.status.sending': 'Sending your message…',
  'form.status.sent': 'Thank you! Your message has been sent.',
  'form.status.failed': 'Sorry, your message could not be sent. Your message is still in the form. Please try again or contact me directly.',
  'form.status.notConnected': 'Your information appears to be valid, but this form is not yet connected to a messaging service, so your message has not been sent. Please use the contact details in this section to reach me directly.',

  /* Footer */
  'footer.navAria': 'Footer navigation',
  'footer.socialAria': 'Social media',
  'footer.copy': '© 2026 COACH Iman SadeghiNejad. All rights reserved.',

  /* Lightbox */
  'lightbox.dialogLabel': 'Enlarged client progress photo',
  'lightbox.close': 'Close enlarged image',
  'lightbox.enlargePrefix': 'Enlarge photo: ',
},
  };

  /* ------------------------------------------------------------------------
     0. Language switcher
     ------------------------------------------------------------------------ */
  let currentLanguage = CONFIG.defaultLanguage;
  const languageListeners = [];

  /** Returns the text for a key in the active language (falls back to Persian, then the key). */
  const t = (key) => {
    const active = TRANSLATIONS[currentLanguage];
    if (active && typeof active[key] === 'string') return active[key];

    const fallback = TRANSLATIONS[CONFIG.defaultLanguage];
    if (fallback && typeof fallback[key] === 'string') return fallback[key];

    return key;
  };

  /** Registers a function that runs after every language change. */
  const onLanguageChange = (callback) => {
    languageListeners.push(callback);
  };

  const readSavedLanguage = () => {
    try {
      const saved = window.localStorage.getItem(CONFIG.storageKey);
      if (saved && Object.prototype.hasOwnProperty.call(LANGUAGES, saved)) return saved;
    } catch (error) {
      // localStorage can be unavailable (private mode, blocked storage)
    }
    return CONFIG.defaultLanguage;
  };

  const saveLanguage = (language) => {
    try {
      window.localStorage.setItem(CONFIG.storageKey, language);
    } catch (error) {
      // Ignore: the language still changes, it just will not be remembered
    }
  };

  const translateText = () => {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
  };

  const translateAttributes = () => {
    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(';').forEach((pair) => {
        const separatorIndex = pair.indexOf(':');
        if (separatorIndex < 1) return;

        const attributeName = pair.slice(0, separatorIndex).trim();
        const key = pair.slice(separatorIndex + 1).trim();
        if (attributeName && key) element.setAttribute(attributeName, t(key));
      });
    });
  };

  const updateLanguageButtons = () => {
    document.querySelectorAll('.lang-btn[data-lang]').forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;
      button.setAttribute('aria-pressed', String(isActive));
      button.classList.toggle('is-active', isActive);
    });
  };

  const applyLanguage = (language, shouldSave) => {
    if (!Object.prototype.hasOwnProperty.call(LANGUAGES, language)) {
      language = CONFIG.defaultLanguage;
    }
    currentLanguage = language;

    const root = document.documentElement;
    root.lang = language;
    root.dir = LANGUAGES[language].dir;

    translateText();
    translateAttributes();
    updateLanguageButtons();

    if (shouldSave) saveLanguage(language);

    languageListeners.forEach((callback) => {
      try {
        callback(language);
      } catch (error) {
        console.warn('A language-change handler failed.', error);
      }
    });
  };

  function initLanguage() {
    document.querySelectorAll('.lang-btn[data-lang]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.lang !== currentLanguage) applyLanguage(button.dataset.lang, true);
      });
    });

    applyLanguage(readSavedLanguage(), false);
  }
  /* ------------------------------------------------------------------------
     0a. Loading screen
     Shows until the page, its images and fonts are ready, but never longer
     than MAX_WAIT_MS, so a failed resource cannot trap the visitor.
     The loader is deleted from the page afterwards, so it cannot reappear.
     ------------------------------------------------------------------------ */
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const MAX_WAIT_MS = 5000;  // hard cap, counted from the start of navigation
    const FADE_MS = 600;       // keep equal to the opacity transition on .loader (CSS)
    const BAR_FINISH_MS = 300; // keep equal to loader-fill-complete (CSS)
    const SEEN_KEY = 'coach-site-loader-seen';

    const root = document.documentElement;
    const guardedAreas = document.querySelectorAll('.skip-link, .site-header, #main-content, .site-footer');
    const reduceMotion = reducedMotionQuery.matches;

    let released = false;
    let dismissed = false;

    // Removes the loader and every restriction it set. Safe to call more than once;
    // every exit path (normal, hard cap, CSS failsafe, error) ends here.
    const release = () => {
      if (released) return;
      released = true;

      root.classList.remove('loader-active');
      guardedAreas.forEach((area) => area.removeAttribute('inert'));
      loader.remove();

      try {
        window.sessionStorage.setItem(SEEN_KEY, '1');
      } catch (error) {
        // Ignore: storage unavailable
      }
    };

    // The CSS failsafe may already have hidden the loader before this script ran
    if (window.getComputedStyle(loader).visibility === 'hidden') {
      release();
      return;
    }

    try {
      // Block scrolling and keyboard access to the page underneath
      root.classList.add('loader-active');
      guardedAreas.forEach((area) => area.setAttribute('inert', ''));

      // Backstop: when the CSS failsafe animation hides the loader, release the locks too.
      // (animationend bubbles, so only react to the loader's own failsafe animation.)
      loader.addEventListener('animationend', (event) => {
        if (event.target === loader && event.animationName === 'loader-failsafe') release();
      });

      let seenThisSession = false;
      try {
        seenThisSession = window.sessionStorage.getItem(SEEN_KEY) === '1';
      } catch (error) {
        // sessionStorage unavailable: treat as a first visit
      }

      // Let the animation finish on a first visit; keep repeat loads short
      const minVisibleMs = reduceMotion ? 300 : seenThisSession ? 500 : 1500;
      const startedAt = performance.now();

      const dismiss = () => {
        if (dismissed || released) return;
        dismissed = true;

        loader.classList.add('is-complete'); // progress bar fills to 100%

        window.setTimeout(() => {
          if (released) return;
          loader.classList.add('is-hidden'); // starts the fade-out
          // Release only once the fade is over (instant with reduced motion)
          window.setTimeout(release, reduceMotion ? 0 : FADE_MS + 50);
        }, reduceMotion ? 0 : BAR_FINISH_MS);
      };

      const pageLoaded =
        document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

      const fontsReady =
        document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();

      Promise.all([pageLoaded, fontsReady]).then(() => {
        const remaining = Math.max(0, minVisibleMs - (performance.now() - startedAt));
        window.setTimeout(dismiss, remaining);
      });

      // Hard cap, measured from navigation start (performance.now() counts from there),
      // so a late-running script can never outlast the 8s CSS failsafe.
      window.setTimeout(dismiss, Math.max(0, MAX_WAIT_MS - performance.now()));
    } catch (error) {
      release(); // never leave the page locked after an unexpected error
      throw error; // reported by the warning in init()
    }
  }
  
/* ------------------------------------------------------------------------
   0b. Mobile navigation (hamburger)
   ------------------------------------------------------------------------ */
function initMobileNav() {
  const header = document.querySelector('.site-header');
  const toggle = header ? header.querySelector('.menu-toggle') : null;
  const menu = document.getElementById('header-menu');

  if (!header || !toggle || !menu) return;

  header.classList.add('has-menu-toggle');

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const isMobileLayout = () =>
    window.getComputedStyle(toggle).display !== 'none';

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a[href]') && isMobileLayout()) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;

    const focusWasInHeader = header.contains(document.activeElement);
    setOpen(false);

    if (focusWasInHeader) toggle.focus();
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !header.contains(event.target)) {
      setOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (isOpen() && !isMobileLayout()) setOpen(false);
  });
}


  /* ------------------------------------------------------------------------
     1. Header scroll state
     Toggles .is-scrolled on .site-header.
     ------------------------------------------------------------------------ */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;

    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > CONFIG.headerScrolledAfter);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateHeader);
        }
      },
      { passive: true }
    );

    updateHeader();
  }

  /* ------------------------------------------------------------------------
     2. Active navigation link
     Sets aria-current="true" on the main-nav link for the section that is
     crossing the middle of the viewport. Scrolling itself is left to CSS.
     ------------------------------------------------------------------------ */
  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    const links = document.querySelectorAll('.main-nav .nav-link[href^="#"]');
    const sections = document.querySelectorAll('main section[id]');
    if (!links.length || !sections.length) return;

    const linkBySectionId = new Map();
    links.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      if (id) linkBySectionId.set(id, link);
    });

    let activeLink = null;

    const setActive = (sectionId) => {
      const nextLink = linkBySectionId.get(sectionId) || null;
      if (nextLink === activeLink) return;

      if (activeLink) activeLink.removeAttribute('aria-current');
      if (nextLink) nextLink.setAttribute('aria-current', 'true');
      activeLink = nextLink;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------------
     3. Scroll reveal
     Classes are only added when IntersectionObserver is available and motion
     is allowed, so content is never hidden otherwise.
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window) || reducedMotionQuery.matches) return;

    const targets = document.querySelectorAll(
      [
        '.about-media',
        '.about-content',
        '.programs .section-header',
        '.programs-banner',
        '.programs-grid',
        '.transformations .section-header',
        '.transformations-grid',
        '.testimonials .section-header',
        '.testimonials-grid',
        '.contact-info',
        '.contact-form',
      ].join(',')
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    targets.forEach((target) => {
      target.classList.add('reveal');
      observer.observe(target);
    });
  }

  /* ------------------------------------------------------------------------
     4. Contact form validation
     NOTE: This validates input only. Nothing is delivered anywhere unless
     CONFIG.formEndpoint points to a real form service/backend.

     Error and status messages are stored as translation keys (data-i18n),
     so they switch language together with the rest of the page.
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Use our own accessible messages instead of browser pop-up bubbles
    form.noValidate = true;

    const fields = Array.from(form.querySelectorAll('.form-input, .form-textarea'));
    const submitButton = form.querySelector('[type="submit"]');
    if (!fields.length) return;

    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const REQUIRED_KEYS = {
      name: 'form.error.nameRequired',
      email: 'form.error.emailRequired',
      message: 'form.error.messageRequired',
    };

    /* Live status region (created once, so screen readers announce updates) */
    const status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    if (submitButton) {
      form.insertBefore(status, submitButton);
    } else {
      form.appendChild(status);
    }

    const setStatus = (key, state) => {
      if (key) {
        status.dataset.i18n = key;
        status.textContent = t(key);
      } else {
        delete status.dataset.i18n;
        status.textContent = '';
      }

      if (state) {
        status.dataset.state = state;
      } else {
        delete status.dataset.state;
      }
    };

    const getErrorKey = (field) => {
      const value = field.value.trim();

      if (field.required && !value) {
        return REQUIRED_KEYS[field.name] || 'form.error.required';
      }

      if (field.type === 'email' && value) {
        if (field.validity.typeMismatch || !EMAIL_PATTERN.test(value)) {
          return 'form.error.emailInvalid';
        }
      }

      if (!field.checkValidity()) return 'form.error.invalid';

      return '';
    };

    const clearError = (field) => {
      const error = document.getElementById(`${field.id}-error`);
      if (error) error.remove();
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      field.classList.remove('is-invalid');
    };

    const showError = (field, key) => {
      const errorId = `${field.id}-error`;
      let error = document.getElementById(errorId);

      if (!error) {
        error = document.createElement('p');
        error.id = errorId;
        error.className = 'form-error';
        (field.closest('.form-group') || field.parentElement).appendChild(error);
      }

      error.dataset.i18n = key;
      error.textContent = t(key);
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
      field.classList.add('is-invalid');
    };

    const validateField = (field) => {
      const key = getErrorKey(field);
      if (key) {
        showError(field, key);
        return false;
      }
      clearError(field);
      return true;
    };

    fields.forEach((field) => {
      // Validate when leaving a field, but only if something was typed
      field.addEventListener('blur', () => {
        if (field.value.trim() !== '') validateField(field);
      });

      // Once a field is marked invalid, re-check as the user fixes it
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    const setBusy = (isBusy) => {
      form.setAttribute('aria-busy', String(isBusy));
      if (submitButton) submitButton.disabled = isBusy;
    };

    const sendToEndpoint = async () => {
      setBusy(true);
      setStatus('form.status.sending', 'info');

      try {
        const response = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

        form.reset();
        setStatus('form.status.sent', 'success');
      } catch (error) {
        // Entered text is kept so the user can try again
        setStatus('form.status.failed', 'error');
      } finally {
        setBusy(false);
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      setStatus('', null);

      const invalidFields = fields.filter((field) => !validateField(field));

      if (invalidFields.length > 0) {
        setStatus('form.status.fix', 'error');
        invalidFields[0].focus();
        return;
      }

      if (!CONFIG.formEndpoint) {
        // Honest feedback: nothing has been delivered
        setStatus('form.status.notConnected', 'info');
        return;
      }

      sendToEndpoint();
    });
  }

  /* ------------------------------------------------------------------------
     5. External link safety
     Adds rel="noopener noreferrer" to links pointing to other websites.
     Existing href values are never changed.
     ------------------------------------------------------------------------ */
  function initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      let url;
      try {
        url = new URL(link.href);
      } catch (error) {
        return;
      }

      if (url.origin === window.location.origin) return;

      const relValues = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      relValues.add('noopener');
      relValues.add('noreferrer');
      link.setAttribute('rel', Array.from(relValues).join(' '));
    });
  }

  /* ------------------------------------------------------------------------
     6. Transformation image lightbox
     Uses the native <dialog> element: Escape and focus trapping come built
     in. Each image is wrapped in a real <button> so it works with a keyboard.
     Labels follow the active language.
     ------------------------------------------------------------------------ */
  function initLightbox() {
    const items = document.querySelectorAll('.transformation-item');
    if (!items.length) return;

    if (
      typeof HTMLDialogElement === 'undefined' ||
      typeof document.createElement('dialog').showModal !== 'function'
    ) {
      return; // Browser too old: images simply stay as normal images
    }

    /* Build the dialog once */
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.dataset.i18nAttr = 'aria-label:lightbox.dialogLabel';
    dialog.setAttribute('aria-label', t('lightbox.dialogLabel'));

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'lightbox-close';
    closeButton.dataset.i18nAttr = 'aria-label:lightbox.close';
    closeButton.setAttribute('aria-label', t('lightbox.close'));
    closeButton.textContent = '\u00D7';

    const figure = document.createElement('figure');
    figure.className = 'lightbox-figure';

    const lightboxImage = document.createElement('img');
    lightboxImage.className = 'lightbox-image';
    lightboxImage.alt = '';

    const lightboxCaption = document.createElement('figcaption');
    lightboxCaption.className = 'lightbox-caption';

    figure.append(lightboxImage, lightboxCaption);
    dialog.append(closeButton, figure);
    document.body.appendChild(dialog);

    let lastTrigger = null;

    const openLightbox = (image, caption, trigger) => {
      // Nothing to enlarge if the image file is missing or failed to load
      if (image.complete && image.naturalWidth === 0) return;

      const captionText = caption ? caption.textContent.trim() : '';

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = captionText;
      lightboxCaption.hidden = captionText === '';

      lastTrigger = trigger;
      dialog.showModal();
      closeButton.focus();
    };

    // Close button
    closeButton.addEventListener('click', () => dialog.close());

    // Backdrop click: only the dialog element itself counts, so clicks
    // on the image, caption or close button never close it by accident.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    // Runs for Escape, close button and backdrop alike
    dialog.addEventListener('close', () => {
      lightboxImage.removeAttribute('src');
      if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
      }
    });

    /* Wrap each gallery image in a keyboard-accessible button */
    const triggers = [];

    const updateTriggerLabel = (trigger, image, caption) => {
      const captionText = caption ? caption.textContent.trim() : '';
      const label = captionText || image.alt;
      trigger.setAttribute('aria-label', `${t('lightbox.enlargePrefix')}${label}`);
    };

    items.forEach((item) => {
      const image = item.querySelector('.transformation-image');
      if (!image || image.closest('.lightbox-trigger')) return;

      const caption = item.querySelector('.transformation-caption');

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'lightbox-trigger';
      trigger.setAttribute('aria-haspopup', 'dialog');
      updateTriggerLabel(trigger, image, caption);

      image.parentNode.insertBefore(trigger, image);
      trigger.appendChild(image);

      trigger.addEventListener('click', () => openLightbox(image, caption, trigger));
      triggers.push({ trigger, image, caption });
    });

    // Refresh button labels after a language change
    // (the dialog's own labels use data-i18n-attr and update automatically)
    onLanguageChange(() => {
      triggers.forEach(({ trigger, image, caption }) => updateTriggerLabel(trigger, image, caption));
    });
  }

  /* ------------------------------------------------------------------------
     Start-up: each feature is isolated so one failure cannot stop the rest.
     The language comes first so the form and lightbox use the right text.
     ------------------------------------------------------------------------ */
  function init() {
        [
      initLanguage,
      initLoader,
      initMobileNav,
      initHeaderScroll,
      initActiveNav,
      initScrollReveal,
      initContactForm,
      initExternalLinks,
      initLightbox,
    ].forEach((feature) => {
      try {
        feature();
      } catch (error) {
        console.warn(`Feature "${feature.name}" could not start.`, error);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();