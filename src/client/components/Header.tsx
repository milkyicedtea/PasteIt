import { ActionIcon, Container, Text, useMantineColorScheme } from "@mantine/core"
import { MoonIcon, SunIcon } from "@primer/octicons-react"
import { Link } from "@tanstack/react-router"

export function Header() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <>
      <Container
        className="relative h-full px-4"
        fluid
      >
        <Text
          className="absolute text-[2rem]! left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          component={Link}
          to={'/'}
          gradient={{ from: 'orange', to: 'grape', deg: 90 }} variant={'gradient'}
          fw={400}
        >
          PasteIt
        </Text>

        <ActionIcon
          className={"absolute! right-4 top-1/2 -translate-y-1/2 rounded-md"}
          variant="outline"
          size="lg"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setColorScheme(isDark ? "light" : "dark")}
          // style={{
          //   position: "absolute",
          //   right: "1rem",
          //   top: "50%",
          //   transform: "translateY(-50%)",
          // }}
        >
          {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </ActionIcon>
      </Container>
    </>
  )
}