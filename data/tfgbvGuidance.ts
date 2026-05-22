// Legal and Safety Guidance for TFGBV/Online Harms
// Supports English, Swahili, and Kalenjin

import type { TfgbvLanguage } from './tfgbvQuestions';

export interface LegalGuidance {
  title: Record<TfgbvLanguage, string>;
  content: Record<TfgbvLanguage, string[]>;
}

export interface PlatformReportingGuide {
  platform: string;
  icon: string;
  steps: Record<TfgbvLanguage, string[]>;
  link: string;
}

export interface SafetyTip {
  category: Record<TfgbvLanguage, string>;
  icon: string;
  tips: Record<TfgbvLanguage, string[]>;
}

// Legal Information by Harm Type
export const LEGAL_GUIDANCE_BY_TYPE: Record<string, LegalGuidance> = {
  sextortion: {
    title: {
      en: 'Sextortion (Image-Based Abuse)',
      sw: 'Sextortion (Unyanyasaji Kulingana na Picha)',
      kal: 'Sextortion (Abusetab Picha)'
    },
    content: {
      en: [
        'Under Kenya\'s Computer Misuse and Cybercrimes Act 2018, sextortion is a criminal offense punishable by up to 20 years imprisonment',
        'Article 31 of the Constitution guarantees your right to privacy - sharing intimate images without consent violates this right',
        'The Protection of Victims of Domestic Violence Act applies if the perpetrator is known to you',
        'Even if you shared images consensually, threatening to distribute them is illegal',
        'You can obtain a protection order from the magistrate court',
        'Evidence preservation is critical - save all messages, profiles, and screenshots before blocking'
      ],
      sw: [
        'Kwa mujibu wa Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao wa Kenya 2018, sextortion ni kosa la jinai linaloadhibiwa kwa hadi miaka 20 gerezani',
        'Ibara ya 31 ya Katiba inahakikisha haki yako ya faragha - kusambaza picha za kimapenzi bila idhini inakiuka haki hii',
        'Sheria ya Ulinzi wa Wahanga wa Udhalimu wa Nyumbani inatumika ikiwa mkorofi anakujua',
        'Hata ikiwa ulishiriki picha kwa hiari, kutishia kuzisambaza ni haramu',
        'Unaweza kupata amri ya ulinzi kutoka kwa mahakama ya mwandamizi',
        'Kuhifadhi ushahidi ni muhimu - hifadhi ujumbe wote, wasifu, na screenshots kabla ya kuzuia'
      ],
      kal: [
        'Computer Misuse ak Cybercrimes Act 2018 nebo Kenya, sextortion ko kosa criminal nebo prisonet years 20',
        'Article 31 nebo Constitution neguarantee rightyab privacy - distribute intimate images maamutab consent koviolate right',
        'Protection of Victims of Domestic Violence Act apply ngun perpetrator nebo aanai',
        'Ngunebiwaa share images ak consent, threaten distribute illegal',
        'Obtain protection order magistrate court',
        'Evidence preservation critical - save messages, profiles, screenshots before block'
      ]
    }
  },
  cyberstalking: {
    title: {
      en: 'Cyberstalking & Online Harassment',
      sw: 'Kufuatilia Mtandaoni na Uharifu Mtandaoni',
      kal: 'Cyberstalking ak Uharifu Online'
    },
    content: {
      en: [
        'Cyberstalking is a felony under Section 27 of the Computer Misuse and Cybercrimes Act 2018',
        'Repeated unwanted contact, monitoring, or threats online constitutes cyberstalking',
        'You have the right to report to the National Police Service or Directorate of Criminal Investigations (DCI)',
        'Obtain a restraining order through the Protection Against Domestic Violence Act',
        'Keep a harassment log with dates, times, and descriptions of each incident',
        'The National KE-CIRT/CC (Kenya Computer Incident Response Team) can assist with technical aspects'
      ],
      sw: [
        'Kufuatilia mtandaoni ni kosa la jinai chini ya Kifungu cha 27 cha Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao 2018',
        'Mawasiliano yasiyotakiwa yanayojirudia, ufuatiliaji, au vitisho mtandaoni ni kufuatilia mtandaoni',
        'Una haki ya kuripoti kwa Huduma ya Polisi ya Kitaifa au Idara ya Uchunguzi wa Makosa (DCI)',
        'Pata amri ya kukataza kupitia Sheria ya Ulinzi Dhidi ya Udhalimu wa Nyumbani',
        'Weka kumbukumbu ya uharifu na tarehe, saa, na maelezo ya kila tukio',
        'KE-CIRT/CC ya Kitaifa ya Kenya inaweza kusaidia kwa masuala ya kiufundi'
      ],
      kal: [
        'Cyberstalking ko felony Section 27 Computer Misuse ak Cybercrimes Act 2018',
        'Repeated unwanted contact, monitoring, threats online constitute cyberstalking',
        'Right report National Police Service ak Directorate of Criminal Investigations (DCI)',
        'Obtain restraining order Protection Against Domestic Violence Act',
        'Keep harassment log ak dates, times, descriptions incident tugul',
        'National KE-CIRT/CC (Kenya Computer Incident Response Team) assist ak technical aspects'
      ]
    }
  },
  'non-consensual_sharing': {
    title: {
      en: 'Non-Consensual Image Sharing',
      sw: 'Kusambaza Picha Bila Idhini',
      kal: 'Non-Consensual Image Sharing'
    },
    content: {
      en: [
        'Sharing intimate images without consent violates Section 37 of the Computer Misuse and Cybercrimes Act (up to 25 years imprisonment)',
        'This is also a violation of the Data Protection Act 2019 - your personal data cannot be shared without consent',
        'You can demand platform takedowns under the Digital Millennium Copyright Act (DMCA) provisions',
        'Report to the Communications Authority of Kenya (CA) for platform compliance',
        'Seek civil remedies including damages for emotional distress',
        'The Odipo Commission on the Implementation of the Constitution supports victims\' rights'
      ],
      sw: [
        'Kusambaza picha za kimapenzi bila idhini kunaikiuka Kifungu cha 37 cha Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao (hadi miaka 25 gerezani)',
        'Hii pia ni ukiukwaji wa Sheria ya Ulinzi wa Data 2019 - data zako za kibinafsi haziwezi kushirikiwa bila idhini',
        'Unaweza kuomba majukwaa kuondoa chini ya masharti ya Digital Millennium Copyright Act (DMCA)',
        'Ripoti kwa Mamlaka ya Mawasiliano ya Kenya (CA) kwa utii wa jukwaa',
        'Tafuta njia za kiraia zikiwemo fidia kwa msongo wa kihisia',
        'Tume ya Odipo ya Utekelezaji wa Katiba inasaidia haki za wahanga'
      ],
      kal: [
        'Sharing intimate images maamutab consent violate Section 37 Computer Misuse ak Cybercrimes Act (years 25 prison)',
        'Violation Data Protection Act 2019 - personal data maamutab consent maamushare',
        'Demand platform takedowns Digital Millennium Copyright Act (DMCA) provisions',
        'Report Communications Authority Kenya (CA) platform compliance',
        'Seek civil remedies damages emotional distress',
        'Odipo Commission Implementation Constitution support victims rights'
      ]
    }
  },
  deepfake: {
    title: {
      en: 'Deepfake/AI-Generated Content',
      sw: 'Deepfake/Maudhui Yanayotengenezwa na AI',
      kal: 'Deepfake/AI-Generated Content'
    },
    content: {
      en: [
        'Creating or sharing deepfake intimate images is a criminal offense under the Computer Misuse and Cybercrimes Act',
        'Kenya does not yet have specific deepfake legislation, but existing cybercrime laws apply',
        'Defamation and character assassination laws may also apply',
        'Report to the Kenya Film Classification Board (KFCB) for content regulation violations',
        'Contact platforms immediately - most have AI-generated content policies',
        'Preserve all evidence including original source material'
      ],
      sw: [
        'Kuunda au kusambaza picha za kimapenzi za deepfake ni kosa la jinai chini ya Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao',
        'Kenya bado haina sheria mahususi za deepfake, lakini sheria za uhalifu wa mtandao zilizopo zinaatumika',
        'Sheria za kashfa na mauaji ya tabia pia zinaweza katumika',
        'Ripoti kwa Bodi ya Uainishaji wa Filamu ya Kenya (KFCB) kwa ukiukwaji wa kanuni za maudhui',
        'Wasiliana na majukwaa mara moja - mengi yana sera za maudhui yanayotengenezwa na AI',
        'Hifadhi ushahidi wote ukiwemo chanzo asili'
      ],
      kal: [
        'Create ak share deepfake intimate images criminal offense Computer Misuse ak Cybercrimes Act',
        'Kenya maam yet specific deepfake legislation, existing cybercrime laws apply',
        'Defamation ak character assassination laws apply',
        'Report Kenya Film Classification Board (KFCB) content regulation violations',
        'Contact platforms immediately - most AI-generated content policies',
        'Preserve evidence tugul original source material'
      ]
    }
  },
  harassment: {
    title: {
      en: 'Online Harassment & Bullying',
      sw: 'Uharifu na Udhalimu Mtandaoni',
      kal: 'Uharifu ak Udhalimu Online'
    },
    content: {
      en: [
        'Online harassment violates Section 27 and 28 of the Computer Misuse and Cybercrimes Act',
        'Hate speech and incitement are criminal offenses under the National Cohesion and Integration Act',
        'Workplace online harassment may violate the Employment Act 2007',
        'Minors have additional protections under the Children Act 2022',
        'Report to the Office of the Director of Public Prosecutions (ODPP) for serious cases',
        'NGOs like Centre Against Torture (CAT) provide free legal aid to victims'
      ],
      sw: [
        'Uharifu mtandaoni unakiuka Kifungu cha 27 na 28 cha Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao',
        'Hate speech na uchochezi ni makosa ya jinai chini ya Sheria ya Umoja wa Kitaifa na Uunganisho',
        'Uharifu wa kazini mtandaoni unaweza kuikiuka Sheria ya Ajira 2007',
        'Watoto wana ulinzi zaidi chini ya Sheria ya Watoto 2022',
        'Ripoti kwa Ofisi ya Mkurugenzi wa Mashitaka ya Umma (ODPP) kwa kesi kali',
        'NGOs kama Centre Against Torture (CAT) hutoa msaada wa kisheria bila malipo kwa wahanga'
      ],
      kal: [
        'Online harassment violate Section 27 ak 28 Computer Misuse ak Cybercrimes Act',
        'Hate speech ak incitement criminal offenses National Cohesion ak Integration Act',
        'Workplace online harassment violate Employment Act 2007',
        'Minors protections Children Act 2022',
        'Report Office Director Public Prosecutions (ODPP) serious cases',
        'NGOs Centre Against Torture (CAT) free legal aid victims'
      ]
    }
  },
  identity_theft: {
    title: {
      en: 'Identity Theft & Impersonation',
      sw: 'Wizi wa Utambulisho na Kujifanya Mwengine',
      kal: 'Identity Theft ak Impersonation'
    },
    content: {
      en: [
        'Identity theft is punishable under the Computer Misuse and Cybercrimes Act 2018',
        'Impersonating someone to defraud or harm is a felony (up to 5 years imprisonment)',
        'Report to the DCI Cybercrime Unit immediately',
        'File a report with the Huduma Centre for document authentication issues',
        'Contact your bank/financial institutions if financial fraud is involved',
        'The Credit Reference Bureau can help flag fraudulent accounts'
      ],
      sw: [
        'Wizi wa utambulisho unalipa chini ya Sheria ya Matumizi ya Kompyuta na Uhalifu wa Mtandao 2018',
        'Kujifanya mtu mwengine kudanganya au kudhuru ni kosa la jinai (hadi miaka 5 gerezani)',
        'Ripoti kwa Kitengo cha Uhalifu wa Mtandao cha DCI mara moja',
        'Wasiliana na Huduma Centre kwa masuala ya uthibitisho wa nyaraka',
        'Wasiliana na benki yako/institucheni za kifedha ikiwa utapeli wa kifedha unahusika',
        'Credit Reference Bureau inaweza kusaidia kufagia akaunti za ulaghai'
      ],
      kal: [
        'Identity theft punishable Computer Misuse ak Cybercrimes Act 2018',
        'Impersonate someone defraud ak harm felony (years 5 prison)',
        'Report DCI Cybercrime Unit immediately',
        'File report Huduma Centre document authentication issues',
        'Contact bank/financial institutions financial fraud involved',
        'Credit Reference Bureau help flag fraudulent accounts'
      ]
    }
  }
};

