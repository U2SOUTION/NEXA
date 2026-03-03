import { mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Audio from '@tiptap/extension-audio'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import YouTube from '@tiptap/extension-youtube'
import { Video } from '@engines/tiptap/extensions/Video'

export interface BaseExtensionsOptions {
  inlineImage?: boolean
  allowBase64Image?: boolean
  youtubeOptions?: { controls?: boolean; nocookie?: boolean }
}

/**
 * base 스킨 — Tiptap 확장팩 구성
 * - 도메인 비의존
 * - 필요 시 options로 오버라이드 가능
 */
export function createBaseExtensions(options: BaseExtensionsOptions = {}) {
  const { inlineImage = true, allowBase64Image = true, youtubeOptions = { controls: true, nocookie: false } } = options

  return [
    StarterKit.configure({
      link: false, // Link는 별도 확장 사용
      underline: false, // Underline 별도 확장
    }),
    Underline,
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          'data-original-filename': {
            default: null,
            parseHTML: (element) => element.getAttribute('data-original-filename'),
            renderHTML: (attributes) => {
              if (!attributes['data-original-filename']) return {}
              return { 'data-original-filename': attributes['data-original-filename'] }
            },
          },
          textAlign: {
            default: 'center',
            parseHTML: (element) => element.parentElement?.style?.textAlign || 'center',
            renderHTML: () => ({}),
          },
        }
      },
      renderHTML({ node, HTMLAttributes }) {
        const align = node.attrs.textAlign || 'center'
        const imgAttrs = { ...HTMLAttributes }
        delete imgAttrs.textAlign
        return [
          'span',
          { style: `display: block; text-align: ${align}` },
          ['img', mergeAttributes(this.options.HTMLAttributes, imgAttrs)],
        ]
      },
    }).configure({
      inline: inlineImage,
      allowBase64: allowBase64Image,
    }),
    Audio.configure({
      allowBase64: true,
      controls: true,
      inline: false,
    }),
    Video.configure({
      allowBase64: true,
      controls: true,
      inline: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph', 'image'],
    }),
    TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
    FontFamily.configure({
      types: ['textStyle'],
    }),
    Subscript,
    Superscript,
    YouTube.configure(youtubeOptions),
  ]
}

export default createBaseExtensions
