import { Box, Text } from "@mantine/core"
import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <Box className="flex items-center h-full">
      <Text component={Link} to={'/'}>© 2025 051205.xyz</Text>
    </Box>
  )
}
