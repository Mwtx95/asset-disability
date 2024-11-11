import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /reports!'
}
