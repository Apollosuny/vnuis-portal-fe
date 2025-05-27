'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { FormSwitch } from '@/components/ui/form-switch';

// Simple Separator component for visual division
const Separator = () => {
  return <hr className='my-6 border-t border-border' />;
};
import {
  User,
  Shield,
  Bell,
  PaintBucket,
  Lock,
  Link,
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Home,
  Calendar,
  BookOpen,
  Globe,
  ChevronRight,
} from 'lucide-react';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

// Mock user data
const userData = {
  id: 'ST-100289',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@virtuuni.edu',
  phone: '+1 (555) 123-4567',
  address: '123 University Ave, Campus City, State 12345',
  program: 'Computer Science',
  enrollmentYear: '2023',
  expectedGraduation: '2027',
  preferredLanguage: 'English',
  timezone: 'UTC-5 (Eastern Time)',
  profilePicture: '/assets/profile-default.jpg',
};

// Mock connected accounts
const connectedAccounts = [
  {
    service: 'Google',
    connected: true,
    email: 'alex.johnson@gmail.com',
    lastSync: '2 days ago',
  },
  {
    service: 'Microsoft',
    connected: true,
    email: 'alex.johnson@outlook.com',
    lastSync: '1 week ago',
  },
  {
    service: 'GitHub',
    connected: true,
    username: 'alexjohnson',
    lastSync: '3 days ago',
  },
  {
    service: 'LinkedIn',
    connected: false,
    username: '',
    lastSync: '',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <StudentDashboardLayout>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold'>Settings</h1>
          <Button variant='outline'>Reset to Defaults</Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsList className='grid grid-cols-6 gap-2'>
            <TabsTrigger value='personal' className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              <span className='hidden sm:inline'>Personal</span>
            </TabsTrigger>
            <TabsTrigger value='security' className='flex items-center gap-2'>
              <Shield className='h-4 w-4' />
              <span className='hidden sm:inline'>Security</span>
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='flex items-center gap-2'
            >
              <Bell className='h-4 w-4' />
              <span className='hidden sm:inline'>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value='display' className='flex items-center gap-2'>
              <PaintBucket className='h-4 w-4' />
              <span className='hidden sm:inline'>Display</span>
            </TabsTrigger>
            <TabsTrigger value='privacy' className='flex items-center gap-2'>
              <Lock className='h-4 w-4' />
              <span className='hidden sm:inline'>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value='connected' className='flex items-center gap-2'>
              <Link className='h-4 w-4' />
              <span className='hidden sm:inline'>Connected</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value='personal' className='space-y-4'>
            <Card>
              <CardHeader>
                <div className='flex flex-col md:flex-row md:items-center justify-between'>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and student information
                    </CardDescription>
                  </div>
                  <div className='mt-4 md:mt-0'>
                    <div className='flex items-center gap-3'>
                      <div className='h-16 w-16 rounded-full bg-gray-200 relative overflow-hidden'>
                        <img
                          src={userData.profilePicture}
                          alt='Profile'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <Button variant='outline' size='sm'>
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input id='firstName' defaultValue={userData.firstName} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input id='lastName' defaultValue={userData.lastName} />
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <Label htmlFor='email'>Email Address</Label>
                  </div>
                  <Input id='email' defaultValue={userData.email} />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <Label htmlFor='phone'>Phone Number</Label>
                  </div>
                  <Input id='phone' defaultValue={userData.phone} />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Home className='h-4 w-4 text-muted-foreground' />
                    <Label htmlFor='address'>Address</Label>
                  </div>
                  <Input id='address' defaultValue={userData.address} />
                </div>

                <Separator />

                <h3 className='text-lg font-medium'>Academic Information</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-4 rounded-lg border border-border'>
                    <div className='flex items-center gap-2 mb-2'>
                      <BookOpen className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        Program
                      </span>
                    </div>
                    <p className='font-medium'>{userData.program}</p>
                  </div>
                  <div className='p-4 rounded-lg border border-border'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        Enrollment Year
                      </span>
                    </div>
                    <p className='font-medium'>{userData.enrollmentYear}</p>
                  </div>
                  <div className='p-4 rounded-lg border border-border'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        Expected Graduation
                      </span>
                    </div>
                    <p className='font-medium'>{userData.expectedGraduation}</p>
                  </div>
                  <div className='p-4 rounded-lg border border-border'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Globe className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        Preferred Language
                      </span>
                    </div>
                    <p className='font-medium'>{userData.preferredLanguage}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='justify-end'>
                <Button className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value='security' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication options
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Change Password</h3>
                  <div className='space-y-2'>
                    <Label htmlFor='currentPassword'>Current Password</Label>
                    <div className='relative'>
                      <Input
                        id='currentPassword'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute right-2 top-1/2 transform -translate-y-1/2'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='newPassword'>New Password</Label>
                    <div className='relative'>
                      <Input
                        id='newPassword'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>
                      Confirm New Password
                    </Label>
                    <div className='relative'>
                      <Input
                        id='confirmPassword'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>
                    Two-Factor Authentication
                  </h3>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Mobile Authenticator App</p>
                      <p className='text-sm text-muted-foreground'>
                        Use an authentication app to generate one-time codes
                      </p>
                    </div>
                    <Button variant='outline'>Setup</Button>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>SMS Authentication</p>
                      <p className='text-sm text-muted-foreground'>
                        Receive verification codes via SMS text message
                      </p>
                    </div>
                    <Button variant='outline'>Setup</Button>
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>Session Management</h3>
                  <div className='rounded-lg border border-border p-4'>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <p className='font-medium'>Current Session</p>
                        <p className='text-sm text-muted-foreground'>
                          Chrome on Windows • IP: 192.168.1.xx
                        </p>
                      </div>
                      <span className='text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full'>
                        Active
                      </span>
                    </div>
                    <Button variant='destructive' size='sm'>
                      Sign out of all devices
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='justify-end space-x-2'>
                <Button variant='outline'>Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Preferences */}
          <TabsContent value='notifications' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Email Notifications</h3>
                    <div className='space-y-2'>
                      {[
                        { id: 'email-forms', label: 'Form status updates' },
                        {
                          id: 'email-rooms',
                          label: 'Room booking confirmations',
                        },
                        { id: 'email-events', label: 'Event reminders' },
                        {
                          id: 'email-announcements',
                          label: 'Campus announcements',
                        },
                        { id: 'email-grades', label: 'Grade postings' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center justify-between py-2'
                        >
                          <Label htmlFor={item.id} className='flex-grow'>
                            {item.label}
                          </Label>
                          <FormSwitch id={item.id} checked={true} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Push Notifications</h3>
                    <div className='space-y-2'>
                      {[
                        { id: 'push-forms', label: 'Form status updates' },
                        {
                          id: 'push-rooms',
                          label: 'Room booking confirmations',
                        },
                        { id: 'push-events', label: 'Event reminders' },
                        {
                          id: 'push-announcements',
                          label: 'Campus announcements',
                        },
                        { id: 'push-grades', label: 'Grade postings' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center justify-between py-2'
                        >
                          <Label htmlFor={item.id} className='flex-grow'>
                            {item.label}
                          </Label>
                          <FormSwitch id={item.id} checked={true} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>SMS Notifications</h3>
                    <div className='space-y-2'>
                      {[
                        { id: 'sms-forms', label: 'Form status updates' },
                        {
                          id: 'sms-rooms',
                          label: 'Room booking confirmations',
                        },
                        { id: 'sms-events', label: 'Event reminders' },
                        {
                          id: 'sms-announcements',
                          label: 'Campus announcements',
                        },
                        { id: 'sms-emergency', label: 'Emergency alerts' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center justify-between py-2'
                        >
                          <Label htmlFor={item.id} className='flex-grow'>
                            {item.label}
                          </Label>
                          <FormSwitch
                            id={item.id}
                            checked={item.id === 'sms-emergency'}
                          />
                        </div>
                      ))}
                    </div>
                    <div className='mt-2 text-sm text-muted-foreground'>
                      SMS notifications may incur carrier charges. Only
                      emergency alerts are enabled by default.
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='justify-end'>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Display Preferences */}
          <TabsContent value='display' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Theme</h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <div className='border border-border rounded-lg p-4 cursor-pointer relative'>
                        <div className='h-20 bg-background rounded'></div>
                        <p className='mt-2 text-center'>Light</p>
                        <div className='absolute top-2 right-2 h-3 w-3 bg-primary rounded-full'></div>
                      </div>
                      <div className='border border-border rounded-lg p-4 cursor-pointer'>
                        <div className='h-20 bg-gray-900 rounded'></div>
                        <p className='mt-2 text-center'>Dark</p>
                      </div>
                      <div className='border border-border rounded-lg p-4 cursor-pointer'>
                        <div className='h-20 bg-gradient-to-b from-background to-gray-900 rounded'></div>
                        <p className='mt-2 text-center'>System</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Accessibility</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Reduce Motion</p>
                          <p className='text-sm text-muted-foreground'>
                            Limit animations and transitions
                          </p>
                        </div>
                        <FormSwitch id='reduce-motion' />
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>High Contrast</p>
                          <p className='text-sm text-muted-foreground'>
                            Increase color contrast for better readability
                          </p>
                        </div>
                        <FormSwitch id='high-contrast' />
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Larger Text</p>
                          <p className='text-sm text-muted-foreground'>
                            Increase text size throughout the application
                          </p>
                        </div>
                        <FormSwitch id='larger-text' />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Dashboard Layout</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='border border-border rounded-lg p-4 cursor-pointer relative'>
                        <div className='h-24 flex flex-col gap-2'>
                          <div className='h-4 w-full bg-gray-200 rounded'></div>
                          <div className='grid grid-cols-3 gap-2 flex-grow'>
                            <div className='bg-gray-200 rounded'></div>
                            <div className='bg-gray-200 rounded col-span-2'></div>
                          </div>
                        </div>
                        <p className='mt-2 text-center'>Default</p>
                        <div className='absolute top-2 right-2 h-3 w-3 bg-primary rounded-full'></div>
                      </div>
                      <div className='border border-border rounded-lg p-4 cursor-pointer'>
                        <div className='h-24 flex gap-2'>
                          <div className='h-full w-1/4 bg-gray-200 rounded'></div>
                          <div className='h-full w-3/4 bg-gray-200 rounded'></div>
                        </div>
                        <p className='mt-2 text-center'>Compact</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='justify-end'>
                <Button>Apply Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value='privacy' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy preferences and data sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>
                      Directory Visibility
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Student Directory</p>
                          <p className='text-sm text-muted-foreground'>
                            Allow other students to find you in campus directory
                          </p>
                        </div>
                        <FormSwitch id='directory-visibility' checked={true} />
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>
                            Share Contact Information
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            Allow your email and phone to be visible to other
                            students
                          </p>
                        </div>
                        <FormSwitch id='share-contact' checked={false} />
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Show Enrollment Status</p>
                          <p className='text-sm text-muted-foreground'>
                            Display your program and year in public profile
                          </p>
                        </div>
                        <FormSwitch id='show-enrollment' checked={true} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Data Collection</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Usage Analytics</p>
                          <p className='text-sm text-muted-foreground'>
                            Allow collection of anonymized usage data to improve
                            services
                          </p>
                        </div>
                        <FormSwitch id='usage-analytics' checked={true} />
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>Personalized Content</p>
                          <p className='text-sm text-muted-foreground'>
                            Allow customization of content based on your
                            activities
                          </p>
                        </div>
                        <FormSwitch id='personalized-content' checked={true} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Data Management</h3>
                    <div className='space-y-2'>
                      <div className='p-4 border border-border rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-medium'>Export Your Data</p>
                            <p className='text-sm text-muted-foreground'>
                              Download a copy of all your personal data
                            </p>
                          </div>
                          <Button variant='outline' size='sm'>
                            Request Export
                          </Button>
                        </div>
                      </div>
                      <div className='p-4 border border-border rounded-lg'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-medium text-destructive'>
                              Delete Account Data
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              Request deletion of non-academic personal data
                            </p>
                          </div>
                          <Button variant='destructive' size='sm'>
                            Request Deletion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='justify-end'>
                <Button>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Connected Accounts */}
          <TabsContent value='connected' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your connected services and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {connectedAccounts.map((account, index) => (
                    <div
                      key={account.service}
                      className='flex items-center justify-between p-4 border border-border rounded-lg'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                          {account.service.charAt(0)}
                        </div>
                        <div>
                          <p className='font-medium'>{account.service}</p>
                          {account.connected ? (
                            <p className='text-sm text-muted-foreground'>
                              {account.email || account.username} • Last sync:{' '}
                              {account.lastSync}
                            </p>
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              Not connected
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant={account.connected ? 'outline' : 'default'}
                        className={
                          account.connected
                            ? 'text-destructive hover:text-destructive'
                            : ''
                        }
                      >
                        {account.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  ))}

                  <div className='pt-4'>
                    <Button
                      variant='outline'
                      className='w-full flex items-center justify-center gap-2'
                    >
                      <span>Connect New Service</span>
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='pt-2 text-sm text-muted-foreground'>
                    Connecting services allows for automatic data sharing and
                    single sign-on capabilities. Review each service's privacy
                    policy before connecting.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentDashboardLayout>
  );
}
