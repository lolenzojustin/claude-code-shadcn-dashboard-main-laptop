import type { ImportedTheme } from './theme-customizer'

export interface ThemeTabProps {
  selectedTheme: string
  setSelectedTheme: (theme: string) => void
  selectedTweakcnTheme: string
  setSelectedTweakcnTheme: (theme: string) => void
  selectedRadius: string
  setSelectedRadius: (radius: string) => void
  importedTheme: ImportedTheme | null
  setImportedTheme: (theme: ImportedTheme | null) => void
  onImportClick: () => void
}
