import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function NotificationSettings() {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>Inventory Alerts</h3>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label>Low Inventory Warning</Label>
            <div className='text-sm text-muted-foreground'>
              Notify when items are below threshold
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <Input type='number' className='w-20' placeholder='5' min='0' />
            <Switch />
          </div>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>Notification Frequency</h3>
        <div className='grid gap-4'>
          <div className='flex items-center justify-between'>
            <Label>Email Digest Frequency</Label>
            <Select defaultValue='daily'>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select frequency' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='daily'>Daily</SelectItem>
                <SelectItem value='weekly'>Weekly</SelectItem>
                <SelectItem value='monthly'>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>Notification Channels</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Email Notifications</Label>
              <div className='text-sm text-muted-foreground'>
                Receive notifications via email
              </div>
            </div>
            <Switch />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>In-App Notifications</Label>
              <div className='text-sm text-muted-foreground'>
                Receive notifications within the application
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}
