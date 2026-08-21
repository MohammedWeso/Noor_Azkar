/** 114 surah names (Arabic) */
export const SURAHS: string[] = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف',
  'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
  'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون',
  'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص',
  'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
  'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور', 'النجم',
  'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك',
  'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة',
  'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار',
  'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر',
  'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر',
  'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة',
  'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد',
  'الإخلاص', 'الفلق', 'الناس',
];

export interface Sheikh {
  id: string;
  name: string;
  style: string;
  server: string;
}

/** Reciters served by mp3quran.net direct servers (verified live) */
export const SHEIKHS: Sheikh[] = [
  { id: 'afs', name: 'مشاري راشد العفاسي', style: 'حفص عن عاصم', server: 'https://server8.mp3quran.net/afs' },
  { id: 'basit', name: 'عبد الباسط عبد الصمد', style: 'المصحف المرتّل', server: 'https://server7.mp3quran.net/basit' },
  { id: 'husr', name: 'محمود خليل الحصري', style: 'المصحف المرتّل', server: 'https://server13.mp3quran.net/husr' },
  { id: 'minsh', name: 'محمد صديق المنشاوي', style: 'المصحف المرتّل', server: 'https://server10.mp3quran.net/minsh' },
  { id: 'sds', name: 'عبد الرحمن السديس', style: 'حفص عن عاصم', server: 'https://server11.mp3quran.net/sds' },
  { id: 'shur', name: 'سعود الشريم', style: 'حفص عن عاصم', server: 'https://server7.mp3quran.net/shur' },
  { id: 'maher', name: 'ماهر المعيقلي', style: 'حفص عن عاصم', server: 'https://server12.mp3quran.net/maher' },
  { id: 'yasser', name: 'ياسر الدوسري', style: 'حفص عن عاصم', server: 'https://server11.mp3quran.net/yasser' },
  { id: 'hani', name: 'هاني الرفاعي', style: 'حفص عن عاصم', server: 'https://server8.mp3quran.net/hani' },
  { id: 'sgmd', name: 'سعد الغامدي', style: 'حفص عن عاصم', server: 'https://server7.mp3quran.net/s_gmd' },
  { id: 'frsa', name: 'فارس عبّاد', style: 'حفص عن عاصم', server: 'https://server8.mp3quran.net/frs_a' },
];

export function surahUrl(sheikh: Sheikh, surahNo: number): string {
  return `${sheikh.server}/${String(surahNo).padStart(3, '0')}.mp3`;
}
