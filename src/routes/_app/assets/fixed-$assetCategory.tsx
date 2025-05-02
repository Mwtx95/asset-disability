import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/assets/fixed-$assetCategory')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /_app/assets/fixed-$assetCategory!'
}
