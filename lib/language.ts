export type Language = "el" | "en";

export const languages: Record<Language, { label: string; alternate: Language }> = {
  el: {
    label: "ελληνικά",
    alternate: "en",
  },
  en: {
    label: "english",
    alternate: "el",
  },
};

export const homeContent: Record<
  Language,
  {
    metaDescription: string;
    heading: string;
    intro: string;
    switchLabel: string;
    navigationLabel: string;
    menuLabel: string;
    navItems: Array<{ label: string; href: string }>;
    heroEyebrow: string;
    heroCta: string;
    sections: {
      aboutTitle: string;
      aboutBody: string;
      servicesTitle: string;
      servicesBody: string;
      giftCardTitle: string;
      giftCardBody: string;
      loyaltyCardTitle: string;
      loyaltyCardBody: string;
      projectsTitle: string;
      projectsBody: string;
      referencesTitle: string;
      referencesBody: string;
      contactTitle: string;
      contactBody: string;
    };
    references: Array<{ title: string; text: string }>;
  }
> = {
  el: {
    metaDescription: "Μια βασική ιστοσελίδα Next.js για το Get2Gether Project.",
    heading: "Get2Gether",
    intro: "Ένας χώρος για ιδέες, δράσεις και συναντήσεις που φέρνουν ανθρώπους πιο κοντά.",
    switchLabel: "english",
    navigationLabel: "κύρια πλοήγηση",
    menuLabel: "άνοιγμα μενού",
    navItems: [
      { label: "αρχική", href: "#home" },
      { label: "σχετικά", href: "#about" },
      { label: "υπηρεσίες", href: "#services" },
      { label: "workshops", href: "#references" },
      { label: "επικοινωνία", href: "#contact" },
    ],
    heroEyebrow: "get2gether project",
    heroCta: "δείτε περισσότερα",
    sections: {
      aboutTitle: "σχετικά με το project",
      aboutBody:
        "Το Get2Gether Project είναι μια απλή βάση για μια δίγλωσση ιστοσελίδα με καθαρή δομή, εικόνες και χώρο για μελλοντικό περιεχόμενο.",
      servicesTitle: "διαθέσιμες υπηρεσίες",
      servicesBody:
        "Εκτός από τις εκδηλώσεις, η σελίδα μπορεί να παρουσιάζει διαθέσιμες επιλογές όπως gift cards και το loyalty card των συμμετεχόντων.",
      giftCardTitle: "gift card",
      giftCardBody:
        "Το gift card εμφανίζεται ως διαθέσιμη υπηρεσία για όσους θέλουν να προσφέρουν μια εμπειρία Get2Gether σε κάποιον άλλον.",
      loyaltyCardTitle: "loyalty card",
      loyaltyCardBody:
        "Κάθε φορά που κάποιος έρχεται σε event, η συμμετοχή του μπορεί να προστίθεται στο loyalty card του.",
      projectsTitle: "δράσεις",
      projectsBody:
        "Η σελίδα είναι έτοιμη να επεκταθεί με εκδηλώσεις, κάρτες, νέα ή οποιαδήποτε ενότητα χρειαστεί το project.",
      referencesTitle: "προηγούμενα workshops",
      referencesBody:
        "Τα προηγούμενα workshops χρησιμοποιούνται ως οπτικές αναφορές, ώστε ο επισκέπτης να καταλαβαίνει αμέσως την αισθητική και το είδος των εμπειριών.",
      contactTitle: "επικοινωνία",
      contactBody:
        "Προσθέστε εδώ τα στοιχεία επικοινωνίας, φόρμες ή συνδέσμους κοινωνικών δικτύων όταν είναι διαθέσιμα.",
    },
    references: [
      {
        title: "swap event",
        text: "μια προηγούμενη δράση ανταλλαγής αντικειμένων με γειτονικό και δημιουργικό χαρακτήρα.",
      },
      {
        title: "pipe cleaner flowers",
        text: "ένα floral workshop με έντονα χρώματα και χειροποίητη αισθητική.",
      },
      {
        title: "textured art",
        text: "ένα workshop με ανάγλυφες επιφάνειες και πιο minimal εικαστική κατεύθυνση.",
      },
    ],
  },
  en: {
    metaDescription: "A basic Next.js website for the Get2Gether Project.",
    heading: "Get2Gether",
    intro: "A space for ideas, activities, and gatherings that bring people closer together.",
    switchLabel: "ελληνικά",
    navigationLabel: "main navigation",
    menuLabel: "open menu",
    navItems: [
      { label: "home", href: "#home" },
      { label: "about", href: "#about" },
      { label: "services", href: "#services" },
      { label: "workshops", href: "#references" },
      { label: "contact", href: "#contact" },
    ],
    heroEyebrow: "get2gether project",
    heroCta: "see more",
    sections: {
      aboutTitle: "about the project",
      aboutBody:
        "The Get2Gether Project is a simple foundation for a bilingual website with a clear structure, images, and room for future content.",
      servicesTitle: "available services",
      servicesBody:
        "Alongside events, the page can present available options such as gift cards and the participant loyalty card.",
      giftCardTitle: "gift card",
      giftCardBody:
        "The gift card is shown as an available service for anyone who wants to give a Get2Gether experience to someone else.",
      loyaltyCardTitle: "loyalty card",
      loyaltyCardBody:
        "Whenever someone attends an event, that visit can be added to their loyalty card.",
      projectsTitle: "projects",
      projectsBody:
        "The page is ready to expand with events, cards, news, or any section the project needs.",
      referencesTitle: "past workshops",
      referencesBody:
        "Past workshops are used as visual references, helping visitors quickly understand the aesthetic and kind of experiences offered.",
      contactTitle: "contact",
      contactBody:
        "Add contact details, forms, or social links here when they are available.",
    },
    references: [
      {
        title: "swap event",
        text: "a previous item-swap activity with a local, creative character.",
      },
      {
        title: "pipe cleaner flowers",
        text: "a floral workshop with bright colors and a handmade aesthetic.",
      },
      {
        title: "textured art",
        text: "a workshop with raised surfaces and a more minimal art direction.",
      },
    ],
  },
};

// Resolves the active language from the URL query and falls back to Greek.
export function resolveLanguage(language: string | string[] | undefined): Language {
  return language === "en" ? "en" : "el";
}
