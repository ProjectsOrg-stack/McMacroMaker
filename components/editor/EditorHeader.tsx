'use client'

interface EditorHeaderProps {
  title: string
  description: string
  onTitleChange: (v: string) => void
  onDescriptionChange: (v: string) => void
}

export function EditorHeader({ title, description, onTitleChange, onDescriptionChange }: EditorHeaderProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="macro-title" className="block text-sm font-medium text-muted mb-1">
          Title
        </label>
        <input
          id="macro-title"
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="My Macro"
          aria-label="Macro title"
          className="input-field w-full"
        />
      </div>
      <div>
        <label htmlFor="macro-desc" className="block text-sm font-medium text-muted mb-1">
          Description
        </label>
        <input
          id="macro-desc"
          type="text"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder="What does this macro do?"
          aria-label="Macro description"
          className="input-field w-full"
        />
      </div>
    </div>
  )
}
