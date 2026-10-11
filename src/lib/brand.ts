// Hand-painted design elements. These are part of the design, not CMS content.
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

export const brand = {
  logoName,
  signs: {
    gallery: signGallery,
    shop: signShop,
    about: signAbout,
    contact: signContact,
    home: signHome,
  },
  doodads: { greyCat, galCat, catBooks, shroom, tree },
} as const
