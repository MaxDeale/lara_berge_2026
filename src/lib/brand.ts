// Hand-painted design elements. These are part of the design, not CMS content.
import type { StaticImageData } from 'next/image'
import logoName from '../../public/brand/logo-name.png'
import signGallery from '../../public/brand/sign-gallery.png'
import signShop from '../../public/brand/sign-shop.png'
import signAbout from '../../public/brand/sign-about.png'
import signContact from '../../public/brand/sign-contact.png'
import signHome from '../../public/brand/sign-home.png'
import greyCat from '../../public/brand/greycat.png'
import galCat from '../../public/brand/galcat.png'
import catBooks from '../../public/brand/catbooks.png'
import shroom from '../../public/brand/shroom.png'
import tree from '../../public/brand/tree.png'
import branch from '../../public/brand/branch.png'

/**
 * A painted sign and the point it hangs from: the top of its string, or of its crest or frame
 * when it has none. `x` is a fraction of the image's width, `y` a fraction of its width too
 * (so it scales with the sign). Measured from the paintings.
 */
export type Sign = { image: StaticImageData; hang: { x: number; y: number } }

export const brand = {
  logoName,
  /** Lara's painted limb the signs hang from */
  branch,
  signs: {
    gallery: { image: signGallery, hang: { x: 0.46, y: 0.052 } },
    shop: { image: signShop, hang: { x: 0.51, y: 0.02 } },
    about: { image: signAbout, hang: { x: 0.42, y: 0.01 } },
    contact: { image: signContact, hang: { x: 0.5, y: 0.02 } },
    home: { image: signHome, hang: { x: 0.62, y: 0.01 } },
  } satisfies Record<string, Sign>,
  doodads: { greyCat, galCat, catBooks, shroom, tree },
} as const
