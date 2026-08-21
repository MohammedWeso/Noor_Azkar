export interface DhikrPhrase {
  id: string;
  text: string;
  target: number;
  virtue?: string;
}

export const DHIKR_PHRASES: DhikrPhrase[] = [
  { id: 'subhan', text: 'سبحان الله', target: 33, virtue: 'غِراس الجنة' },
  { id: 'hamd', text: 'الحمد لله', target: 33, virtue: 'تملأ الميزان' },
  { id: 'takbir', text: 'الله أكبر', target: 33, virtue: 'من أحب الكلام إلى الله' },
  { id: 'tahlil', text: 'لا إله إلا الله', target: 100, virtue: 'أفضل الذكر' },
  { id: 'istighfar', text: 'أستغفر الله', target: 100, virtue: 'من لزمه جعل الله له من كل هم فرجًا' },
  {
    id: 'subhan-bihamd',
    text: 'سبحان الله وبحمده',
    target: 100,
    virtue: 'حُطَّت خطاياه وإن كانت مثل زبد البحر',
  },
  { id: 'azim', text: 'سبحان الله العظيم وبحمده', target: 100, virtue: 'كلمتان خفيفتان على اللسان' },
  {
    id: 'hawqala',
    text: 'لا حول ولا قوة إلا بالله',
    target: 100,
    virtue: 'كنز من كنوز الجنة',
  },
  {
    id: 'salawat',
    text: 'اللهم صلِّ وسلِّم على نبينا محمد',
    target: 100,
    virtue: 'من صلى عليّ صلاة صلى الله عليه بها عشرًا',
  },
  {
    id: 'tawhid-full',
    text: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
    target: 100,
    virtue: 'كانت له عدل عشر رقاب',
  },
  {
    id: 'baqiyat',
    text: 'سبحان الله والحمد لله ولا إله إلا الله والله أكبر',
    target: 33,
    virtue: 'أحب الكلام إلى الله',
  },
];
