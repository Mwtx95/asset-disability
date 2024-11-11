import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronRight } from 'lucide-react'

interface Registration {
  id: number
  firstName: string
  middleName: string
  lastName: string
  status: string
}

const registrations: Registration[] = [
  {
    id: 1,
    firstName: 'Self',
    middleName: 'Mwita',
    lastName: 'Mgeni',
    status: 'DECLARATION',
  },
  // ... add more sample data
]

export const Route = createFileRoute('/_app/registration')({
  component: RegistrationPage,
})

function RegistrationPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Registration</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          CREATE REGISTRATION
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S/N</TableHead>
              <TableHead>FIRST NAME</TableHead>
              <TableHead>MIDDLE NAME</TableHead>
              <TableHead>LAST NAME</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>{reg.id}</TableCell>
                <TableCell>{reg.firstName}</TableCell>
                <TableCell>{reg.middleName}</TableCell>
                <TableCell>{reg.lastName}</TableCell>
                <TableCell>{reg.status}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