// Platform Reporting Guides
export const PLATFORM_REPORTING_GUIDES: PlatformReportingGuide[] = [
  {
    platform: 'Facebook',
    icon: '📘',
    link: 'https://www.facebook.com/help/1816143185351683',
    steps: {
      en: [
        'Go to the post, profile, or message you want to report',
        'Click the three dots (⋯) in the top right corner',
        'Select "Report" or "Report post"',
        'Choose the issue: Harassment, Hate speech, or Unauthorized intimate image',
        'Follow the prompts and submit your report',
        'Facebook will review within 24-48 hours',
        'Check "Support Inbox" for updates on your report'
      ],
      sw: [
        'Nenda kwa chapisho, wasifu, au ujumbe unayotaka kuripoti',
        'Bofya nukta tatu (⋯) pembeni ya juu kulia',
        'Chagua "Ripoti" au "Ripoti chapisho"',
        'Chagua shida: Uharifu, Hate speech, au Picha isiyoidhinishwa',
        'Fuata maelekezo na wasilisha ripoti yako',
        'Facebook itakagua ndani ya saa 24-48',
        'Angalia "Support Inbox" kwa masasisho ya ripoti yako'
      ],
      kal: [
        'Go post, profile, message nebo kainet report',
        'Click three dots (⋯) top right corner',
        'Select "Report" ak "Report post"',
        'Choose issue: Harassment, Hate speech, Unauthorized intimate image',
        'Follow prompts ak submit report',
        'Facebook review hours 24-48',
        'Check "Support Inbox" updates report'
      ]
    }
  },
  {
    platform: 'WhatsApp',
    icon: '💬',
    link: 'https://faq.whatsapp.com/112427995168649',
    steps: {
      en: [
        'Open the chat with the offending contact',
        'Tap the contact name at the top',
        'Scroll down and select "Report Contact"',
        'Check "Block contact" to prevent further messages',
        'For media, tap and hold the image/video, then "Report"',
        'WhatsApp may ban the number if violations are confirmed',
        'Screenshot evidence before blocking for your records'
      ],
      sw: [
        'Fungua chat na mwasiliana mwenye makosa',
        'Gusa jina la mwasiliana juu',
        'Sogeza chini na chagua "Ripoti Mwasiliana"',
        'Chagua "Zuia mwasiliana" ili kuzuia ujumbe zaidi',
        'Kwa media, gusa na shika picha/video, kisha "Ripoti"',
        'WhatsApp inaweza kufukuza namba ikiwa ukiukwaji umethibitishwa',
        'Screenshot ushahidi kabla ya kuzuia kwa kumbukumbu zako'
      ],
      kal: [
        'Open chat ak offending contact',
        'Tap contact name top',
        'Scroll down ak select "Report Contact"',
        'Check "Block contact" prevent further messages',
        'Media, tap ak hold image/video, then "Report"',
        'WhatsApp ban number violations confirmed',
        'Screenshot evidence before blocking records'
      ]
    }
  },
  {
    platform: 'Instagram',
    icon: '📸',
    link: 'https://help.instagram.com/292299730977369',
    steps: {
      en: [
        'Go to the post, Story, or Reel you want to report',
        'Tap the three dots (⋯) above the post',
        'Select "Report"',
        'Choose "It\'s inappropriate"',
        'Select the specific issue: Harassment, Nudity, Hate speech',
        'Submit and Instagram will review',
        'Check "Support requests" in Settings for updates'
      ],
      sw: [
        'Nenda kwa chapisho, Story, au Reel unayotaka kuripoti',
        'Gusa nukta tatu (⋯) juu ya chapisho',
        'Chagua "Ripoti"',
        'Chagua "Sifa mbaya"',
        'Chagua shida mahususi: Uharifu, Uchi, Hate speech',
        'Wasilisha na Instagram itakagua',
        'Angalia "Support requests" katika Mipangilio kwa masasisho'
      ],
      kal: [
        'Go post, Story, Reel nebo kainet report',
        'Tap three dots (⋯) above post',
        'Select "Report"',
        'Choose "It inappropriate"',
        'Select issue: Harassment, Nudity, Hate speech',
        'Submit ak Instagram review',
        'Check "Support requests" Settings updates'
      ]
    }
  },
  {
    platform: 'Twitter/X',
    icon: '𝕏',
    link: 'https://help.twitter.com/en/safety-and-security/report-abusive-behavior',
    steps: {
      en: [
        'Click the three dots (⋯) on the tweet',
        'Select "Report Tweet"',
        'Choose "It\'s abusive or harmful"',
        'Select specific issue: Harassment, Threatening violence, Intimate photos',
        'Add additional tweets if it\'s a pattern',
        'Submit the report',
        'Twitter\'s Trust & Safety team will review'
      ],
      sw: [
        'Bofya nukta tatu (⋯) kwenye tweet',
        'Chagua "Ripoti Tweet"',
        'Chagua "Ni ya kudhuru au ya hatari"',
        'Chagua shida mahususi: Uharifu, Kutishia vurugu, Picha za kimapenzi',
        'Ongeza tweets za ziada ikiwa ni mfano',
        'Wasilisha ripoti',
        'Timu ya Imani na Usalama ya Twitter itakagua'
      ],
      kal: [
        'Click three dots (⋯) tweet',
        'Select "Report Tweet"',
        'Choose "It abusive ak harmful"',
        'Select issue: Harassment, Threatening violence, Intimate photos',
        'Add tweets zaidi ngun pattern',
        'Submit report',
        'Twitter Trust ak Safety team review'
      ]
    }
  },
  {
    platform: 'TikTok',
    icon: '🎵',
    link: 'https://support.tiktok.com/en/safety-hc/report-a-problem',
    steps: {
      en: [
        'Tap the arrow/share button on the video',
        'Select "Report"',
        'Choose a category: Harassment/bullying, Hate speech, Dangerous acts',
        'Select specific issue',
        'Add comments explaining the situation',
        'Submit the report',
        'TikTok will respond within 48 hours'
      ],
      sw: [
        'Gusa kibofya cha mshale/share kwenye video',
        'Chagua "Ripoti"',
        'Chagua kategoria: Uharifu/udhalimu, Hate speech, Vitendo vya hatari',
        'Chagua shida mahususi',
        'Ongeza maoni akielezea hali',
        'Wasilisha ripoti',
        'TikTok itajibu ndani ya saa 48'
      ],
      kal: [
        'Tap arrow/share button video',
        'Select "Report"',
        'Choose category: Harassment/bullying, Hate speech, Dangerous acts',
        'Select specific issue',
        'Add comments explaining situation',
        'Submit report',
        'TikTok respond hours 48'
      ]
    }
  }
];

