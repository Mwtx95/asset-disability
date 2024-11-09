import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/assets')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /assets!'
}
