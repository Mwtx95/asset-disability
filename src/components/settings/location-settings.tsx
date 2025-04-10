import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type Location,
  locationQueryOptions,
  useBlockLocation,
} from "@/queries/locations";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LockIcon, PencilIcon, UnlockIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { LocationSettingsForm } from "./location-settings-form";
export function LocationSettings() {
  const { data: locations = [] } = useSuspenseQuery(locationQueryOptions);
  const blockLocation = useBlockLocation();
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Parent Location</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-20">Status</TableHead>
            <TableHead className="w-28 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell>{location.name}</TableCell>
              <TableCell className="capitalize">{location.type}</TableCell>
              <TableCell>{location.parentLocation}</TableCell>
              <TableCell>{location.description || "No description"}</TableCell>
              <TableCell className="w-20">
                <Badge
                  variant={location.is_blocked ? "destructive" : "default"}
                >
                  {location.is_blocked ? "Blocked" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="w-28 flex justify-around">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-sky-200"
                  onClick={() => {
                    setEditingLocation(location);
                    setIsDialogOpen(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hover:bg-red-300",
                    location.is_blocked && "text-red-500 hover:text-red-700"
                  )}
                  onClick={() => blockLocation.mutate(location.id)}
                >
                  {location.is_blocked ? (
                    <LockIcon className="h-4 w-4" />
                  ) : (
                    <UnlockIcon className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Add New Location"}
            </DialogTitle>
          </DialogHeader>
          <LocationSettingsForm
            setIsOpen={setIsDialogOpen}
            editingLocation={editingLocation}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
