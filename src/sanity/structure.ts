import { BasketIcon } from '@sanity/icons/Basket'
import { CogIcon } from '@sanity/icons/Cog'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { EditIcon } from '@sanity/icons/Edit'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { ImageIcon } from '@sanity/icons/Image'
import { ImagesIcon } from '@sanity/icons/Images'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'
import { COMMISSION_STATUS } from './schemaTypes/commissionRequest'
import { ORDER_STATUS } from './schemaTypes/order'

/** The Studio sidebar, written for Lara rather than for a developer. */
export const structure: StructureResolver = (S, context) => {
  const orderList = (title: string, filter: string, id: string) =>
    S.listItem()
      .id(id)
      .title(title)
      .icon(BasketIcon)
      .child(
        S.documentList()
          .id(id)
          .title(title)
          .schemaType('order')
          .filter(filter)
          .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
          .canHandleIntent(() => false),
      )

  return S.list()
    .title('Lara Berge Artworks')
    .items([
      S.listItem()
        .id('artworks')
        .title('Artworks')
        .icon(ImagesIcon)
        .child(
          S.list()
            .id('artworks')
            .title('Artworks')
            .items([
              orderableDocumentListDeskItem({
                type: 'artwork',
                id: 'orderable-paintings',
                title: 'Paintings (drag to reorder)',
                icon: ImageIcon,
                filter: 'kind == "painting"',
                S,
                context,
              }),
              orderableDocumentListDeskItem({
                type: 'artwork',
                id: 'orderable-digital',
                title: 'Digital illustrations (drag to reorder)',
                icon: ImagesIcon,
                filter: 'kind == "digital"',
                S,
                context,
              }),
              S.divider(),
              S.listItem()
                .id('needs-input')
                .title('Still needs your input')
                .icon(EditIcon)
                .child(
                  S.documentList()
                    .id('needs-input')
                    .title('Still needs your input')
                    .schemaType('artwork')
                    .filter('_type == "artwork" && defined(needsInput) && needsInput != ""'),
                ),
            ]),
        ),

      S.divider(),

      S.listItem()
        .id('orders')
        .title('Orders')
        .icon(BasketIcon)
        .child(
          S.list()
            .id('orders')
            .title('Orders')
            .items([
              orderList(
                'Paid: ready to wrap',
                '_type == "order" && status == "paid"',
                'orders-paid',
              ),
              orderList('All orders', '_type == "order"', 'orders-all'),
              S.divider(),
              ...ORDER_STATUS.filter((s) => s.value !== 'paid').map((s) =>
                orderList(
                  s.title,
                  `_type == "order" && status == "${s.value}"`,
                  `orders-${s.value}`,
                ),
              ),
            ]),
        ),

      S.listItem()
        .id('commissions')
        .title('Commission requests')
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .id('commissions')
            .title('Commission requests')
            .items([
              S.listItem()
                .id('commissions-all')
                .title('All requests')
                .child(
                  S.documentList()
                    .id('commissions-all')
                    .title('All requests')
                    .schemaType('commissionRequest')
                    .filter('_type == "commissionRequest"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                ),
              S.divider(),
              ...COMMISSION_STATUS.map((s) =>
                S.listItem()
                  .id(`commissions-${s.value}`)
                  .title(s.title)
                  .child(
                    S.documentList()
                      .id(`commissions-${s.value}`)
                      .title(s.title)
                      .schemaType('commissionRequest')
                      .filter(`_type == "commissionRequest" && status == "${s.value}"`)
                      .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                  ),
              ),
            ]),
        ),

      S.divider(),

      orderableDocumentListDeskItem({
        type: 'faqItem',
        id: 'orderable-faq',
        title: 'FAQ (drag to reorder)',
        icon: HelpCircleIcon,
        S,
        context,
      }),
      S.documentTypeListItem('legalPage').title('Terms & privacy').icon(DocumentTextIcon),

      S.divider(),

      S.listItem()
        .id('siteSettings')
        .title('Settings')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Settings'),
        ),
    ])
}
