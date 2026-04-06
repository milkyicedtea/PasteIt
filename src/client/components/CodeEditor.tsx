import { EditorView } from "@codemirror/view"
import ReactCodeMirror from "@uiw/react-codemirror"
import { Language, getLanguageExtension } from "@local/hooks/codeHighlitghting.ts"
import { useComputedColorScheme } from "@mantine/core"
import { useEffect, useState } from "react"
import type { BasicSetupOptions, Extension } from "@uiw/react-codemirror"

interface Props {
  value: string
  onChange?: (value: string) => void
  language: Language | string
  editable?: boolean
  height?: string
  placeholder?: string
  basicSetup?: boolean | BasicSetupOptions | undefined
}

function CodeEditor({ value, onChange, editable = true, language, height, placeholder, basicSetup }: Props) {
  const colorScheme = useComputedColorScheme()
  const [extension, setExtension] = useState<Extension>([])
  const detectionContent = language === Language.Autodetect ? value : ""
  
  useEffect(() => {
    let cancelled = false

    async function loadExtension() {
      const ext = await getLanguageExtension(language, detectionContent)
      if (!cancelled) {
        setExtension(ext)
      }
    }

    void loadExtension()

    return () => {
      cancelled = true
    }
  }, [language, detectionContent])

  return (
    <ReactCodeMirror
      className="pasteit-editor"
      value={value}
      onChange={onChange}
      height={height}
      editable={editable}
      basicSetup={basicSetup}
      placeholder={placeholder}
      theme={colorScheme}
      extensions={[
        EditorView.lineWrapping,
        ...(Array.isArray(extension) ? extension : [extension])
      ]}
    />
  )
}

export default CodeEditor
