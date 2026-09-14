export type Language = "el" | "en";
export const languages: Record<
  Language,
  { label: string; alternate: Language }
> = {
  el: { label: "ελληνικά", alternate: "en" },
  en: { label: "english", alternate: "el" },
};

export const homeContent = {
  en: {
    metaDescription:
      "Creative workshops, shared experiences and little escapes from everyday life. Discover the Get2Gether Project.",
    heading: "Your time,",
    headingAccent: "better together.",
    intro:
      "Creative experiences for a little escape from everyday life. Make something new, meet your people, and enjoy the moment.",
    switchLabel: "Ελληνικά",
    languageLabel: "Language",
    more: "More",
    navigationLabel: "Main navigation",
    menu: "Menu",
    menuLabel: "Open menu",
    close: "Close",
    skip: "Skip to content",
    navItems: [
      { label: "Home", href: "/" },
      { label: "Events", href: "/events" },
      { label: "DIY Kits", href: "/diy-kits" },
      { label: "Extras", href: "/extras" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    heroCta: "Explore workshops",
    storyCta: "Our story",
    inquire: "Get in touch",
    services: "Our experiences",
    previous: "Previous",
    next: "Next",
    image: "Image",
    servicesIntro:
      "A little creativity. A good conversation. A reason to get together.",
    serviceNames: [
      "Creative workshops",
      "Private events",
      "Gift card",
      "Loyalty card",
    ],
    serviceDescriptions: [
      "Discover what we make together.",
      "An experience for your own group.",
      "Give someone a moment to remember.",
      "Make getting together a habit.",
    ],
    togetherTitle: "Small moments. Lasting connections.",
    togetherBody:
      "There is something special about sitting around a table, trying something for the first time, and leaving with more than what you made.",
    reviewTitle: "Share your experience",
    reviewIntro: "Have you joined us? We would love to hear your story.",
    reviewSubmit: "Submit review",
    rating: "Your rating",
    ratingUnit: "out of 5 stars",
    experience: "Your experience",
    name: "Name",
    email: "Email address",
    contactEmail: "Email",
    phone: "Phone (optional)",
    contactPhone: "Phone",
    message: "Message",
    submit: "Send request",
    sending: "Sending…",
    error: "We could not save your request. Please try again.",
    success:
      "Thank you. Your request has been saved. This is not a confirmed booking.",
    reviewSuccess: "Thank you. Your review has been saved for moderation.",
    privacy:
      "Your details are used only to handle this request. Reviews are checked before publication; your email is never displayed.",
    eventsTitle: "Our workshops",
    eventsIntro:
      "Explore the things we have made and the moments we have shared.",
    calendarTitle: "Workshop calendar",
    calendarIntro: "Browse the dates of our past workshops.",
    calendarPreviousMonth: "Previous month",
    calendarNextMonth: "Next month",
    calendarDate: "Date",
    calendarTime: "Time",
    calendarNoEvents: "No workshops this month.",
    past: "Past workshop",
    details: "Discover more",
    back: "Back to workshops",
    upcoming: "Next time, together",
    upcomingBody:
      "New dates will be announced here. Tell us which workshop you would love to join.",
    interest: "Register interest",
    archiveNote:
      "This workshop has already taken place. Register your interest in a future edition; dates and availability are not yet confirmed.",
    privateTitle: "Private events",
    privateIntro: "Your people. Your occasion. An experience made for you.",
    privateBody:
      "Whether you are celebrating or simply bringing your favourite people together, tell us your idea. We can explore the possibilities together.",
    customTitle: "Create your own",
    customBody:
      "Share your occasion, preferred date and a few details about your group.",
    curatedTitle: "Find your inspiration",
    curatedBody:
      "Start with one of our previous creative workshops and make it your own.",
    inquiryTitle: "Let’s create something together",
    inquiryIntro: "Tell us a little about your idea.",
    date: "Preferred date",
    guests: "Number of guests",
    location: "Area / location",
    setting: "Setting",
    choose: "Choose an option",
    outdoor: "Outdoor",
    indoor: "Indoor",
    both: "Either",
    budget: "Decoration budget (€)",
    activity: "Include a creative activity",
    food: "Food / drink preference",
    foodOptions: ["Brunch", "Food", "Drinks", "None"],
    occasion: "Occasion or workshop",
    aboutTitle: "Who we are",
    aboutLead: "Life happens in the moments we share.",
    aboutParagraphs: [
      "Get2Gether is about making room for those moments: a conversation with someone new, the joy of creating with your hands, a few hours that feel different from the rest of the week.",
      "Our workshops bring people together through creativity. From handmade flowers and textured art to swapping pre-loved treasures, every experience starts with a simple idea: let’s do something together.",
      "Come with a friend or come as you are. You do not need to be an artist to enjoy the process. A little curiosity is a lovely place to start.",
    ],
    contactTitle: "Let’s get together",
    contactBody:
      "A question, a collaboration or an idea for your next gathering? Tell us about it.",
    giftTitle: "A little gift. A shared experience.",
    giftBody:
      "Interested in gifting a Get2Gether workshop? Ask us about the possibilities and availability.",
    loyaltyTitle: "More moments together",
    loyaltyBody:
      "Ask us about the Get2Gether loyalty card and how your workshop visits can count towards it.",
    linktreeTitle: "More to discover",
    linktreeIntro:
      "Follow along, explore previous creations and find a little extra inspiration.",
    linktreeLinks: [
      {
        title: "Instagram",
        description: "Follow the latest moments from Get2Gether.",
        href: "https://www.instagram.com/get2getherproject",
      },
      {
        title: "TikTok",
        description: "Watch our creative moments in motion.",
        href: "https://www.tiktok.com/@get2getherproject",
      },
      {
        title: "Instagram channel",
        description: "Be the first to hear about events, offers and giveaways.",
        href: "https://www.instagram.com/channel/AbbEyoLPvXZ1BnSj",
      },
      {
        title: "YouTube",
        description: "Find Get2Gether Project on YouTube.",
        href: "https://youtube.com/@get2getherproject?sub_confirmation=1",
      },
      {
        title: "Barbie magic",
        description: "Explore the Barbie creations and inspiration.",
        href: "https://drive.google.com/drive/folders/14Jd1efKBofBFfCIz4jYw6euXsaG_mOl-?usp=sharing",
      },
      {
        title: "Barbie quiz",
        description: "Play the nostalgic Barbie movie quiz.",
        href: "https://create.kahoot.it/share/nostalgic-barbie-movies/4cf574a8-09a8-463f-9229-5be9e11c6a62",
      },
      {
        title: "Get in touch",
        description: "Find all Get2Gether links and contact Hope Pantou.",
        href: "https://linktr.ee/get2getherproject",
      },
    ],
    footer: "Creative experiences. Real connections.",
    followUs: "Follow us",
    instagramLabel: "Get2Gether Project on Instagram",
    rights: "All rights reserved.",
    notFound: "This workshop could not be found.",
    workshops: [
      {
        title: "Let’s swap together",
        description:
          "Give pre-loved objects a new story. A gathering built around sharing, discovery and a little more connection with your neighbours.",
      },
      {
        title: "Pipe cleaner flowers",
        description:
          "Bright colours, soft materials and flowers that last. Explore a playful way to create your own handmade bouquet.",
      },
      {
        title: "Textured art",
        description:
          "Explore shape, texture and your own creative instinct. A chance to slow down and make something with your hands.",
      },
      {
        title: "Building together",
        description:
          "Piece by piece, make something colourful. A relaxed creative experience with plenty of room for conversation.",
      },
    ],
  },
  el: {
    metaDescription:
      "Δημιουργικά εργαστήρια, κοινές εμπειρίες και μικρές αποδράσεις από την καθημερινότητα. Ανακάλυψε το Get2Gether Project.",
    heading: "Ο χρόνος σου,",
    headingAccent: "ομορφότερος μαζί.",
    intro:
      "Δημιουργικές εμπειρίες για μια μικρή απόδραση από την καθημερινότητα. Φτιάξε κάτι νέο, γνώρισε ανθρώπους και απόλαυσε τη στιγμή.",
    switchLabel: "English",
    languageLabel: "Γλώσσα",
    more: "Περισσότερα",
    navigationLabel: "Κύρια πλοήγηση",
    menu: "Μενού",
    menuLabel: "Άνοιγμα μενού",
    close: "Κλείσιμο",
    skip: "Μετάβαση στο περιεχόμενο",
    navItems: [
      { label: "Αρχική", href: "/" },
      { label: "Εκδηλώσεις", href: "/events" },
      { label: "DIY Σετ", href: "/diy-kits" },
      { label: "Έξτρα", href: "/extras" },
      { label: "Πολιτική Απορρήτου", href: "/privacy-policy" },
      { label: "Σχετικά", href: "/about" },
      { label: "Επικοινωνία", href: "/contact" },
    ],
    heroCta: "Δες τα εργαστήρια",
    storyCta: "Η ιστορία μας",
    inquire: "Επικοινωνία",
    services: "Οι εμπειρίες μας",
    previous: "Προηγούμενο",
    next: "Επόμενο",
    image: "Εικόνα",
    servicesIntro:
      "Λίγη δημιουργία. Μια όμορφη συζήτηση. Μια αφορμή να βρεθούμε μαζί.",
    serviceNames: [
      "Δημιουργικά εργαστήρια",
      "Ιδιωτικές εκδηλώσεις",
      "Δωροκάρτα",
      "Κάρτα επιβράβευσης",
    ],
    serviceDescriptions: [
      "Ανακάλυψε όσα δημιουργούμε μαζί.",
      "Μια εμπειρία για τη δική σου παρέα.",
      "Χάρισε μια στιγμή που θα μείνει αξέχαστη.",
      "Κάνε τις συναντήσεις μας συνήθεια.",
    ],
    togetherTitle: "Μικρές στιγμές. Αληθινές σχέσεις.",
    togetherBody:
      "Είναι ξεχωριστό να κάθεσαι γύρω από ένα τραπέζι, να δοκιμάζεις κάτι για πρώτη φορά και να φεύγεις με περισσότερα από όσα έφτιαξες.",
    reviewTitle: "Μοιράσου την εμπειρία σου",
    reviewIntro:
      "Ήσουν στην παρέα μας; Θα χαρούμε να ακούσουμε την ιστορία σου.",
    reviewSubmit: "Υποβολή αξιολόγησης",
    rating: "Η βαθμολογία σου",
    ratingUnit: "από 5 αστέρια",
    experience: "Η εμπειρία σου",
    name: "Όνομα",
    email: "Διεύθυνση email",
    contactEmail: "Email",
    phone: "Τηλέφωνο (προαιρετικό)",
    contactPhone: "Τηλέφωνο",
    message: "Μήνυμα",
    submit: "Αποστολή αιτήματος",
    sending: "Αποστολή…",
    error: "Δεν μπορέσαμε να αποθηκεύσουμε το αίτημά σου. Δοκίμασε ξανά.",
    success:
      "Ευχαριστούμε. Το αίτημά σου αποθηκεύτηκε. Δεν αποτελεί επιβεβαιωμένη κράτηση.",
    reviewSuccess: "Ευχαριστούμε. Η αξιολόγησή σου αποθηκεύτηκε για έλεγχο.",
    privacy:
      "Τα στοιχεία σου χρησιμοποιούνται μόνο για τη διαχείριση του αιτήματος. Οι αξιολογήσεις ελέγχονται πριν από τη δημοσίευση· το email σου δεν εμφανίζεται ποτέ.",
    eventsTitle: "Τα εργαστήριά μας",
    eventsIntro:
      "Ανακάλυψε όσα δημιουργήσαμε και τις στιγμές που μοιραστήκαμε.",
    calendarTitle: "Ημερολόγιο εργαστηρίων",
    calendarIntro: "Δες τις ημερομηνίες των προηγούμενων εργαστηρίων μας.",
    calendarPreviousMonth: "Προηγούμενος μήνας",
    calendarNextMonth: "Επόμενος μήνας",
    calendarDate: "Ημερομηνία",
    calendarTime: "Ώρα",
    calendarNoEvents: "Δεν υπάρχουν εργαστήρια αυτόν τον μήνα.",
    past: "Προηγούμενο εργαστήριο",
    details: "Μάθε περισσότερα",
    back: "Πίσω στα εργαστήρια",
    upcoming: "Την επόμενη φορά, μαζί",
    upcomingBody:
      "Οι νέες ημερομηνίες θα ανακοινωθούν εδώ. Πες μας σε ποιο εργαστήριο θα ήθελες να συμμετάσχεις.",
    interest: "Εκδήλωση ενδιαφέροντος",
    archiveNote:
      "Αυτό το εργαστήριο έχει ήδη πραγματοποιηθεί. Δήλωσε ενδιαφέρον για μια μελλοντική συνάντηση· οι ημερομηνίες και η διαθεσιμότητα δεν έχουν ακόμη επιβεβαιωθεί.",
    privateTitle: "Ιδιωτικές εκδηλώσεις",
    privateIntro: "Οι άνθρωποί σου. Η αφορμή σου. Μια εμπειρία για εσένα.",
    privateBody:
      "Είτε γιορτάζεις είτε θέλεις απλώς να φέρεις κοντά τους αγαπημένους σου, μοιράσου την ιδέα σου. Θα εξερευνήσουμε μαζί τις δυνατότητες.",
    customTitle: "Δημιούργησε τη δική σου",
    customBody:
      "Πες μας την αφορμή, την επιθυμητή ημερομηνία και λίγα λόγια για την παρέα σου.",
    curatedTitle: "Βρες την έμπνευσή σου",
    curatedBody:
      "Ξεκίνα από ένα προηγούμενο δημιουργικό εργαστήριό μας και προσάρμοσέ το στην παρέα σου.",
    inquiryTitle: "Ας δημιουργήσουμε κάτι μαζί",
    inquiryIntro: "Πες μας λίγα λόγια για την ιδέα σου.",
    date: "Επιθυμητή ημερομηνία",
    guests: "Αριθμός ατόμων",
    location: "Περιοχή / τοποθεσία",
    setting: "Χώρος",
    choose: "Επίλεξε",
    outdoor: "Εξωτερικός",
    indoor: "Εσωτερικός",
    both: "Οποιοσδήποτε",
    budget: "Προϋπολογισμός διακόσμησης (€)",
    activity: "Θα ήθελα δημιουργική δραστηριότητα",
    food: "Προτίμηση φαγητού / ποτού",
    foodOptions: ["Brunch", "Φαγητό", "Ποτά", "Τίποτα"],
    occasion: "Αφορμή ή εργαστήριο",
    aboutTitle: "Ποιοι είμαστε",
    aboutLead: "Η ζωή είναι οι στιγμές που μοιραζόμαστε.",
    aboutParagraphs: [
      "Το Get2Gether δημιουργεί χώρο για αυτές τις στιγμές: μια συζήτηση με κάποιον καινούριο, τη χαρά να δημιουργείς με τα χέρια σου, λίγες ώρες διαφορετικές από την υπόλοιπη εβδομάδα.",
      "Τα εργαστήριά μας φέρνουν τους ανθρώπους κοντά μέσα από τη δημιουργία. Από χειροποίητα λουλούδια και ανάγλυφη τέχνη μέχρι ανταλλαγές αγαπημένων αντικειμένων, κάθε εμπειρία ξεκινά με μια απλή ιδέα: ας κάνουμε κάτι μαζί.",
      "Έλα με την παρέα σου ή μόνος σου. Δεν χρειάζεται να είσαι καλλιτέχνης για να απολαύσεις τη διαδικασία. Λίγη περιέργεια είναι μια όμορφη αρχή.",
    ],
    contactTitle: "Ας βρεθούμε μαζί",
    contactBody:
      "Μια ερώτηση, μια συνεργασία ή μια ιδέα για την επόμενη συνάντησή σου; Μίλησέ μας γι’ αυτό.",
    giftTitle: "Ένα μικρό δώρο. Μια κοινή εμπειρία.",
    giftBody:
      "Θέλεις να χαρίσεις ένα εργαστήριο Get2Gether; Ρώτησέ μας για τις επιλογές και τη διαθεσιμότητα.",
    loyaltyTitle: "Περισσότερες στιγμές μαζί",
    loyaltyBody:
      "Ρώτησέ μας για την κάρτα επιβράβευσης Get2Gether και πώς μπορούν να μετρήσουν οι συμμετοχές σου.",
    linktreeTitle: "Ανακάλυψε περισσότερα",
    linktreeIntro:
      "Ακολούθησέ μας, ανακάλυψε προηγούμενες δημιουργίες και βρες λίγη ακόμη έμπνευση.",
    linktreeLinks: [
      {
        title: "Instagram",
        description: "Ακολούθησε τις πιο πρόσφατες στιγμές του Get2Gether.",
        href: "https://www.instagram.com/get2getherproject",
      },
      {
        title: "TikTok",
        description: "Δες τις δημιουργικές μας στιγμές σε κίνηση.",
        href: "https://www.tiktok.com/@get2getherproject",
      },
      {
        title: "Κανάλι Instagram",
        description: "Μάθε πρώτη για εκδηλώσεις, προσφορές και διαγωνισμούς.",
        href: "https://www.instagram.com/channel/AbbEyoLPvXZ1BnSj",
      },
      {
        title: "YouTube",
        description: "Βρες το Get2Gether Project στο YouTube.",
        href: "https://youtube.com/@get2getherproject?sub_confirmation=1",
      },
      {
        title: "Barbie magic",
        description: "Ανακάλυψε τις δημιουργίες και την έμπνευση Barbie.",
        href: "https://drive.google.com/drive/folders/14Jd1efKBofBFfCIz4jYw6euXsaG_mOl-?usp=sharing",
      },
      {
        title: "Barbie quiz",
        description: "Παίξε το νοσταλγικό quiz ταινιών Barbie.",
        href: "https://create.kahoot.it/share/nostalgic-barbie-movies/4cf574a8-09a8-463f-9229-5be9e11c6a62",
      },
      {
        title: "Επικοινωνία",
        description: "Βρες όλους τους συνδέσμους Get2Gether και επικοινώνησε με την Hope Pantou.",
        href: "https://linktr.ee/get2getherproject",
      },
    ],
    footer: "Δημιουργικές εμπειρίες. Αληθινές σχέσεις.",
    followUs: "Ακολουθήστε μας",
    instagramLabel: "Get2Gether Project στο Instagram",
    rights: "Με επιφύλαξη παντός δικαιώματος.",
    notFound: "Αυτό το εργαστήριο δεν βρέθηκε.",
    workshops: [
      {
        title: "Ας ανταλλάξουμε μαζί",
        description:
          "Χάρισε μια νέα ιστορία σε αγαπημένα αντικείμενα. Μια συνάντηση γεμάτη μοίρασμα, ανακαλύψεις και σύνδεση με τους ανθρώπους της γειτονιάς.",
      },
      {
        title: "Λουλούδια από σύρμα πίπας",
        description:
          "Έντονα χρώματα, μαλακά υλικά και λουλούδια που μένουν. Ανακάλυψε έναν παιχνιδιάρικο τρόπο να φτιάξεις το δικό σου χειροποίητο μπουκέτο.",
      },
      {
        title: "Ανάγλυφη τέχνη",
        description:
          "Εξερεύνησε τις φόρμες, τις υφές και τη δημιουργικότητά σου. Μια ευκαιρία να χαλαρώσεις και να φτιάξεις κάτι με τα χέρια σου.",
      },
      {
        title: "Χτίζουμε μαζί",
        description:
          "Κομμάτι κομμάτι, φτιάξε κάτι πολύχρωμο. Μια χαλαρή δημιουργική εμπειρία με άφθονο χώρο για συζήτηση.",
      },
    ],
  },
};

// Resolves the URL language, with Greek as the default.
export function resolveLanguage(
  language: string | string[] | undefined,
): Language {
  return language === "en" ? "en" : "el";
}
