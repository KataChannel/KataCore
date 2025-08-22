export interface Block {
  id: string
  type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'code' | 'divider'
  content: any
  metadata?: {
    level?: number // for headings
    style?: string
    alignment?: 'left' | 'center' | 'right'
    alt?: string // for images
    caption?: string
  }
}

export interface BlockEditorState {
  blocks: Block[]
  selectedBlockId: string | null
  isDragging: boolean
  focusedBlockId: string | null
}

export interface BlockEditorActions {
  addBlock: (type: Block['type'], index?: number) => void
  updateBlock: (id: string, content: any, metadata?: Block['metadata']) => void
  deleteBlock: (id: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  selectBlock: (id: string) => void
  focusBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  clearSelection: () => void
}

export interface BlockEditorProps {
  initialBlocks?: Block[]
  onChange?: (blocks: Block[]) => void
  onSave?: (blocks: Block[]) => void
  readonly?: boolean
  className?: string
}

export interface EditorContextType {
  state: BlockEditorState
  actions: BlockEditorActions
  config: {
    allowedBlocks: Block['type'][]
    maxBlocks?: number
    enableDragDrop: boolean
    enableKeyboardShortcuts: boolean
  }
}

export interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaFile) => void
  multiple?: boolean
  accept?: string[]
}

// Media file interface for media library
export interface MediaFile {
  id: string
  url: string
  filename: string
  originalName: string
  type: string
  size: number
  altText?: string
  caption?: string
  uploadedAt: string
  tags: string[]
}

export const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'initial',
    type: 'paragraph',
    content: { text: 'Start writing your content...' }
  }
]

export const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph' as const,
  HEADING: 'heading' as const,
  IMAGE: 'image' as const,
  QUOTE: 'quote' as const,
  LIST: 'list' as const,
  CODE: 'code' as const,
  DIVIDER: 'divider' as const
}

export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const

export interface BlockComponentProps {
  block: Block
  isSelected: boolean
  isFocused: boolean
  onUpdate: (content: any, metadata?: Block['metadata']) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  readonly?: boolean
}
