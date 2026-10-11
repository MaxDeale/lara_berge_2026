import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'
import { FAQ_SECTIONS } from '../constants'
import { simpleBlockContent } from './fields'

export { FAQ_SECTIONS }

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ question',
  type: 'document',
  icon: HelpCircleIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    simpleBlockContent({ name: 'answer', title: 'Answer' }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      options: { list: [...FAQ_SECTIONS], layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showOn',
      title: 'Show on',
      type: 'string',
      options: {
        list: [
          { title: 'FAQ page', value: 'faq' },
          { title: 'Commissions page ("Good to know")', value: 'commissions' },
          { title: 'Both', value: 'both' },
        ],
        layout: 'radio',
      },
      initialValue: 'faq',
      validation: (rule) => rule.required(),
    }),
    orderRankField({ type: 'faqItem' }),
  ],
  preview: {
    select: { title: 'question', section: 'section' },
    prepare: ({ title, section }) => ({
      title,
      subtitle: FAQ_SECTIONS.find((s) => s.value === section)?.title,
    }),
  },
})

export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      description: 'terms or privacy',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    simpleBlockContent({ name: 'body', title: 'Text' }),
  ],
})
