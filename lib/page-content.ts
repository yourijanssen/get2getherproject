import type { Language } from "@/lib/language";

export type SitePageKey =
  | "events"
  | "diy-kits"
  | "extras"
  | "privacy-policy"
  | "about"
  | "contact";

type SitePage = {
  title: string;
  intro: string;
  body: string;
};

export const sitePages: Record<Language, Record<SitePageKey, SitePage>> = {
  el: {
    events: {
      title: "Εκδηλώσεις",
      intro: "Ανακαλύψτε τις επόμενες εκδηλώσεις του Get2Gether Project.",
      body: "Εδώ θα παρουσιάζονται δημιουργικές συναντήσεις, workshops και δράσεις για ανθρώπους που θέλουν να μοιραστούν ιδέες και εμπειρίες.",
    },
    "diy-kits": {
      title: "DIY Σετ",
      intro: "Δημιουργήστε τη δική σας εμπειρία Get2Gether στο σπίτι.",
      body: "Τα DIY σετ συγκεντρώνουν όλα όσα χρειάζεστε για μια δημιουργική δραστηριότητα, μόνοι ή μαζί με άλλους.",
    },
    extras: {
      title: "Έξτρα",
      intro: "Μικρές προσθήκες που κάνουν κάθε συνάντηση ξεχωριστή.",
      body: "Σε αυτή την ενότητα θα βρείτε gift cards, loyalty cards και άλλες επιλογές που συμπληρώνουν την εμπειρία.",
    },
    "privacy-policy": {
      title: "Πολιτική Απορρήτου",
      intro: "Η ιδιωτικότητα και η διαφάνεια είναι σημαντικές για εμάς.",
      body: "Η πλήρης πολιτική απορρήτου θα προστεθεί εδώ πριν από τη δημόσια λειτουργία της ιστοσελίδας.",
    },
    about: {
      title: "Σχετικά",
      intro: "Το Get2Gether Project δημιουργεί χώρο για ιδέες, δράσεις και συναντήσεις.",
      body: "Στόχος μας είναι να φέρνουμε ανθρώπους πιο κοντά μέσα από δημιουργικές εμπειρίες, συνεργασία και ανοιχτή επικοινωνία.",
    },
    contact: {
      title: "Επικοινωνία",
      intro: "Θα χαρούμε να ακούσουμε από εσάς.",
      body: "Προσθέστε εδώ τα στοιχεία επικοινωνίας, τη φόρμα ή τους συνδέσμους κοινωνικών δικτύων του project.",
    },
  },
  en: {
    events: {
      title: "Events",
      intro: "Discover the upcoming events from the Get2Gether Project.",
      body: "This page will feature creative gatherings, workshops, and activities for people who want to share ideas and experiences.",
    },
    "diy-kits": {
      title: "DIY Kits",
      intro: "Create your own Get2Gether experience at home.",
      body: "DIY kits bring together everything you need for a creative activity, on your own or with others.",
    },
    extras: {
      title: "Extras",
      intro: "Small additions that make every gathering special.",
      body: "This section will include gift cards, loyalty cards, and other options that complement the experience.",
    },
    "privacy-policy": {
      title: "Privacy Policy",
      intro: "Privacy and transparency matter to us.",
      body: "The complete privacy policy will be added here before the website goes public.",
    },
    about: {
      title: "About",
      intro: "The Get2Gether Project creates space for ideas, activities, and gatherings.",
      body: "Our goal is to bring people closer through creative experiences, collaboration, and open communication.",
    },
    contact: {
      title: "Contact",
      intro: "We would love to hear from you.",
      body: "Add the project’s contact details, form, or social links here when they are available.",
    },
  },
};
