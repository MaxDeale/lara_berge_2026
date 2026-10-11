import { artwork } from './artwork'
import { commissionRequest } from './commissionRequest'
import { faqItem, legalPage } from './content'
import { order } from './order'
import { siteSettings } from './siteSettings'

export const schemaTypes = [artwork, siteSettings, faqItem, legalPage, order, commissionRequest]

/** Types only the server creates, and the singleton: hidden from "Create new" */
export const SERVER_WRITTEN = ['order', 'commissionRequest'] as const
export const SINGLETONS = ['siteSettings'] as const
