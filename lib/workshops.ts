import building from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 1.png";
import swap from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 4.png";
import flowers from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 7.png";
import texture from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 10.png";
import plaster from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 17.png";
import gift from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 24.png";
import loyalty from "@/assets/TransferNow-20260526jAAIYA6v/2gether - 21.png";

// Historical artwork only: these records do not represent bookable inventory.
export const workshops = [
  { slug: "swap-together", images: [swap] },
  { slug: "pipe-cleaner-flowers", images: [flowers] },
  { slug: "textured-art", images: [texture, plaster] },
  { slug: "building-together", images: [building] },
];
export const serviceImages = [flowers, plaster, gift, loyalty];
export const heroImages = [building, flowers, texture];
