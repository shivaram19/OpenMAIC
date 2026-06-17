export const BOARD_OPTIONS = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'msbshse', label: 'Maharashtra State Board' },
  { value: 'kseab', label: 'Karnataka State Board' },
  { value: 'dge_tn', label: 'Tamil Nadu State Board' },
  { value: 'upmsp', label: 'Uttar Pradesh State Board' },
  { value: 'bseb', label: 'Bihar State Board' },
  { value: 'icse', label: 'ICSE' },
  { value: 'other', label: 'Other / Multiple' },
] as const;

export const NAV_LINKS = [
  { label: 'How it works', href: '#loop' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
] as const;

export const SANSKRIT_QUOTE = {
  text: 'Sa tu dīrghakāla-nairantarya-satkārādarāsevito dṛḍhabhūmiḥ',
  translation:
    'Practice becomes firmly established when sustained with devotion, without interruption, over a long time.',
  source: 'Patañjali, Yoga Sūtra 1.14',
} as const;
