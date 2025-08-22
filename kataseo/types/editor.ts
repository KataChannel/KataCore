export interface Block {
  id: string
  type: 'text' | 'image' | 'heading' | 'embed' | 'code'
  content?: string
  
  // For text blocks (rich text support)
  html?: string
  
  // For image blocks
  url?: string
  altText?: string
  mediaId?: string
  width?: number
  height?: number
  
  // For heading blocks
  level?: 1 | 2 | 3 | 4 | 5 | 6
  
  // For embed blocks  
  embedUrl?: string
  embedType?: 'youtube' | 'vimeo' | 'iframe'
  
  // For code blocks
  language?: string
  
  // Common metadata
  createdAt?: string
  updatedAt?: string
}

export interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  readOnly?: boolean
  showPreview?: boolean
}

export interface EditorContextType {
  blocks: Block[]
  setBlocks: (blocks: Block[]) => void
  selectedBlockId: string | null
  setSelectedBlockId: (id: string | null) => void
  addBlock: (type: Block['type'], index?: number) => void
  updateBlock: (id: string, updates: Partial<Block>) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
}

export const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'default-1',
    type: 'text',
    content: 'Start writing your content here...',
    html: '<p>Start writing your content here...</p>',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const BLOCK_TYPES = {
  text: {
    label: 'Text',
    description: 'Rich text paragraph',
    icon: 'Type'
  },
  heading: {
    label: 'Heading',
    description: 'Section heading (H1-H6)',
    icon: 'Heading1'
  },
  image: {
    label: 'Image',
    description: 'Upload or embed image',
    icon: 'Image'
  },
  embed: {
    label: 'Embed',
    description: 'YouTube, Vimeo, or iframe',
    icon: 'PlayCircle'
  },
  code: {
    label: 'Code',
    description: 'Code block with syntax highlighting',
    icon: 'Code'
  }
} as const
