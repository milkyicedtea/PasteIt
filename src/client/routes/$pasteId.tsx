import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Box, Button, Container, Group, Text } from "@mantine/core"
import CodeEditor from "@local/components/CodeEditor.tsx"
import { useEffect, useState } from "react"
import { getLanguageLabel, normalizeLanguage } from "@local/hooks/codeHighlitghting.ts"

export const Route = createFileRoute('/$pasteId')({
  component: RouteComponent,
})

interface PasteResponse {
  name: string
  paste: string
  language: string
  createdAt: Date
}

function RouteComponent() {
  const { pasteId } = Route.useParams()
  const [paste, setPaste] = useState<PasteResponse | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadPaste() {
      try {
        const response = await fetch(
          `/api/pastes/paste/${pasteId}`,
        )
        setPaste(await response.json())
      } catch (error) {
        console.error('Failed to load paste:', error)
      }
    }
    void loadPaste()
  }, [pasteId])

  return (
    <Container className="flex flex-col">
      {paste ? (
        <>
          <Group
            gap={0}
            className="flex flex-col! items-start! mt-2 mb-2"
          >
            <Text size="xl" fw={700} >
              Viewing Paste: {paste.name}
            </Text>

            <Text size="lg" fw={400}>
              Created on: {new Date(paste.createdAt).toLocaleString()}
            </Text>

            <Text size="lg" fw={400}>
              Marked as: {getLanguageLabel(paste.language, paste.paste)}
            </Text>
          </Group>


          <CodeEditor
            value={paste.paste}
            language={normalizeLanguage(paste.language)}
            height="min(28rem, 70vh)"
            editable={false}
          />

          <Button
            className="w-36! mt-3 mb-2"
            variant={'light'}
            fw={400}
            onClick={() => navigate({ to: "/" })}
          >
            Back to home
          </Button>
        </>
      ) : (
        <Box className="m-0 p-0 mt-8">
          <Text size="xl" fw={700}>Could not find paste with id {pasteId}</Text>
          <Button
            className={"w-36 mt-3"}
            variant={'light'}
            fw={400}
            onClick={() => navigate({ to: "/" })}
          >
            Back to home
          </Button>
        </Box>
      )}
    </Container>
  )
}
