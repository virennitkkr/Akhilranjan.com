/* Ask Akhil AI — offline in-browser assistant.
   Runs entirely client-side against a local knowledge base; no external API calls. */
(function () {
  'use strict';

  var LANG_EN = 'en';
  var LANG_HI = 'hi';

  var STORAGE_KEY = 'askAkhil:conversation:v1';
  var STORAGE_PREF_KEY = 'askAkhil:prefs:persistence:v1';
  var MAX_MEMORY = 10;

  var DEFAULTS = {
    WELCOME: {
      en: 'Hello 👋\n\nI\'m Ask Akhil AI.\nI can answer questions about investigations, OSINT, verification, articles, speaking and collaborations. Try asking something.',
      hi: 'नमस्ते 👋\n\nमैं Ask Akhil AI हूं।\nमैं जांच, OSINT, सत्यापन, लेख, भाषण और सहयोग के बारे में प्रश्नों का उत्तर दे सकता हूं। पूछें।'
    },
    SUGGESTED: [
      'Who is Akhil Ranjan?',
      'Tell me about your investigations',
      'What is OSINT?',
      'How do you verify misinformation?',
      'Tell me about your book'
    ],
    PLACEHOLDER: {
      en: 'Ask Akhil about investigations, verification, or collaborations...',
      hi: 'जांच, सत्यापन, या सहयोग के बारे में पूछें...'
    }
  };

  var TABS = [
    { key: 'start', icon: '🚀', label: 'Getting Started' },
    { key: 'osint', icon: '🕵️', label: 'OSINT', category: 'OSINT' },
    { key: 'investigations', icon: '📰', label: 'Investigations', category: 'Investigations' },
    { key: 'book', icon: '📘', label: 'Book', category: 'Book' },
    { key: 'contact', icon: '✉️', label: 'Contact', category: 'Contact' }
  ];

const ASKAKHIL_KB = [
  {
    id: 'bio-1',
    category: 'Biography',
    title: 'Who is Akhil Ranjan?',
    keywords: ['akhil','akhil ranjan','journalist','bio'],
    priority: 10,
    answer_en: 'Akhil Ranjan is an investigative journalist focused on misinformation, OSINT and digital verification. He works internationally and publishes investigations, analysis and training on media verification.',
    answer_hi: 'अखिल रंजन एक अन्वेषणात्मक पत्रकार हैं जो गलत सूचना, OSINT और डिजिटल सत्यापन पर काम करते हैं।',
    relatedLinks: ['/about','/investigations'],
    relatedQuestions: ['Where is Akhil based?','What does Akhil investigate?']
  },
  {
    id: 'bio-2',
    category: 'Biography',
    title: 'Where is he based?',
    keywords: ['location','based','uk','london'],
    priority: 8,
    answer_en: 'Akhil is London-based and works globally with newsrooms, NGOs and research partners across South Asia and beyond.',
    answer_hi: 'अखिल लंदन स्थित हैं और दक्षिण एशिया व अंतरराष्ट्रीय न्यूज़रूम और संस्थाओं के साथ काम करते हैं।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['How to contact Akhil?']
  },
  {
    id: 'languages-1',
    category: 'Career',
    title: 'Which languages does he speak?',
    keywords: ['languages','bilingual','hindi','english'],
    priority: 7,
    answer_en: 'Akhil works in English and Hindi and can report and verify content in both languages.',
    answer_hi: 'अखिल अंग्रेजी और हिंदी में कार्य करते हैं।',
    relatedLinks: ['/about'] ,
    relatedQuestions: ['Can Akhil work in Hindi?']
  },
  {
    id: 'osint-1',
    category: 'OSINT',
    title: 'What is OSINT?',
    keywords: ['osint','open source intelligence','definition'],
    priority: 9,
    answer_en: 'OSINT stands for open-source intelligence: methods to collect and verify information using publicly available digital sources such as social media, satellite imagery, registries and archives.',
    answer_hi: 'OSINT का अर्थ है सार्वजनिक स्रोतों से जानकारी एकत्र करना और सत्यापित करना।',
    relatedLinks: ['/resources/osint'],
    relatedQuestions: ['How is OSINT used in investigations?']
  },
  {
    id: 'verification-1',
    category: 'Fact Checking',
    title: 'What is digital verification?',
    keywords: ['verification','digital verification','fact-checking'],
    priority: 9,
    answer_en: 'Digital verification includes techniques such as metadata analysis, reverse image search, geolocation, timestamp verification and source corroboration to establish authenticity.',
    answer_hi: 'डिजिटल सत्यापन में मेटाडेटा विश्लेषण, इमेज रिवर्स सर्च, जिओलोकेशन आदि शामिल हैं।',
    relatedLinks: ['/methods'],
    relatedQuestions: ['How to verify an image?']
  },
  {
    id: 'meta-1',
    category: 'OSINT',
    title: 'What is metadata analysis?',
    keywords: ['metadata','exif','analysis'],
    priority: 8,
    answer_en: 'Metadata analysis looks at embedded data in files (EXIF for images, headers for videos) and publishes patterns to help verify origin and timeline.',
    answer_hi: 'मेटाडेटा विश्लेषण फाइलों में छिपी जानकारी को देखने का तरीका है।',
    relatedLinks: [],
    relatedQuestions: ['What does EXIF tell us?']
  },
  {
    id: 'geo-1',
    category: 'OSINT',
    title: 'What is geolocation?',
    keywords: ['geolocation','geolocate','where'],
    priority: 8,
    answer_en: 'Geolocation is mapping visual clues from photos or video (landmarks, street signs, shadows) to physical coordinates to place an event in space.',
    answer_hi: 'जिओलोकेशन का अर्थ है फोटो/वीडियो के आधार पर स्थान निर्धारित करना।',
    relatedLinks: [],
    relatedQuestions: ['How to geolocate a photo?']
  },
  {
    id: 'misinfo-1',
    category: 'Fact Checking',
    title: 'How does misinformation spread?',
    keywords: ['misinformation','spread','virality'],
    priority: 8,
    answer_en: 'Misinformation spreads via social networks, forwarded messages, manipulated media and through amplification by actors (bots, influencers) and algorithmic recommendation.',
    answer_hi: 'गलत सूचना सोशल नेटवर्क और मानवीय/स्वचालित amplification से फैलती है।',
    relatedLinks: ['/research/misinfo'],
    relatedQuestions: ['How to stop misinformation?']
  },
  {
    id: 'fact-1',
    category: 'Fact Checking',
    title: 'How does fact-checking work?',
    keywords: ['fact-check','process','verification'],
    priority: 9,
    answer_en: 'Fact-checking uses source tracing, evidence collection, corroboration from independent sources, technical analysis and transparent explanation to reach a verdict.',
    answer_hi: 'फैक्ट-चेक स्रोतों का मिलान और स्वतंत्र पुष्टि करता है।',
    relatedLinks: [],
    relatedQuestions: ['What are the steps of fact-checking?']
  },
  {
    id: 'manip-1',
    category: 'OSINT',
    title: 'What is digital manipulation?',
    keywords: ['deepfake','manipulation','synthetic media'],
    priority: 8,
    answer_en: 'Digital manipulation includes any alteration, deepfake or synthetic content intended to deceive — recognizable via artifact analysis and provenance checks.',
    answer_hi: 'डिजिटल मैनिपुलेशन में छेड़छाड़ और सिंथेटिक मीडिया शामिल हैं।',
    relatedLinks: [],
    relatedQuestions: ['How to detect a deepfake?']
  },
  {
    id: 'invest-1',
    category: 'Investigations',
    title: 'How do investigations begin?',
    keywords: ['investigation','start','leads'],
    priority: 9,
    answer_en: 'Investigations often begin from a tip, anomalous data, a public record or suspicious pattern; they are then triaged and evidence chains are built using OSINT.',
    answer_hi: 'जाँच संकेत, डेटा विसंगति या रिकॉर्ड से शुरू होती है।',
    relatedLinks: ['/investigations'],
    relatedQuestions: ['How long do investigations take?']
  },
  {
    id: 'orgs-1',
    category: 'Career',
    title: 'Which media organisations has he worked with?',
    keywords: ['bbc','reuters','guardian','afp','icfj','partners'],
    priority: 8,
    answer_en: 'Akhil has collaborated with major newsrooms including BBC, Reuters, AFP, The Guardian and organisations such as ICFJ and journalism networks.',
    answer_hi: 'अखिल ने BBC, Reuters, AFP और Guardian जैसी संस्थाओं के साथ काम किया है।',
    relatedLinks: ['/trusted'],
    relatedQuestions: ['Has Akhil worked with Reuters?']
  },
  {
    id: 'awards-1',
    category: 'Awards',
    title: 'What awards has he received?',
    keywords: ['awards','honours','prizes'],
    priority: 6,
    answer_en: 'Akhil has received recognition for investigative reporting and journalism training; check the Awards section for details on named honours.',
    answer_hi: 'अखिल को अन्वेषणात्मक रिपोर्टिंग के लिए पहचान मिली है।',
    relatedLinks: ['/awards'],
    relatedQuestions: ['Which prize did Akhil win?']
  },
  {
    id: 'book-1',
    category: 'Book',
    title: 'Tell me about the book Fake News, Media & Democracy',
    keywords: ['book','fake news','media democracy'],
    priority: 10,
    answer_en: 'The book "Fake News, Media & Democracy" explores misinformation, media ecosystems and methods for public verification. It is written in English and Hindi sections.',
    answer_hi: '"फेक न्यूज़, मीडिया और लोकतंत्र" पुस्तक गलत सूचनाओं और सत्यापन के तरीके समझाती है।',
    relatedLinks: ['/book'],
    relatedQuestions: ['Where can I buy the book?']
  },
  {
    id: 'articles-1',
    category: 'Articles',
    title: 'Show your latest articles',
    keywords: ['latest','articles','writing'],
    priority: 9,
    answer_en: 'Akhil publishes feature investigations, explainers and verification threads; visit the Writing or Investigations sections to browse the latest pieces.',
    answer_hi: 'नवीनतम लेख Writing अनुभाग में देखें।',
    relatedLinks: ['/writing'],
    relatedQuestions: ['What are Akhil’s recent investigations?']
  },
  {
    id: 'speaking-1',
    category: 'Speaking',
    title: 'What speaking topics does he cover?',
    keywords: ['speaking','topics','talks','conferences'],
    priority: 8,
    answer_en: 'Key topics: misinformation, OSINT methods, digital verification, media literacy and newsroom workflows. He is available for panels and workshops.',
    answer_hi: 'विषय: गलत सूचना, OSINT, डिजिटल सत्यापन।',
    relatedLinks: ['/speaking'],
    relatedQuestions: ['Can Akhil speak at conferences?']
  },
  {
    id: 'contact-1',
    category: 'Contact',
    title: 'How can editors contact you?',
    keywords: ['contact','editors','email','inquiry'],
    priority: 10,
    answer_en: 'Editors can contact Akhil via the Contact page or the press email listed on this site. Use the contact form or the direct press address for commissioning.',
    answer_hi: 'संपर्क पृष्ठ के माध्यम से संपादक संपर्क कर सकते हैं।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['What is the press email?']
  },
  {
    id: 'book-2',
    category: 'Book',
    title: 'What is the book about (short)?',
    keywords: ['book summary','book short'],
    priority: 7,
    answer_en: 'A concise guide to understanding and countering misinformation, with practical verification techniques and case studies from media reporting.',
    answer_hi: 'गलत सूचनाओं का सामना करने के लिए व्यावहारिक गाइड और केस स्टडी।',
    relatedLinks: ['/book'],
    relatedQuestions: ['Is the book bilingual?']
  },
  {
    id: 'services-1',
    category: 'Collaboration',
    title: 'What services does he offer?',
    keywords: ['services','freelance','consulting','workshops'],
    priority: 9,
    answer_en: 'Services include freelance investigations, OSINT training, fact-checking workshops, media consulting and speaking engagements.',
    answer_hi: 'सेवाओं में अन्वेषण, प्रशिक्षण और परामर्श शामिल हैं।',
    relatedLinks: ['/services'],
    relatedQuestions: ['Can Akhil provide training?']
  },
  {
    id: 'research-1',
    category: 'Research',
    title: 'How can researchers collaborate?',
    keywords: ['research','collaborate','partnerships'],
    priority: 7,
    answer_en: 'Researchers can propose joint studies, data-sharing agreements, and methodological partnerships via the Contact form or by email.',
    answer_hi: 'शोधकर्ता संपर्क फ़ॉर्म के माध्यम से सहयोग प्रस्तुत कर सकते हैं।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['Do you accept research partnerships?']
  },
  {
    id: 'training-1',
    category: 'Services',
    title: 'Do you provide OSINT training?',
    keywords: ['training','osint workshop','workshop'],
    priority: 8,
    answer_en: 'Yes — Akhil provides bespoke OSINT and verification workshops for newsrooms, universities and NGOs.',
    answer_hi: 'हाँ — अखिल OSINT कार्यशालाएँ प्रदान करते हैं।',
    relatedLinks: ['/services#training'],
    relatedQuestions: ['How long are workshops?']
  },
  {
    id: 'invest-2',
    category: 'Investigations',
    title: 'How long do investigations take?',
    keywords: ['duration','timeline','investigation length'],
    priority: 6,
    answer_en: 'Investigation timelines vary widely — small verifications take hours, major probes can take weeks or months depending on access and complexity.',
    answer_hi: 'समय-सीमा केस पर निर्भर करती है; कुछ घंटे से लेकर कई महीने।',
    relatedLinks: ['/investigations'],
    relatedQuestions: ['What affects investigation time?']
  },
  {
    id: 'payments-1',
    category: 'Collaboration',
    title: 'How are freelance commissions handled?',
    keywords: ['freelance','commissions','rates','payment'],
    priority: 5,
    answer_en: 'Freelance commissions are handled by agreement; contact via email with scope and timeline for a bespoke quote.',
    answer_hi: 'फ्रीलांस कमीशन समझौते पर होते हैं; संपर्क करें।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['Do you provide quotes?']
  },
  {
    id: 'privacy-1',
    category: 'Security',
    title: 'Does the site track user queries?',
    keywords: ['privacy','tracking','data'],
    priority: 10,
    answer_en: 'No. The Ask Akhil assistant runs entirely in-browser. No data is sent to external servers or stored outside the user’s session unless they export it.',
    answer_hi: 'नहीं। सहायक केवल ब्राउज़र में चलता है, डेटा बाहर नहीं जाता।',
    relatedLinks: ['/privacy'],
    relatedQuestions: ['Where is data stored?']
  },
  {
    id: 'method-1',
    category: 'OSINT',
    title: 'How to verify an image?',
    keywords: ['verify image','reverse image search','exif'],
    priority: 9,
    answer_en: 'Start with reverse image search, check EXIF metadata, inspect visual cues for landmarks, and corroborate with independent sources and timestamps.',
    answer_hi: 'रिवर्स इमेज, EXIF और दृश्य संकेतों से सत्यापित करें।',
    relatedLinks: [],
    relatedQuestions: ['What tools help reverse image search?']
  },
  {
    id: 'meta-2',
    category: 'OSINT',
    title: 'What does EXIF tell us?',
    keywords: ['exif','metadata','image info'],
    priority: 7,
    answer_en: 'EXIF can reveal camera model, timestamp, GPS coordinates (if present) and editing history; it is sometimes stripped by platforms.',
    answer_hi: 'EXIF कैमरा, समय और GPS जैसी जानकारी दे सकता है।',
    relatedLinks: [],
    relatedQuestions: ['Can EXIF be trusted?']
  },
  {
    id: 'geotech-1',
    category: 'OSINT',
    title: 'How to geolocate a photo?',
    keywords: ['geolocate photo','landmarks','shadows'],
    priority: 8,
    answer_en: 'Match visible landmarks, signage, natural features and use shadow analysis and map overlays to constrain possible locations.',
    answer_hi: 'दृश्य लैंडमार्क और छाया विश्लेषण का उपयोग करें।',
    relatedLinks: [],
    relatedQuestions: ['What is shadow analysis?']
  },
  {
    id: 'deepfake-1',
    category: 'OSINT',
    title: 'How to detect a deepfake?',
    keywords: ['deepfake','detect','synthetic'],
    priority: 8,
    answer_en: 'Look for inconsistent blinking, facial artifacts, mismatched audio, and validate source video provenance and compression signatures.',
    answer_hi: 'आँखों की बंद-खुलने और अनुचित ध्वनि से पहचान।',
    relatedLinks: [],
    relatedQuestions: ['Are deepfakes always detectable?']
  },
  {
    id: 'press-1',
    category: 'Contact',
    title: 'How can organisations book Akhil for speaking?',
    keywords: ['booking','speaking','invite','conference'],
    priority: 9,
    answer_en: 'Use the Contact page with event brief, dates and budget details. Akhil reviews invitations for panels, keynotes and workshops.',
    answer_hi: 'Contact पेज पर इवेंट विवरण भेजें।',
    relatedLinks: ['/speaking','/contact'],
    relatedQuestions: ['What is your fee?']
  },
  {
    id: 'teaching-1',
    category: 'Services',
    title: 'Can students interview Akhil?',
    keywords: ['students','interview','academia'],
    priority: 6,
    answer_en: 'Students are welcome to request interviews for research or classes; provide context and questions in the contact form.',
    answer_hi: 'छात्र संपर्क फ़ॉर्म के माध्यम से अनुरोध कर सकते हैं।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['Is there a fee for student interviews?']
  },
  {
    id: 'media-1',
    category: 'Media',
    title: 'What media appearances has he made?',
    keywords: ['media','appearances','podcast','tv'],
    priority: 6,
    answer_en: 'Akhil appears on panels, podcasts and news shows; see the Media section for a list of recent appearances.',
    answer_hi: 'मीडिया सेक्शन में हाल की प्रस्तुतियाँ देखें।',
    relatedLinks: ['/media'],
    relatedQuestions: ['Has Akhil been on the BBC?']
  },
  {
    id: 'case-1',
    category: 'Investigations',
    title: 'Example investigation: misinformation network',
    keywords: ['case study','network','misinformation'],
    priority: 9,
    answer_en: 'This investigation mapped a coordinated misinformation network using account clustering, content tracing and source analysis; read the full report on the Investigations page.',
    answer_hi: 'यह जांच समन्वित गलत सूचना नेटवर्क का मानचित्रण करती है।',
    relatedLinks: ['/investigations/network'],
    relatedQuestions: ['How was the network identified?']
  },
  {
    id: 'ethics-1',
    category: 'Research',
    title: 'Ethics in OSINT investigations',
    keywords: ['ethics','privacy','osint ethics'],
    priority: 8,
    answer_en: 'OSINT practitioners weigh public interest, privacy harms and legal risk; Akhil follows newsroom ethical guidelines and documents sources responsibly.',
    answer_hi: 'OSINT में गोपनीयता और सार्वजनिक हित पर विचार करना आवश्यक है।',
    relatedLinks: [],
    relatedQuestions: ['How do you protect sources?']
  },
  {
    id: 'collab-1',
    category: 'Collaboration',
    title: 'How can NGOs partner with Akhil?',
    keywords: ['ngo','partnership','ngo collaboration'],
    priority: 7,
    answer_en: 'NGOs can propose joint research and verification projects via the Contact page; Akhil evaluates scope, data access and ethics before accepting.',
    answer_hi: 'NGO संपर्क के माध्यम से प्रस्ताव भेज सकते हैं।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['What partnerships do you accept?']
  },
  {
    id: 'tools-1',
    category: 'OSINT',
    title: 'Tools commonly used in investigations',
    keywords: ['tools','software','osint tools'],
    priority: 7,
    answer_en: 'Common tools include reverse-image search engines, archive.org, map overlays, metadata extractors and social media scraping utilities; choice depends on case.',
    answer_hi: 'रिवर्स इमेज, आर्काइव और मैप ओवरले सामान्य उपकरण हैं।',
    relatedLinks: [],
    relatedQuestions: ['Which free tools are recommended?']
  },
  {
    id: 'method-2',
    category: 'OSINT',
    title: 'What is timestamp verification?',
    keywords: ['timestamp','verify time','when'],
    priority: 6,
    answer_en: 'Timestamp verification compares metadata, platform timestamps and contextual clues to confirm when a piece of media was first published.',
    answer_hi: 'टाइमस्टैम्प की पुष्टि मेटाडेटा और प्रकाशित समय से होती है।',
    relatedLinks: [],
    relatedQuestions: ['What if timestamps are modified?']
  },
  {
    id: 'faq-1',
    category: 'Contact',
    title: 'Can universities invite him to lecture?',
    keywords: ['university','lecture','invite','academic'],
    priority: 6,
    answer_en: 'Yes. Universities can request lectures, seminars and workshops; provide dates and topic scope when contacting.',
    answer_hi: 'हाँ। विश्वविद्यालय संपर्क कर सकते हैं।',
    relatedLinks: ['/speaking','/contact'],
    relatedQuestions: ['Do you offer academic rates?']
  },
  {
    id: 'papers-1',
    category: 'Articles',
    title: 'How do you pick article topics?',
    keywords: ['topic selection','editorial','ideas'],
    priority: 5,
    answer_en: 'Topics are chosen based on impact, evidence, novelty and editorial relevance; often originating from data anomalies or community tips.',
    answer_hi: 'विषय प्रभाव और साक्ष्य के आधार पर चुने जाते हैं।',
    relatedLinks: ['/writing'],
    relatedQuestions: ['Can I pitch a story?']
  },
  {
    id: 'pitch-1',
    category: 'Collaboration',
    title: 'Can I pitch a story to Akhil?',
    keywords: ['pitch','story','tip'],
    priority: 6,
    answer_en: 'Yes — use the Contact form with a clear tip, supporting material and your contact details. Confidential tips are accepted where necessary.',
    answer_hi: 'हाँ — स्पष्ट टिप और संपर्क विवरण भेजें।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['Are tips anonymous?']
  },
  {
    id: 'privacy-2',
    category: 'Security',
    title: 'Is chat data stored?',
    keywords: ['chat','store','local'],
    priority: 10,
    answer_en: 'Chat conversation remains in-browser session memory. Users can export or clear the conversation; nothing is sent externally.',
    answer_hi: 'बातचीत ब्राउज़र में रहती है; बाहर भेजी नहीं जाती।',
    relatedLinks: [],
    relatedQuestions: ['How to export conversation?']
  },
  {
    id: 'verification-2',
    category: 'Fact Checking',
    title: 'How to corroborate a claim?',
    keywords: ['corroborate','sources','evidence'],
    priority: 8,
    answer_en: 'Corroborate by finding independent sources, checking original documents, timestamps and by comparing multiple media types for consistency.',
    answer_hi: 'स्वतंत्र स्रोतों से पुष्टि करें।',
    relatedLinks: [],
    relatedQuestions: ['What is independent corroboration?']
  },
  {
    id: 'news-1',
    category: 'Media',
    title: 'How to invite Akhil to an event?',
    keywords: ['invite','event','conference','panel'],
    priority: 7,
    answer_en: 'Provide event details (date, format, audience, travel) on the Contact page; invitations are reviewed based on availability and relevance.',
    answer_hi: 'इवेंट विवरण भेजें; उपलब्धता के अनुसार निर्णय लिया जाएगा।',
    relatedLinks: ['/contact','/speaking'],
    relatedQuestions: ['Does Akhil travel for events?']
  },
  {
    id: 'data-1',
    category: 'Research',
    title: 'Can you share raw data from investigations?',
    keywords: ['data','sharing','raw data'],
    priority: 5,
    answer_en: 'Data sharing is considered case-by-case, balancing transparency with legal and privacy constraints; request via contact.',
    answer_hi: 'डेटा साझा करने निर्णय केस-दर-केस होता है।',
    relatedLinks: [],
    relatedQuestions: ['Do you publish datasets?']
  },
  {
    id: 'method-3',
    category: 'OSINT',
    title: 'What is reverse image search?',
    keywords: ['reverse image','imagesearch','tineye','google'],
    priority: 7,
    answer_en: 'Reverse image search locates visually similar images across the web to find original sources, alternate contexts and repost history.',
    answer_hi: 'रिवर्स इमेज सर्च मूल स्रोत और प्रसार इतिहास खोजता है।',
    relatedLinks: [],
    relatedQuestions: ['Which engines are best for reverse image search?']
  },
  {
    id: 'techtips-1',
    category: 'OSINT',
    title: 'What is shadow analysis?',
    keywords: ['shadow','sun angle','time estimation'],
    priority: 6,
    answer_en: 'Shadow analysis uses sun angle and shadow length to estimate time of day and season, helping verify when a photo was taken.',
    answer_hi: 'छाया विश्लेषण फोटो का समय अनुमान लगाने में मदद करता है।',
    relatedLinks: [],
    relatedQuestions: ['Can shadow analysis give exact time?']
  },
  {
    id: 'publication-1',
    category: 'Career',
    title: 'Where are investigations published?',
    keywords: ['publish','platforms','newsrooms'],
    priority: 8,
    answer_en: 'Investigations are published in collaboration with partner newsrooms and on Akhil’s site, depending on editorial agreements.',
    answer_hi: 'जांच साझेदार न्यूज़रूम और साइट पर प्रकाशित होती है।',
    relatedLinks: ['/investigations'],
    relatedQuestions: ['Do you publish datasets with articles?']
  },
  {
    id: 'faq-2',
    category: 'Collaboration',
    title: 'Do you work with international teams?',
    keywords: ['international','teams','collaboration'],
    priority: 7,
    answer_en: 'Yes — Akhil often works with international newsroom partners and academic collaborators on cross-border investigations.',
    answer_hi: 'हाँ — अखिल अंतरराष्ट्रीय सहयोग करते हैं।',
    relatedLinks: [],
    relatedQuestions: ['How do you coordinate cross-border investigations?']
  },
  {
    id: 'readmore-1',
    category: 'Articles',
    title: 'How do you verify social media posts?',
    keywords: ['verify social','social media','posts'],
    priority: 8,
    answer_en: 'Verify author accounts, check timestamps, reverse search images, corroborate with independent sources and assess network amplification.',
    answer_hi: 'लेखक खातों की जाँच और इमेज रिवर्स सर्च द्वारा सत्यापन करें।',
    relatedLinks: [],
    relatedQuestions: ['What signals indicate authenticity?']
  },
  {
    id: 'archive-1',
    category: 'OSINT',
    title: 'How to use archive.org in verification',
    keywords: ['archive','wayback','archive.org'],
    priority: 6,
    answer_en: 'Archive.org and Wayback Machine help recover old versions of pages, deleted posts and evidence of prior publication.',
    answer_hi: 'Archive.org पुराने पृष्ठों और हटाए गए पोस्ट की जानकारी देता है।',
    relatedLinks: [],
    relatedQuestions: ['Can archive data be trusted?']
  },
  {
    id: 'ethics-2',
    category: 'Research',
    title: 'How are sensitive investigations handled?',
    keywords: ['sensitive','ethics','legal'],
    priority: 8,
    answer_en: 'Sensitive cases follow strict editorial and legal review, redaction of private data and risk assessment before publication.',
    answer_hi: 'संवेदनशील मामलों में कानूनी और संपादकीय समीक्षा की जाती है।',
    relatedLinks: [],
    relatedQuestions: ['Do you redact sources?']
  },
  {
    id: 'help-1',
    category: 'Contact',
    title: 'How can journalists reach you?',
    keywords: ['journalists','contact','media inquiries'],
    priority: 9,
    answer_en: 'Journalists should use the Contact page or listed press email with enquiry details and deadlines.',
    answer_hi: 'पत्रकार संपर्क फ़ॉर्म या प्रेस ईमेल का उपयोग करें।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['Do you accept embargoed tips?']
  },
  {
    id: 'open-1',
    category: 'Technical',
    title: 'How does Ask Akhil AI work offline?',
    keywords: ['offline','local','no api','no server'],
    priority: 10,
    answer_en: 'The assistant runs entirely in-browser using a structured local knowledge base and a deterministic search algorithm — no external API calls are made.',
    answer_hi: 'सहायक ब्राउज़र में स्थानीय ज्ञान और खोज के साथ चलता है।',
    relatedLinks: [],
    relatedQuestions: ['Is data sent to servers?']
  },
  {
    id: 'export-1',
    category: 'UX',
    title: 'How to export conversation?',
    keywords: ['export','save','download','transcript'],
    priority: 6,
    answer_en: 'Use the export function in the chat UI (copy or download) to save a transcript locally; nothing is uploaded.',
    answer_hi: 'चैट UI से ट्रांसक्रिप्ट डाउनलोड करें।',
    relatedLinks: [],
    relatedQuestions: ['What formats are supported?']
  },
  {
    id: 'faq-3',
    category: 'Services',
    title: 'What is media consulting?',
    keywords: ['consulting','media consulting','advice'],
    priority: 6,
    answer_en: 'Media consulting covers verification workflows, misinformation risk assessment, editorial strategy and crisis communication guidance.',
    answer_hi: 'मीडिया कंसल्टिंग में सत्यापन और संकट संचार शामिल हैं।',
    relatedLinks: [],
    relatedQuestions: ['Do you consult for NGOs?']
  },
  {
    id: 'subscribe-1',
    category: 'Newsletter',
    title: 'How do I subscribe to the newsletter?',
    keywords: ['subscribe','newsletter','email'],
    priority: 9,
    answer_en: 'Subscribe via the newsletter form on the site; enter your email and preferences to receive updates on investigations.',
    answer_hi: 'न्यूज़लेटर फ़ॉर्म के माध्यम से सदस्यता लें।',
    relatedLinks: ['/newsletter'],
    relatedQuestions: ['How often is the newsletter sent?']
  },
  {
    id: 'about-1',
    category: 'Biography',
    title: 'Why investigative journalism matters',
    keywords: ['investigative','importance','journalism'],
    priority: 5,
    answer_en: 'Investigative journalism holds power to account, uncovers systemic issues and provides public-interest reporting with evidence-based findings.',
    answer_hi: 'अन्वेषणात्मक पत्रकारिता सार्वजनिक हित की रिपोर्टिंग करती है।',
    relatedLinks: [],
    relatedQuestions: ['What impact can investigations have?']
  },
  {
    id: 'contact-2',
    category: 'Contact',
    title: 'Can NGOs commission bespoke research?',
    keywords: ['commission','ngo research','bespoke'],
    priority: 6,
    answer_en: 'Yes — bespoke research is available; outline scope and deliverables when contacting for a quote.',
    answer_hi: 'हाँ — विशिष्ट अनुसंधान के लिए संपर्क करें।',
    relatedLinks: ['/contact'],
    relatedQuestions: ['What is a typical deliverable?']
  },
  {
    id: 'legacy-1',
    category: 'Career',
    title: 'How to cite Akhil’s work',
    keywords: ['cite','reference','citation'],
    priority: 5,
    answer_en: 'Cite investigations by title, publication and date; use the standard citation style required by the publisher or academic context.',
    answer_hi: 'लेख का शीर्षक, प्रकाशन और तिथि उद्धृत करें।',
    relatedLinks: [],
    relatedQuestions: ['Can I reproduce your figures?']
  },
  {
    id: 'support-1',
    category: 'Collaboration',
    title: 'How to support this work',
    keywords: ['support','donate','sustain'],
    priority: 4,
    answer_en: 'Support may be offered by subscribing, commissioning work or partnering on grants; check the site’s support and collaboration options.',
    answer_hi: 'समर्थन सदस्यता और साझेदारी के माध्यम से किया जा सकता है।',
    relatedLinks: ['/support'],
    relatedQuestions: ['Are donations accepted?']
  }
];

  // ---------- utils ----------
  var STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'for', 'to', 'is', 'are', 'how', 'what', 'where', 'when']);

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[\p{P}$+<=>^`|~]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(text) {
    return normalize(text).split(' ').filter(function (t) { return t && !STOP_WORDS.has(t); });
  }

  function formatTimestamp(ts) {
    return new Date(ts).toLocaleTimeString();
  }

  function translate(entryText, lang, fallback) {
    if (lang === LANG_EN) return entryText;
    return fallback || entryText;
  }

  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    var dp = [];
    var i, j;
    for (i = 0; i <= m; i++) { dp.push(new Array(n + 1).fill(0)); dp[i][0] = i; }
    for (j = 0; j <= n; j++) dp[0][j] = j;
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- search engine (mirrors src/chat/chatEngine.ts) ----------
  function scoreForEntry(queryTokens, entry) {
    var titleTokens = tokenize(entry.title);
    var kw = entry.keywords.map(function (k) { return normalize(k); });
    var score = 0;
    var q = queryTokens.join(' ');

    if (normalize(entry.title).includes(q)) score += 0.35;

    queryTokens.forEach(function (t) {
      if (titleTokens.includes(t)) score += 0.12;
      kw.forEach(function (k) {
        if (k.includes(t) || t.includes(k)) score += 0.08;
      });
    });

    score += Math.min(0.25, entry.priority * 0.02);
    return Math.min(1, score);
  }

  function searchKnowledge(query, language) {
    var norm = normalize(query);
    var tokens = tokenize(query);

    var candidates = ASKAKHIL_KB.map(function (entry) {
      return { entry: entry, score: scoreForEntry(tokens, entry) };
    }).sort(function (a, b) { return b.score - a.score; });

    var best = candidates[0];
    var confidence = best ? best.score : 0;

    if (confidence < 0.6) {
      candidates.slice(0, 10).forEach(function (c) {
        var dist = levenshtein(normalize(c.entry.title), norm);
        var len = Math.max(1, Math.max(c.entry.title.length, norm.length));
        var closeness = 1 - dist / len;
        if (closeness > c.score) c.score = Math.min(1, c.score + closeness * 0.6);
      });
    }

    candidates.sort(function (a, b) { return b.score - a.score; });
    var top = candidates[0];
    var suggestions = candidates.slice(0, 6).map(function (s) { return s.entry.title; });

    if (!top || top.score < 0.4) {
      return { answer: '', confidence: 0, suggestions: suggestions };
    }

    var answer = translate(top.entry.answer_en, language, top.entry.answer_hi);
    return { entry: top.entry, answer: answer, confidence: Math.min(0.99, top.score), suggestions: suggestions };
  }

  function suggestionsForCategory(category, limit) {
    return ASKAKHIL_KB
      .filter(function (e) { return e.category === category; })
      .sort(function (a, b) { return b.priority - a.priority; })
      .slice(0, limit || 4)
      .map(function (e) { return e.title; });
  }

  // ---------- state ----------
  var state = {
    open: false,
    language: LANG_EN,
    messages: [],
    persistEnabled: false,
    isThinking: false,
    activeTab: TABS[0].key
  };

  var root, launcher, launcherLabel, panel, persistBtn, messagesEl, tabsEl, suggestionsGridEl, toastEl, inputEl, toastTimer;

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function botAvatarSvg(size) {
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M12 2v2.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"></path>' +
        '<circle cx="12" cy="3.2" r="1.1" fill="#fff"></circle>' +
        '<rect x="5" y="6.5" width="14" height="11" rx="5.5" fill="rgba(255,255,255,0.18)" stroke="#fff" stroke-width="1.3"></rect>' +
        '<circle cx="9.3" cy="12" r="1.35" fill="#fff"></circle>' +
        '<circle cx="14.7" cy="12" r="1.35" fill="#fff"></circle>' +
        '<path d="M9 15.2c1 1.1 5 1.1 6 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none"></path>' +
      '</svg>'
    );
  }

  function persistConversation() {
    try {
      if (state.persistEnabled) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: state.messages, language: state.language }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) { /* storage unavailable or quota exceeded */ }
  }

  function loadPersistedState() {
    try {
      var pref = localStorage.getItem(STORAGE_PREF_KEY) === 'true';
      state.persistEnabled = pref;
      if (pref) {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            state.messages = parsed.messages;
            if (parsed.language) state.language = parsed.language;
            return true;
          }
        }
      }
    } catch (e) { /* ignore parse errors */ }
    return false;
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3000);
  }

  function renderMessages() {
    var last10 = state.messages.slice(-10);
    messagesEl.innerHTML = last10.map(function (m) {
      var avatar = m.type === 'bot' ? '<div class="askakhil__message-avatar">' + botAvatarSvg(16) + '</div>' : '';
      return (
        '<div class="askakhil__message askakhil__message--' + m.type + '">' +
          avatar +
          '<div class="askakhil__message-body">' +
            '<div class="askakhil__message-text">' + escapeHtml(m.text) + '</div>' +
            '<div class="askakhil__message-meta">' + formatTimestamp(m.ts) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    if (state.isThinking) {
      messagesEl.insertAdjacentHTML('beforeend',
        '<div class="askakhil__message askakhil__message--bot">' +
          '<div class="askakhil__message-avatar">' + botAvatarSvg(16) + '</div>' +
          '<div class="askakhil__typing"><span class="dot"></span> <span class="dot"></span> <span class="dot"></span></div>' +
        '</div>'
      );
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderSuggestionGrid() {
    var tab = TABS.filter(function (t) { return t.key === state.activeTab; })[0] || TABS[0];
    var items = tab.category ? suggestionsForCategory(tab.category, 4) : DEFAULTS.SUGGESTED;
    if (!items || items.length === 0) items = DEFAULTS.SUGGESTED;
    suggestionsGridEl.innerHTML = items.map(function (s) {
      return '<button class="askakhil__suggestion-card" type="button">' + escapeHtml(s) + '</button>';
    }).join('');
    Array.prototype.forEach.call(suggestionsGridEl.querySelectorAll('.askakhil__suggestion-card'), function (btn, i) {
      btn.addEventListener('click', function () { handleSend(items[i]); });
    });
  }

  function setActiveTab(key) {
    state.activeTab = key;
    Array.prototype.forEach.call(tabsEl.querySelectorAll('.askakhil__tab'), function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tab') === key);
    });
    renderSuggestionGrid();
  }

  function pushMessage(type, text, meta) {
    state.messages.push({ id: uid(), type: type, text: text, ts: Date.now(), meta: meta });
    if (state.messages.length > MAX_MEMORY) state.messages = state.messages.slice(-MAX_MEMORY);
    renderMessages();
    persistConversation();
  }

  function pushBotMessage(text, meta) { pushMessage('bot', text, meta); }
  function pushUserMessage(text) { pushMessage('user', text); }

  function updateWelcomeAndPlaceholder() {
    inputEl.placeholder = DEFAULTS.PLACEHOLDER[state.language];
    Array.prototype.forEach.call(root.querySelectorAll('.askakhil__lang-toggle button'), function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === state.language);
    });
  }

  function handleSend(q) {
    var question = (q !== undefined ? q : inputEl.value).trim();
    if (!question) return;
    pushUserMessage(question);
    inputEl.value = '';
    state.isThinking = true;
    renderMessages();

    window.setTimeout(function () {
      var result = searchKnowledge(question, state.language);

      if (result.confidence >= 0.9) {
        pushBotMessage(result.answer, { confidence: result.confidence, source: result.entry && result.entry.id });
      } else if (result.confidence >= 0.7) {
        pushBotMessage(result.answer + '\n\nRelated: ' + result.suggestions.join(' — '), { confidence: result.confidence, suggestions: result.suggestions });
      } else {
        pushBotMessage("I couldn't find an exact answer, but these topics may help:\n\n" + result.suggestions.join('\n'), { confidence: result.confidence, suggestions: result.suggestions });
      }

      state.isThinking = false;
      renderMessages();
    }, 450);
  }

  function handleReset() {
    state.messages = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    renderMessages();
    pushBotMessage(DEFAULTS.WELCOME[state.language]);
  }

  function setLanguage(lang) {
    if (lang === state.language) return;
    state.language = lang;
    updateWelcomeAndPlaceholder();
    pushBotMessage(DEFAULTS.WELCOME[state.language]);
    persistConversation();
  }

  function togglePersist() {
    state.persistEnabled = !state.persistEnabled;
    persistBtn.textContent = state.persistEnabled ? 'Persist: On' : 'Persist: Off';
    persistBtn.classList.toggle('is-active', state.persistEnabled);
    persistBtn.setAttribute('aria-pressed', String(state.persistEnabled));
    try {
      localStorage.setItem(STORAGE_PREF_KEY, String(state.persistEnabled));
      if (!state.persistEnabled) localStorage.removeItem(STORAGE_KEY);
      else persistConversation();
    } catch (e) {}
    showToast(state.persistEnabled ? 'Persistence enabled — conversations saved locally' : 'Persistence disabled');
  }

  function clearSavedConversations() {
    state.messages = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_PREF_KEY, 'false');
    } catch (e) {}
    state.persistEnabled = false;
    persistBtn.textContent = 'Persist: Off';
    persistBtn.classList.remove('is-active');
    persistBtn.setAttribute('aria-pressed', 'false');
    renderMessages();
    showToast('Saved conversations cleared');
    pushBotMessage(DEFAULTS.WELCOME[state.language]);
  }

  function buildTranscript() {
    var header = 'Ask Akhil AI — Conversation Transcript\n' + new Date().toLocaleString() + '\n\n';
    var body = state.messages.map(function (m) {
      return (m.type === 'user' ? 'You' : 'Akhil AI') + ' (' + formatTimestamp(m.ts) + '):\n' + m.text + '\n';
    }).join('\n');
    return header + body;
  }

  function handleExport() {
    if (state.messages.length === 0) {
      showToast('Nothing to export yet');
      return;
    }
    var transcript = buildTranscript();

    function download(copied) {
      try {
        var blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'ask-akhil-conversation-' + Date.now() + '.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast(copied ? 'Copied to clipboard and downloaded' : 'Transcript downloaded');
      } catch (e) {
        showToast(copied ? 'Copied to clipboard' : 'Export failed');
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(transcript).then(
        function () { download(true); },
        function () { download(false); }
      );
    } else {
      download(false);
    }
  }

  function setOpen(open) {
    state.open = open;
    launcher.classList.toggle('is-open', open);
    launcher.setAttribute('aria-label', open ? 'Close Ask AI' : 'Open Ask AI');
    launcherLabel.textContent = open ? 'Close' : 'Ask AI';
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if (open) inputEl.focus();
  }

  var WIDGET_HTML =
    '<div class="askakhil">' +
      '<button class="askakhil__launcher" aria-label="Open Ask AI" type="button">' +
        '<svg class="askakhil__launcher-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<path d="M12 3.5c-4.7 0-8.5 3.36-8.5 7.5 0 2.23 1.08 4.24 2.86 5.64-.1.94-.46 2.1-1.28 3.24a.4.4 0 0 0 .43.62c1.8-.46 3.13-1.24 3.96-1.83.8.2 1.64.31 2.53.31 4.7 0 8.5-3.36 8.5-7.5S16.7 3.5 12 3.5Z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"></path>' +
          '<circle cx="8.3" cy="11" r="1.1" fill="#fff"></circle>' +
          '<circle cx="12" cy="11" r="1.1" fill="#fff"></circle>' +
          '<circle cx="15.7" cy="11" r="1.1" fill="#fff"></circle>' +
        '</svg>' +
        '<span class="askakhil__launcher-label">Ask AI</span>' +
      '</button>' +
      '<div class="askakhil__panel" role="dialog" aria-hidden="true" aria-label="Ask Akhil AI chat">' +
        '<header class="askakhil__header">' +
          '<div class="askakhil__avatar" aria-hidden="true">' +
            botAvatarSvg(26) +
            '<span class="askakhil__avatar-badge"></span>' +
          '</div>' +
          '<div class="askakhil__title">' +
            '<div class="askakhil__name">Ask Akhil AI</div>' +
            '<div class="askakhil__status"><span class="askakhil__status-dot"></span> AI Online</div>' +
          '</div>' +
          '<div class="askakhil__controls">' +
            '<div class="askakhil__lang-toggle" role="group" aria-label="Language">' +
              '<button data-lang="en" type="button" class="is-active">EN</button>' +
              '<button data-lang="hi" type="button">हिंदी</button>' +
            '</div>' +
            '<button class="askakhil__reset-btn" data-action="reset" type="button">Reset</button>' +
            '<button class="askakhil__close-btn" data-action="close" type="button" aria-label="Close">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round"></path></svg>' +
            '</button>' +
          '</div>' +
        '</header>' +
        '<div class="askakhil__utility">' +
          '<div class="askakhil__persist">' +
            '<button data-action="persist" type="button" aria-pressed="false">Persist: Off</button>' +
            '<div class="askakhil__tooltip" role="tooltip">Persistence stores conversations locally in your browser. No data leaves your device.</div>' +
          '</div>' +
          '<button data-action="export" type="button" aria-label="Export conversation">Export</button>' +
          '<button data-action="clear" type="button">Clear Saved</button>' +
        '</div>' +
        '<nav class="askakhil__tabs" aria-label="Topics">' +
          TABS.map(function (t) {
            return '<button class="askakhil__tab' + (t.key === TABS[0].key ? ' is-active' : '') + '" data-tab="' + t.key + '" type="button"><span aria-hidden="true">' + t.icon + '</span> ' + t.label + '</button>';
          }).join('') +
        '</nav>' +
        '<div class="askakhil__suggestions-grid"></div>' +
        '<div class="askakhil__divider"></div>' +
        '<div class="askakhil__body">' +
          '<div class="askakhil__messages" role="log" aria-live="polite"></div>' +
        '</div>' +
        '<div class="askakhil__toast" role="status" aria-live="polite"></div>' +
        '<footer class="askakhil__footer">' +
          '<div class="askakhil__input-row">' +
            '<textarea class="askakhil__input" aria-label="Ask Akhil a question"></textarea>' +
            '<button class="askakhil__send" data-action="send" type="button" aria-label="Send">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.4 20.6 21 12 3.4 3.4v6.6L15 12l-11.6 2v6.6Z" fill="#fff"></path></svg>' +
            '</button>' +
          '</div>' +
        '</footer>' +
      '</div>' +
    '</div>';

  function init() {
    var mount = document.createElement('div');
    mount.innerHTML = WIDGET_HTML;
    root = mount.firstElementChild;
    document.body.appendChild(root);

    launcher = root.querySelector('.askakhil__launcher');
    launcherLabel = root.querySelector('.askakhil__launcher-label');
    panel = root.querySelector('.askakhil__panel');
    persistBtn = root.querySelector('[data-action="persist"]');
    tabsEl = root.querySelector('.askakhil__tabs');
    suggestionsGridEl = root.querySelector('.askakhil__suggestions-grid');
    messagesEl = root.querySelector('.askakhil__messages');
    toastEl = root.querySelector('.askakhil__toast');
    inputEl = root.querySelector('.askakhil__input');

    launcher.addEventListener('click', function () { setOpen(!state.open); });
    root.querySelector('[data-action="close"]').addEventListener('click', function () { setOpen(false); });
    Array.prototype.forEach.call(root.querySelectorAll('.askakhil__lang-toggle button'), function (btn) {
      btn.addEventListener('click', function () { setLanguage(btn.getAttribute('data-lang')); });
    });
    root.querySelector('[data-action="reset"]').addEventListener('click', handleReset);
    persistBtn.addEventListener('click', togglePersist);
    root.querySelector('[data-action="export"]').addEventListener('click', handleExport);
    root.querySelector('[data-action="clear"]').addEventListener('click', clearSavedConversations);
    Array.prototype.forEach.call(tabsEl.querySelectorAll('.askakhil__tab'), function (btn) {
      btn.addEventListener('click', function () { setActiveTab(btn.getAttribute('data-tab')); });
    });
    root.querySelector('[data-action="send"]').addEventListener('click', function () { handleSend(); });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    var hadPersisted = loadPersistedState();
    updateWelcomeAndPlaceholder();
    renderSuggestionGrid();
    persistBtn.textContent = state.persistEnabled ? 'Persist: On' : 'Persist: Off';
    persistBtn.classList.toggle('is-active', state.persistEnabled);
    persistBtn.setAttribute('aria-pressed', String(state.persistEnabled));

    if (hadPersisted) {
      renderMessages();
    } else {
      pushBotMessage(DEFAULTS.WELCOME[state.language]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
