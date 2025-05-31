import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LogIn } from 'lucide-react';
import useAuthStore from '@/stores/auth';
import { toast } from 'sonner';

const FALLBACK = '/dashboard';

const loginFormSchema = z.object({
  username: z.string().min(1, 'Please enter your username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const Route = createFileRoute('/_auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { login } = useAuthStore();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.username, values.password);
      await router.invalidate();
      navigate({ to: search.redirect || FALLBACK });
      toast.success('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100'>
      <div className='w-full max-w-md p-4 space-y-4'>
        {/* Organization Header */}
        <div className='text-center space-y-4 mb-6'>
          <div className='flex justify-center'>
            <div className='bg-white p-3 rounded-full shadow-lg border-2 border-green-200'>
              <img 
                src="/img/dda.png" 
                alt="ZNDC Logo" 
                className='h-20 w-20 object-contain'
              />
            </div>
          </div>
          <div className='space-y-1'>
            <h1 className='text-lg font-bold text-green-800 uppercase tracking-wide'>
              ZANZIBAR NATIONAL DISABILITY COUNCIL
            </h1>
            <p className='text-sm text-green-600 font-medium'>
              Asset Management System
            </p>
          </div>
        </div>

        <Card className='border-green-200 shadow-xl bg-white/95 backdrop-blur-sm'>
          <CardHeader className='space-y-2'>
            <CardTitle className='text-2xl font-bold text-center text-green-800'>
              Welcome Back
            </CardTitle>
            <CardDescription className='text-center text-green-600'>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-green-700'>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your username'
                          type='text'
                          className='border-green-200 focus:border-green-500 focus:ring-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-green-700'>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter your password'
                          type='password'
                          className='border-green-200 focus:border-green-500 focus:ring-green-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full bg-green-600 hover:bg-green-700 text-white'>
                  <LogIn className='mr-2' />
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
