/**
 * Tiptap Video 노드 — HTML5 <video> 요소 지원
 * 로컬/URL 비디오 파일(mp4, webm 등) 임베드
 */
import { mergeAttributes, Node } from '@tiptap/core'

export interface VideoOptions {
  allowBase64?: boolean
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'auto' | 'metadata' | 'none' | null
  HTMLAttributes?: Record<string, unknown>
  inline?: boolean
}

export interface SetVideoOptions {
  src: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'auto' | 'metadata' | 'none' | null
  width?: number
  height?: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: SetVideoOptions) => ReturnType
    }
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

  addOptions() {
    return {
      allowBase64: true,
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      preload: 'metadata',
      HTMLAttributes: {},
      inline: false,
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: this.options.controls },
      autoplay: { default: this.options.autoplay },
      loop: { default: this.options.loop },
      muted: { default: this.options.muted },
      preload: { default: this.options.preload },
      width: { default: null },
      height: { default: null },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'video[src]' : 'video[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const merged = mergeAttributes(
      this.options.HTMLAttributes,
      {
        controls: this.options.controls,
        autoplay: this.options.autoplay,
        loop: this.options.loop,
        muted: this.options.muted,
        preload: this.options.preload,
      },
      HTMLAttributes
    )
    const attrs = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== null && v !== undefined && v !== false)
    )
    return ['video', attrs]
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
