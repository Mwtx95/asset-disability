import { CategoriesSettings } from '@/components/settings/categories-settings';
import { EmailSettings } from '@/components/settings/email-settings';
import { LocationSettings } from '@/components/settings/location-settings';
import { LocationSettingsForm } from '@/components/settings/location-settings-form';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { VendorsSettings } from '@/components/settings/vendors-settings';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import * as React from 'react';

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [selectedTab, setSelectedTab] = React.useState<string>('locations');

  return (
    <div className='container mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your application preferences and configurations.
        </p>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='locations'>Locations</TabsTrigger>
          <TabsTrigger value='vendors'>Vendors</TabsTrigger>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='email'>Email</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value='categories'>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage asset categories and their properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='locations'>
          <Card>
            <CardHeader>
              <div className='flex justify-between'>
                <div>
                  <CardTitle>Locations</CardTitle>
                  <CardDescription>
                    Manage asset locations within your facilities.
                  </CardDescription>
                </div>
                <div className=''>
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusIcon className='mr-2 h-4 w-4' /> Add Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Location</DialogTitle>
                      </DialogHeader>
                      <LocationSettingsForm setIsOpen={setIsOpen} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LocationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='vendors'>
          <Card>
            <CardHeader>
              <CardTitle>Service Providers & Vendors</CardTitle>
              <CardDescription>
                Manage your service providers and vendor information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorsSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='email'>
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Manage email recipients and notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
