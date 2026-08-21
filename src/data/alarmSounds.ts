export interface AlarmSound {
  id: string;
  name: string;
  desc: string;
  url: string;
}

/**
 * كل الأصوات تسجيلات بشرية حقيقية (مؤذنون وقُرّاء) — بدون أي أصوات مولّدة.
 * الروابط تم التحقق منها مباشرة.
 */
export const ALARM_SOUNDS: AlarmSound[] = [
  {
    id: 'adhan-doha',
    name: 'أذان كامل — تسجيل حي',
    desc: 'بصوت مؤذن حقيقي من الدوحة',
    url: 'https://archive.org/download/adhan.recordings.from.doha.qatar/Adhan_Doha_Qatar_02_Dhuhr_Adhan.mp3',
  },
  {
    id: 'adhan-fajr',
    name: 'أذان الفجر — تسجيل حي',
    desc: 'تسجيل ميداني لأذان الفجر',
    url: 'https://archive.org/download/adhan.recordings.from.doha.qatar/Adhan_Doha_Qatar_01_Fajr_Adhan.mp3',
  },
  {
    id: 'adhan-islamcan',
    name: 'أذان شجي',
    desc: 'أذان بصوت مؤذن حقيقي',
    url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
  },
  {
    id: 'salawat-ayah',
    name: 'آية الصلاة على النبي ﷺ',
    desc: '«إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ» — العفاسي',
    url: 'https://everyayah.com/data/Alafasy_128kbps/033056.mp3',
  },
  {
    id: 'takbir-eid',
    name: 'تكبيرات العيد',
    desc: 'بصوت الشيخ مصطفى أبو رواش',
    url: 'https://archive.org/download/eid-takbir-2021-mostafa-abo-rawash-mp-3-160-k/Eid%20Takbir%202021%20-%20Mostafa%20Abo%20Rawash%20_%20%D8%AA%D9%83%D8%A8%D9%8A%D8%B1%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B9%D9%8A%D8%AF%20%D9%83%D8%A7%D9%85%D9%84%D8%A9%20%D8%A8%D8%B5%D9%88%D8%AA%20%D9%85%D8%B5%D8%B7%D9%81%D9%89%20%D8%A7%D8%A8%D9%88%D8%B1%D9%88%D8%A7%D8%B4%20-%20%20%D9%85%D9%83%D8%B1%D8%B1%D9%87%20%D9%84%D9%85%D8%AF%D9%87%20%D8%B3%D8%A7%D8%B9%D9%87(MP3_160K).mp3',
  },
  {
    id: 'takbir-ayah',
    name: '«وَرَبَّكَ فَكَبِّرْ»',
    desc: 'سورة المدثر — العفاسي',
    url: 'https://everyayah.com/data/Alafasy_128kbps/074003.mp3',
  },
  {
    id: 'ayat-kursi',
    name: 'آية الكرسي',
    desc: 'البقرة ٢٥٥ — العفاسي',
    url: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3',
  },
  {
    id: 'fatiha',
    name: 'سورة الفاتحة كاملة',
    desc: 'مشاري راشد العفاسي',
    url: 'https://server8.mp3quran.net/afs/001.mp3',
  },
  {
    id: 'ikhlas',
    name: 'سورة الإخلاص',
    desc: 'مشاري راشد العفاسي',
    url: 'https://server8.mp3quran.net/afs/112.mp3',
  },
  {
    id: 'mulk',
    name: 'سورة الملك',
    desc: 'مشاري راشد العفاسي',
    url: 'https://server8.mp3quran.net/afs/067.mp3',
  },
];

export const DEFAULT_SOUND_ID = 'adhan-doha';

export function getSound(id: string): AlarmSound {
  return ALARM_SOUNDS.find((s) => s.id === id) || ALARM_SOUNDS[0];
}
