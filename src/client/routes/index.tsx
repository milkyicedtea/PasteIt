import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box, Button, Container, Group, Select, Text, TextInput } from "@mantine/core"
import { useState } from "react"
import { getRecaptchaToken, isRecaptchaEnabled } from "@local/hooks/recaptcha"
import { Language, languageOptions, normalizeLanguage } from "@local/hooks/codeHighlitghting"
import { InfoIcon } from "@primer/octicons-react"
import CodeEditor from "@local/components/CodeEditor"

export const Route = createFileRoute('/')({ component: App })


const MAX_SIZE_MB = 1
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

async function readResponseMessage(response: Response) {
  const body = await response.text()

  if (!body) {
    return ''
  }

  try {
    const parsed = JSON.parse(body)
    return typeof parsed?.message === 'string' ? parsed.message : body
  } catch {
    return body
  }
}

function App() {
  const [name, setName] = useState<string | null>(null)
  const [pasteValue, setPasteValue] = useState<string>('')
  const [language, setLanguage] = useState<Language>(Language.Autodetect)
  const navigate = useNavigate()

  async function sendPaste() {
    try {
      const token = isRecaptchaEnabled() ? await getRecaptchaToken("SUBMIT_PASTE") : undefined

      const pasteSize = new Blob([pasteValue]).size
      if (pasteSize > MAX_SIZE_BYTES) {
        alert(`Your paste is too large (${MAX_SIZE_BYTES / 1024 / 1024}MB)\nMaximum size is ${MAX_SIZE_MB}MB`)
        return
      }

      const response = await fetch('/api/pastes/paste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            name: name,
            paste: pasteValue,
            language: language,
            recaptchaToken: token,
          }
        )
      })

      if (response.ok) {
        const data = await response.json() as { shortId?: string }
        if (!data.shortId) {
          alert('Missing shortId in server response')
          return
        }

        setPasteValue('')
        await navigate({ to: data.shortId })
        return
      }

      const responseMessage = await readResponseMessage(response)
      if (response.status === 429) {
        alert(responseMessage || 'You are sending too many pastes. Please try again later.')
        return
      }

      if (response.status === 403) {
        alert(responseMessage || "Failed to verify you're human. Please try again.")
        return
      }

      alert(responseMessage || 'An error occurred while submitting your paste.')
      return
    } catch (err) {
      console.error("Paste submission failed:", err)
      alert('An error occurred while submitting your paste.')
      return
    }
  }

  return (
    <Container
      className="flex flex-col mt-2"
    >
      <Select
        className="w-40 mb-2"
        data={languageOptions}
        value={language}
        placeholder="Select language"
        onChange={(value) => setLanguage(normalizeLanguage(value))}
      />

      <Box
        className="flex items-center gap-2 mb-2 p-4 bg-[rgba(84,174,255,0.1)] border-l-4 border-[#54aeff] self-start"
      >
        <InfoIcon fill="#54aeff"/>
        <Text>
          PasteIt snippets are currently limited to 1MB each, and users are rate limited to 5 snippets per day :)
        </Text>
      </Box>

      <CodeEditor
        value={pasteValue}
        language={language}
        onChange={(e) => setPasteValue(e)}
        height={"23.5rem"}
        placeholder="PasteIt here..."
        basicSetup={{
          rectangularSelection: true,
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          foldGutter: true,
          bracketMatching: true,
          indentOnInput: true
        }}
      />

      <Text className="mt-4">Paste Name:</Text>
      <Group className="w-full flex flex-row items-center mt-2 mb-2 gap-2">
        <TextInput
          className="w-32"
          value={name ? name : ""}
          placeholder={'New PasteIt..'}
          onChange={(e) => setName(e.target.value)}
        />

        <Button variant={'light'}
          onClick={() => sendPaste()}>
          PasteIt!
        </Button>

        <Button variant={'light'}
          onClick={() => setPasteValue('')}>
          Clear
        </Button>
      </Group>
    </Container>
  )
}
