import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /notifications!'
}