// Safety & Protection Tips
export const SAFETY_TIPS: SafetyTip[] = [
  {
    category: {
      en: 'Immediate Steps',
      sw: 'Hatua za Papo Hapo',
      kal: 'Immediate Steps'
    },
    icon: '⚡',
    tips: {
      en: [
        'Do NOT delete images or messages - preserve all evidence',
        'Screenshot everything before blocking the person',
        'Document dates, times, and what happened',
        'Stop all communication with the harasser',
        'Tell a trusted friend or family member immediately'
      ],
      sw: [
        'USIFUTE picha au ujumbe - hifadhi ushahidi wote',
        'Screenshot kila kitu kabla ya kuzuia mtu',
        'Hifadhi tarehe, saa, na kilichotokea',
        'Acha mawasiliano yote na mharifu',
        'Mwambia rafiki au mwanafamilia wa kuaminiwa mara moja'
      ],
      kal: [
        'Maam delete images ak messages - preserve evidence tugul',
        'Screenshot tugul before blocking person',
        'Document dates, times, ak chebo cheitab aanai',
        'Stop communication tugul ak harasser',
        'Tell friend ak family member nebo aanai immediately'
      ]
    }
  },
  {
    category: {
      en: 'Digital Security',
      sw: 'Usalama wa Kidigitali',
      kal: 'Digital Security'
    },
    icon: '🔒',
    tips: {
      en: [
        'Change all passwords immediately',
        'Enable two-factor authentication (2FA) on all accounts',
        'Review and update privacy settings on social media',
        'Remove location data from posts and photos',
        'Use a password manager for unique, strong passwords',
        'Consider creating new accounts if harassment persists'
      ],
      sw: [
        'Badilisha passwords zote mara moja',
        'Wezesha uthibitishaji wa mambo mawili (2FA) kwenye akaunti zote',
        'Kagua na sasisha mipangilio ya faragha kwenye mitandao ya kijamii',
        'Ondoa data ya eneo kutoka kwa machapisho na picha',
        'Tumia manager wa password kwa password za kipekee, zenye nguvu',
        'Fikiria kuunda akaunti mpya ikiwa uharifu unaendelea'
      ],
      kal: [
        'Change passwords tugul immediately',
        'Enable two-factor authentication (2FA) accounts tugul',
        'Review ak update privacy settings social media',
        'Remove location data posts ak photos',
        'Use password manager unique, strong passwords',
        'Consider create accounts ngun harassment persists'
      ]
    }
  },
  {
    category: {
      en: 'Phone Security',
      sw: 'Usalama wa Simu',
      kal: 'Phone Security'
    },
    icon: '📱',
    tips: {
      en: [
        'Block the harasser\'s phone number',
        'Enable caller ID and spam filtering',
        'Use apps like Truecaller to identify unknown numbers',
        'Do not answer calls from unknown numbers',
        'Report threatening SMS to your mobile provider',
        'Consider changing your phone number if needed'
      ],
      sw: [
        'Zuia namba ya simu ya mharifu',
        'Wezesha caller ID na kuchuja spam',
        'Tumia programu kama Truecaller kutambua namba zisizojulikana',
        'Usijibu simu kutoka kwa namba zisizojulikana',
        'Ripoti SMS za kutisha kwa mtoaji huduma yako wa simu',
        'Fikiria kubadilisha namba yako ya simu ikiwa inahitajika'
      ],
      kal: [
        'Block harasser phone number',
        'Enable caller ID ak spam filtering',
        'Use apps Truecaller identify numbers maamutaachok',
        'Maam answer calls numbers maamutaachok',
        'Report threatening SMS mobile provider',
        'Consider change phone number ngun needed'
      ]
    }
  },
  {
    category: {
      en: 'Protecting Your Information',
      sw: 'Kulinda Taarifa Zako',
      kal: 'Protecting Information'
    },
    icon: '🛡️',
    tips: {
      en: [
        'Google yourself regularly to see what\'s public',
        'Remove personal information from people-search sites',
        'Be careful what you share in public posts',
        'Limit who can see your friends/followers list',
        'Use different profile photos for different platforms',
        'Consider using a pseudonym for sensitive discussions'
      ],
      sw: [
        'Google jina lako mara kwa mara kuona kinachoonekana',
        'Ondoa taarifa za kibinafsi kutoka kwa tovuti za kutafuta watu',
        'Kuwa mwangalifu unachoshiriki kwenye machapisho ya umma',
        'Punguza anayeona orodha yako ya marafiki/wafuasi',
        'Tumia picha tofauti za wasifu kwa majukwaa tofauti',
        'Fikiria kutumia jina la utani kwa majadiliano nyeti'
      ],
      kal: [
        'Google name regularly see che public',
        'Remove personal information people-search sites',
        'Careful share public posts',
        'Limit who see friends/followers list',
        'Use profile photos different platforms',
        'Consider pseudonym sensitive discussions'
      ]
    }
  },
  {
    category: {
      en: 'Where to Report',
      sw: 'Wapi Kuripoti',
      kal: 'Where Report'
    },
    icon: '📞',
    tips: {
      en: [
        'Police: Dial 999 or visit nearest police station',
        'DCI Cybercrime: Report online at ciu.ncrb.go.ke',
        'Communications Authority: info@ca.go.ke or 0703 042 000',
        'Centre Against Torture (CAT): Free legal aid for victims',
        'Gender-Based Violence Hotline: 1195',
        'Child Helpline (for minors): 116'
      ],
      sw: [
        'Polisi: Piga 999 au tembelea kituo cha polisi cha karibu',
        'DCI Uhalifu wa Mtandao: Ripoti mtandaoni ciu.ncrb.go.ke',
        'Mamlaka ya Mawasiliano: info@ca.go.ke au 0703 042 000',
        'Centre Against Torture (CAT): Msaada wa kisheria bila malipo',
        'Laini ya Msaada wa Ukatili wa Kijinsia: 1195',
        'Mstari wa Msaada wa Watoto (kwa walio chini ya miaka): 116'
      ],
      kal: [
        'Police: Dial 999 ak visit police station nebo karibu',
        'DCI Cybercrime: Report online ciu.ncrb.go.ke',
        'Communications Authority: info@ca.go.ke ak 0703 042 000',
        'Centre Against Torture (CAT): Free legal aid',
        'Gender-Based Violence Hotline: 1195',
        'Child Helpline (minors): 116'
      ]
    }
  }
];

