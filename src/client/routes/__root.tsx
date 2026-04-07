import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppShell, MantineProvider } from "@mantine/core"
import { Header } from "@local/components/Header.tsx"
import { Footer } from "@local/components/Footer.tsx"
import { theme } from "@local/theme.ts"
import type { ReactNode } from "react"
import '@local/styles.css'

const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '').trim()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'PasteIt - A lightweight pastebin-like website'
      },
      {
        title: 'PasteIt'
      }
    ],

    links: [{
      rel: "icon",
      href: "/clipboard.svg"
    }],

    scripts: recaptchaSiteKey
      ? [{
        src: `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`,
      }]
      : []
  }),

  shellComponent: RootComponent,
})

function RootComponent({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadContent />
        <MantineProvider theme={theme} defaultColorScheme="light">
            <AppShell
              header={{ height: 56 }}
              footer={{ height: 48 }}
            >

              <AppShell.Header>
                <Header />
              </AppShell.Header>

              <AppShell.Main>
                {children}
              </AppShell.Main>

              <AppShell.Footer px={'lg'}>
                <Footer />
              </AppShell.Footer>
            </AppShell>
        </MantineProvider>
      <Scripts />
    </>
  )
}
