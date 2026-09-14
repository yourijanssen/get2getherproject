import building from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 1.png";
import swap from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 4.png";
import flowers from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 7.png";
import texture from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 10.png";
import plaster from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 17.png";
import gift from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 24.png";
import loyalty from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 21.png";

// Historical artwork only: these records do not represent bookable inventory.
export const workshops = [
  {
    slug: "swap-together",
    date: "2026-04-26",
    startTime: "18:00",
    endTime: "21:00",
    images: [swap],
  },
  {
    slug: "pipe-cleaner-flowers",
    date: "2026-05-10",
    startTime: "18:00",
    endTime: "20:00",
    images: [flowers],
  },
  {
    slug: "textured-art",
    date: "2026-05-24",
    startTime: "18:00",
    endTime: "20:00",
    images: [texture, plaster],
  },
  {
    slug: "building-together",
    date: "2026-03-22",
    startTime: "12:00",
    endTime: "14:00",
    images: [building],
  },
];
export const serviceImages = [flowers, plaster, gift, loyalty];
export const heroImages = [building, flowers, texture];