// Emergency Resources
export const EMERGENCY_RESOURCES = {
  en: {
    title: 'Emergency Contacts',
    subtitle: 'If you are in immediate danger, call:',
    contacts: [
      { name: 'Police Emergency', number: '999' },
      { name: 'Gender-Based Violence Hotline', number: '1195' },
      { name: 'Child Helpline', number: '116' },
      { name: 'National Crime Research Centre', number: '020 2716820' }
    ]
  },
  sw: {
    title: 'Mawasiliano ya Dharura',
    subtitle: 'Ikiwa umo katika hatari ya papo hapo, piga:',
    contacts: [
      { name: 'Dharura ya Polisi', number: '999' },
      { name: 'Laini ya Msaada wa Ukatili wa Kijinsia', number: '1195' },
      { name: 'Mstari wa Msaada wa Watoto', number: '116' },
      { name: 'Kituo cha Utafiti wa Uhalifu cha Kitaifa', number: '020 2716820' }
    ]
  },
  kal: {
    title: 'Emergency Contacts',
    subtitle: 'Ngun kiyabet danger, call:',
    contacts: [
      { name: 'Police Emergency', number: '999' },
      { name: 'Gender-Based Violence Hotline', number: '1195' },
      { name: 'Child Helpline', number: '116' },
      { name: 'National Crime Research Centre', number: '020 2716820' }
    ]
  }
};
