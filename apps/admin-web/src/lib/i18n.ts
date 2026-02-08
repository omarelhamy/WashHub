import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: { title: 'WashHub Admin' },
      nav: { dashboard: 'Dashboard', providers: 'Providers', clients: 'Clients', cars: 'Cars', washJobs: 'Wash Jobs', plans: 'Plans', washPlans: 'Wash Plans', enrollment: 'Enrollment', payments: 'Payments', clientComments: 'Comments', qr: 'QR / Enroll', tasks: "Today's Tasks", settings: 'Settings', logout: 'Logout' },
      common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        back: 'Back',
        save: 'Save',
        cancel: 'Cancel',
        total: 'Total',
        themeLight: 'Light mode',
        themeDark: 'Dark mode',
        tryAgain: 'Try again',
        goToLogin: 'Go to login',
        viewAll: 'View all',
        add: 'Add',
        noResults: 'No results yet.',
      },
      components: {
        clientSelect: { allClients: 'All clients', searchPlaceholder: 'Search by name or phone...', noClientsFound: 'No clients found.', selectClient: 'Select client' },
      },
      pages: {
        login: { title: 'Sign in', titleAdmin: 'Super Admin sign in', titleProvider: 'Provider sign in', subtitle: 'Enter your credentials below to log into your account.', subtitleProvider: 'Sign in with your phone and password.', chooseLogin: 'Choose login', chooseLoginSubtitle: 'Select how you want to sign in.', appTitle: 'WashHub Admin', superAdmin: 'Super Admin', provider: 'Provider', login: 'Sign in', signingIn: 'Signing in, please wait…', email: 'Email', phone: 'Phone', providerId: 'Provider ID', password: 'Password' },
        superDashboard: { title: 'Super Admin Dashboard', providers: 'Providers', clients: 'Clients', washJobs: 'Wash Jobs', subtitle: 'Manage providers, plans, and view all clients.', clientsSubtitle: 'View all clients across providers.', recentProviders: 'Recent providers' },
        providersList: { title: 'Providers', allProviders: 'All providers', createProvider: 'Create provider', newProvider: 'New provider', name: 'Name', plan: 'Plan', status: 'Status', enabled: 'Enabled', trialEndsAt: 'Trial ends', settings: 'Settings' },
        superClientsList: { title: 'All clients', filterByProvider: 'Filter by provider', provider: 'Provider', name: 'Name', phone: 'Phone', cars: 'Cars', actions: 'Actions', viewDetails: 'View details', edit: 'Edit', remove: 'Remove', confirmRemove: 'Remove this client? This cannot be undone.', removeSuccess: 'Client removed.' },
        superClientDetail: { backToClients: 'Back to clients', backToClient: 'Back to client', clientDetails: 'Client details', provider: 'Provider', edit: 'Edit', editClient: 'Edit client', remove: 'Remove', confirmRemove: 'Remove this client? This cannot be undone.', removeSuccess: 'Client removed.', updateSuccess: 'Client updated.' },
        superProviderDetail: { title: 'Provider detail', backToProviders: 'Back to providers', clients: 'Clients', washJobs: 'Wash jobs', profit: 'Profit', totalPaid: 'Total paid', totalPending: 'Total pending', schedules: 'Schedules', providerSettings: 'Provider settings', noClients: 'No clients.', noJobs: 'No wash jobs.', editProvider: 'Edit provider', plans: 'Plans', platformInvoice: 'Platform invoice (per car)', platformInvoiceDesc: 'Provider pays per car. Invoice = cars × price per car.', carsCount: 'Cars', pricePerCar: 'Price per car', invoiceTotal: 'Invoice total' },
        editProvider: { billingTitle: 'Billing (per car)', billingDesc: 'Provider pays the platform per car. Set the fixed price per car for this provider. Invoice = number of cars × price per car.', pricePerCar: 'Price per car', billingCurrency: 'Currency' },
        createProvider: { title: 'Create provider', name: 'Name', subscriptionPlan: 'Subscription plan', subscriptionStatus: 'Status', trialEndsAt: 'Trial ends at', enabled: 'Enabled', create: 'Create', pricePerCar: 'Price per car (optional)', billingCurrency: 'Currency' },
        superPlans: { title: 'Wash plans', selectProvider: 'Select a provider to manage wash plans.', managePlans: 'Manage plans', createPlan: 'Create plan', editPlan: 'Edit plan', deletePlan: 'Delete plan', noPlans: 'No plans for this provider.' },
        settings: { title: 'Settings', platform: 'Platform settings', providerSettings: 'Provider settings (edit per provider)' },
        providerDashboard: { title: 'Provider Dashboard', clients: 'Clients', todayJobs: "Today's Jobs", pendingPayments: 'Pending Payments', subtitle: 'Use the navigation to manage clients, cars, wash jobs, plans, and payments.' },
        clientsList: { title: 'Clients', allClients: 'All clients', name: 'Name', phone: 'Phone', enrolled: 'Enrolled' },
        clientDetail: { title: 'Client details', backToClients: 'Back to clients', phone: 'Phone', enrolled: 'Enrolled', enrollmentCode: 'Enrollment code', cars: 'Cars', payments: 'Payments', comments: 'Comments', viewInCars: 'View in Cars', noCars: 'No cars registered.', noPayments: 'No payments yet.', noComments: 'No comments.', addViewComments: 'Add / view all', failedToLoad: 'Failed to load client.' },
        carsList: { title: 'Cars', filterByClient: 'Filter by client', allClients: 'All clients', searchClient: 'Search client by name or phone...', noClientsFound: 'No clients found.', plate: 'Plate', model: 'Model', color: 'Color', client: 'Client', actions: 'Actions', viewClient: 'View client', editCar: 'Edit car', removeCar: 'Remove car', confirmRemoveCar: 'Remove this car? This cannot be undone.', removeSuccess: 'Car removed.', editCarTitle: 'Edit car', previousPage: 'Previous', nextPage: 'Next', pageOf: 'Page {{current}} of {{total}}', noCars: 'No cars found.' },
        washJobsList: { title: 'Wash Jobs', jobs: 'Jobs', scheduled: 'Scheduled', status: 'Status', filterByDate: 'Filter by date', allDates: 'All dates', today: 'Today', addWashJob: 'Add wash job', generateTodaysJobs: "Generate today's jobs", client: 'Client', car: 'Car', scheduledAt: 'Scheduled at', noJobsForDate: 'No jobs for this date.', addSuccess: 'Wash job added.', generateSuccess: "Today's jobs generated.", generationReport: "Generated {{created}} new wash job(s) for today. {{skipped}} already had a job and were skipped.", generationReportNone: 'No new jobs to generate. All enrolled clients already have jobs for today.', generationReportOnlySkipped: 'All enrolled clients already have jobs for today ({{skipped}} skipped). No duplicates created.', dismiss: 'Dismiss', comments: 'Comments', commentsAction: 'Comments', addComment: 'Add comment', commentPlaceholder: 'Note for worker...', commentAdded: 'Comment added.', commentUpdated: 'Comment updated.', commentDeleted: 'Comment deleted.', editComment: 'Edit', deleteComment: 'Delete', confirmDeleteComment: 'Delete this comment?', noCommentsYet: 'No comments yet.', addNewComment: 'Add comment', close: 'Close' },
        washPlansList: { title: 'Wash Plans', plans: 'Plans', name: 'Name', days: 'Days', timesPerWeek: 'Times/Week', location: 'Location', washes: 'Washes', subtitle: 'Use Enrollment to add/remove clients from plans.' },
        enrollment: { title: 'Plan Enrollment Wizard', step1: 'Step 1: Select a wash plan', selectPlan: 'Select plan', inPlan: 'In this plan', notInPlan: 'Not in this plan', noEnrolled: 'No clients enrolled yet.', allInPlan: 'All clients are in this plan or no clients.', add: 'Add', remove: 'Remove', selectPlanHint: 'Select a plan to see clients and add/remove enrollments.' },
        payments: { title: 'Payments', markPaid: 'Mark client paid (monthly renewal)', client: 'Client', amount: 'Amount', method: 'Method', markPaidBtn: 'Mark paid', history: 'Payment history' },
        clientComments: { title: 'Client Comments', subtitle: 'Internal comments per client. Visible only to provider admins and workers.', selectClient: 'Select client', commentsFor: 'Comments for', addComment: 'Add comment', noComments: 'No comments yet.', internalNote: 'Internal note', addCommentBtn: 'Add comment' },
        qr: { title: 'Client Enrollment – QR / Link', shareLink: 'Share this link or show as QR for clients to enroll:', enrollmentUrl: 'Enrollment URL', backendHint: 'Backend public enroll:', qrHint: 'For a QR image, use any QR generator with the URL above.' },
        worker: { title: "Worker – Today's Tasks", date: 'Date', start: 'Start', complete: 'Complete', noJobs: 'No jobs for today.', comments: 'Notes' },
      },
    },
  },
  ar: {
    translation: {
      app: { title: 'WashHub أدمن' },
      nav: { dashboard: 'لوحة التحكم', providers: 'مقدمي الخدمة', clients: 'العملاء', cars: 'السيارات', washJobs: 'غسيل السيارات', plans: 'الباقات', washPlans: 'باقات الغسيل', enrollment: 'التسجيل في الباقة', payments: 'المدفوعات', clientComments: 'التعليقات', qr: 'QR / التسجيل', tasks: 'مهام اليوم', settings: 'الإعدادات', logout: 'تسجيل الخروج' },
      common: {
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        back: 'رجوع',
        save: 'حفظ',
        cancel: 'إلغاء',
        total: 'المجموع',
        themeLight: 'الوضع الفاتح',
        themeDark: 'الوضع الداكن',
        tryAgain: 'حاول مرة أخرى',
        goToLogin: 'الذهاب لتسجيل الدخول',
        viewAll: 'عرض الكل',
        add: 'إضافة',
        noResults: 'لا توجد نتائج بعد.',
      },
      components: {
        clientSelect: { allClients: 'جميع العملاء', searchPlaceholder: 'البحث بالاسم أو الهاتف...', noClientsFound: 'لا عملاء.', selectClient: 'اختر العميل' },
      },
      pages: {
        login: { title: 'تسجيل الدخول', titleAdmin: 'تسجيل دخول المدير العام', titleProvider: 'تسجيل دخول مقدم الخدمة', subtitle: 'أدخل بياناتك أدناه لتسجيل الدخول.', subtitleProvider: 'سجّل الدخول برقم الهاتف وكلمة المرور.', chooseLogin: 'اختر نوع تسجيل الدخول', chooseLoginSubtitle: 'اختر الطريقة التي تريد تسجيل الدخول بها.', appTitle: 'WashHub أدمن', superAdmin: 'مدير عام', provider: 'مقدم الخدمة', login: 'تسجيل الدخول', signingIn: 'جاري تسجيل الدخول، الرجاء الانتظار…', email: 'البريد', phone: 'الهاتف', providerId: 'معرف المزود', password: 'كلمة المرور' },
        superDashboard: { title: 'لوحة المدير العام', providers: 'مقدمو الخدمة', clients: 'العملاء', washJobs: 'غسيل السيارات', subtitle: 'إدارة المزودين والباقات وعرض جميع العملاء.', clientsSubtitle: 'عرض جميع العملاء عبر المزودين.', recentProviders: 'المزودون الأخيرون' },
        providersList: { title: 'مقدمو الخدمة', allProviders: 'جميع المزودين', createProvider: 'إضافة مزود', newProvider: 'مزود جديد', name: 'الاسم', plan: 'الباقة', status: 'الحالة', enabled: 'مفعّل', trialEndsAt: 'انتهاء التجربة', settings: 'الإعدادات' },
        superClientsList: { title: 'جميع العملاء', filterByProvider: 'تصفية حسب المزود', provider: 'المزود', name: 'الاسم', phone: 'الهاتف', cars: 'السيارات', actions: 'إجراءات', viewDetails: 'عرض التفاصيل', edit: 'تعديل', remove: 'حذف', confirmRemove: 'حذف هذا العميل؟ لا يمكن التراجع.', removeSuccess: 'تم حذف العميل.' },
        superClientDetail: { backToClients: 'العودة للعملاء', backToClient: 'العودة للعميل', clientDetails: 'تفاصيل العميل', provider: 'المزود', edit: 'تعديل', editClient: 'تعديل العميل', remove: 'حذف', confirmRemove: 'حذف هذا العميل؟ لا يمكن التراجع.', removeSuccess: 'تم حذف العميل.', updateSuccess: 'تم تحديث العميل.' },
        superProviderDetail: { title: 'تفاصيل المزود', backToProviders: 'العودة للمزودين', clients: 'العملاء', washJobs: 'وظائف الغسيل', profit: 'الأرباح', totalPaid: 'إجمالي المدفوع', totalPending: 'إجمالي المعلق', schedules: 'الجداول', providerSettings: 'إعدادات المزود', noClients: 'لا عملاء.', noJobs: 'لا وظائف غسيل.', editProvider: 'تعديل المزود', plans: 'الباقات', platformInvoice: 'فاتورة المنصة (لكل سيارة)', platformInvoiceDesc: 'المزود يدفع لكل سيارة. الفاتورة = عدد السيارات × السعر لكل سيارة.', carsCount: 'السيارات', pricePerCar: 'السعر لكل سيارة', invoiceTotal: 'إجمالي الفاتورة' },
        editProvider: { billingTitle: 'الفوترة (لكل سيارة)', billingDesc: 'المزود يدفع للمنصة لكل سيارة. حدد السعر الثابت لكل سيارة لهذا المزود. الفاتورة = عدد السيارات × السعر لكل سيارة.', pricePerCar: 'السعر لكل سيارة', billingCurrency: 'العملة' },
        createProvider: { title: 'إضافة مزود', name: 'الاسم', subscriptionPlan: 'باقة الاشتراك', subscriptionStatus: 'الحالة', trialEndsAt: 'انتهاء التجربة', enabled: 'مفعّل', create: 'إنشاء', pricePerCar: 'السعر لكل سيارة (اختياري)', billingCurrency: 'العملة' },
        superPlans: { title: 'باقات الغسيل', selectProvider: 'اختر مزوداً لإدارة باقات الغسيل.', managePlans: 'إدارة الباقات', createPlan: 'إضافة باقة', editPlan: 'تعديل الباقة', deletePlan: 'حذف الباقة', noPlans: 'لا باقات لهذا المزود.' },
        settings: { title: 'الإعدادات', platform: 'إعدادات المنصة', providerSettings: 'إعدادات المزود (تعديل لكل مزود)' },
        providerDashboard: { title: 'لوحة مقدم الخدمة', clients: 'العملاء', todayJobs: 'مهام اليوم', pendingPayments: 'المدفوعات المعلقة', subtitle: 'استخدم القائمة لإدارة العملاء والسيارات ووظائف الغسيل والباقات والمدفوعات.' },
        clientsList: { title: 'العملاء', allClients: 'جميع العملاء', name: 'الاسم', phone: 'الهاتف', enrolled: 'مسجل' },
        clientDetail: { title: 'تفاصيل العميل', backToClients: 'العودة للعملاء', phone: 'الهاتف', enrolled: 'مسجل', enrollmentCode: 'رمز التسجيل', cars: 'السيارات', payments: 'المدفوعات', comments: 'التعليقات', viewInCars: 'عرض في السيارات', noCars: 'لا سيارات مسجلة.', noPayments: 'لا مدفوعات بعد.', noComments: 'لا تعليقات.', addViewComments: 'إضافة / عرض الكل', failedToLoad: 'فشل تحميل العميل.' },
        carsList: { title: 'السيارات', filterByClient: 'تصفية حسب العميل', allClients: 'جميع العملاء', searchClient: 'البحث بالاسم أو الهاتف...', noClientsFound: 'لا عملاء.', plate: 'اللوحة', model: 'الموديل', color: 'اللون', client: 'العميل', actions: 'إجراءات', viewClient: 'عرض العميل', editCar: 'تعديل السيارة', removeCar: 'حذف السيارة', confirmRemoveCar: 'حذف هذه السيارة؟ لا يمكن التراجع.', removeSuccess: 'تم حذف السيارة.', editCarTitle: 'تعديل السيارة', previousPage: 'السابق', nextPage: 'التالي', pageOf: 'صفحة {{current}} من {{total}}', noCars: 'لا توجد سيارات.' },
        washJobsList: { title: 'وظائف الغسيل', jobs: 'الوظائف', scheduled: 'مجدول', status: 'الحالة', filterByDate: 'تصفية بالتاريخ', allDates: 'كل التواريخ', today: 'اليوم', addWashJob: 'إضافة غسيل', generateTodaysJobs: 'توليد مهام اليوم', client: 'العميل', car: 'السيارة', scheduledAt: 'مجدول في', noJobsForDate: 'لا مهام لهذا التاريخ.', addSuccess: 'تمت إضافة المهمة.', generateSuccess: 'تم توليد مهام اليوم.', generationReport: 'تم إنشاء {{created}} مهمة غسيل جديدة لليوم. {{skipped}} لديها مهمة مسبقاً وتم تخطيها.', generationReportNone: 'لا مهام جديدة. جميع العملاء المسجلين لديهم مهام لليوم.', generationReportOnlySkipped: 'جميع العملاء المسجلين لديهم مهام لليوم ({{skipped}} تم تخطيها). لم يتم إنشاء تكرارات.', dismiss: 'إغلاق', comments: 'تعليقات', commentsAction: 'تعليقات', addComment: 'إضافة تعليق', commentPlaceholder: 'ملاحظة للعامل...', commentAdded: 'تمت إضافة التعليق.', commentUpdated: 'تم تحديث التعليق.', commentDeleted: 'تم حذف التعليق.', editComment: 'تعديل', deleteComment: 'حذف', confirmDeleteComment: 'حذف هذا التعليق؟', noCommentsYet: 'لا تعليقات بعد.', addNewComment: 'إضافة تعليق', close: 'إغلاق' },
        washPlansList: { title: 'باقات الغسيل', plans: 'الباقات', name: 'الاسم', days: 'الأيام', timesPerWeek: 'مرات/أسبوع', location: 'الموقع', washes: 'الغسلات', subtitle: 'استخدم التسجيل لإضافة/إزالة العملاء من الباقات.' },
        enrollment: { title: 'معالج تسجيل الباقة', step1: 'الخطوة 1: اختر باقة الغسيل', selectPlan: 'اختر الباقة', inPlan: 'في هذه الباقة', notInPlan: 'ليس في هذه الباقة', noEnrolled: 'لا عملاء مسجلون بعد.', allInPlan: 'جميع العملاء في هذه الباقة أو لا يوجد عملاء.', add: 'إضافة', remove: 'إزالة', selectPlanHint: 'اختر باقة لعرض العملاء وإضافة/إزالة التسجيلات.' },
        payments: { title: 'المدفوعات', markPaid: 'تسجيل دفعة العميل (تجديد شهري)', client: 'العميل', amount: 'المبلغ', method: 'الطريقة', markPaidBtn: 'تسجيل الدفع', history: 'سجل المدفوعات' },
        clientComments: { title: 'تعليقات العملاء', subtitle: 'تعليقات داخلية لكل عميل. مرئية فقط لمديري وعمال المزود.', selectClient: 'اختر العميل', commentsFor: 'تعليقات لـ', addComment: 'إضافة تعليق', noComments: 'لا تعليقات بعد.', internalNote: 'ملاحظة داخلية', addCommentBtn: 'إضافة تعليق' },
        qr: { title: 'تسجيل العميل – QR / الرابط', shareLink: 'شارك هذا الرابط أو اعرضه كـ QR للتسجيل:', enrollmentUrl: 'رابط التسجيل', backendHint: 'واجهة التسجيل العامة:', qrHint: 'لصورة QR، استخدم أي مولد QR مع الرابط أعلاه.' },
        worker: { title: 'مهام اليوم – العامل', date: 'التاريخ', start: 'بدء', complete: 'إكمال', noJobs: 'لا مهام لليوم.', comments: 'ملاحظات' },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setRtl(lang: string) {
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

export default i18n;
