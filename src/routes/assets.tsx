import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  lastUpdated: string;
  assignedTo: string;
}

export const Route = createFileRoute("/assets")({
  component: AssetsRoute,
});

function AssetsRoute() {
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () => {
      // Replace with your actual API call
      return [
        {
          id: "1",
          name: "Wheelchair Type A",
          type: "Equipment",
          location: "Main Office - Floor 1",
          status: "ACTIVE",
          lastUpdated: "11/10/2024",
          assignedTo: "Jane Smith",
        },
        // Add more mock data as needed
      ];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets?.map((asset) => (
            <Card key={asset.id} className="hover:bg-accent/50 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="font-semibold">{asset.name}</div>
                <Badge
                  variant={
                    asset.status === "ACTIVE"
                      ? "success"
                      : asset.status === "MAINTENANCE"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {asset.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{asset.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{asset.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned To</span>
                    <span>{asset.assignedTo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
