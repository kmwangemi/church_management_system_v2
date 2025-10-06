'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { IOrganizationWithMetadata } from '@/lib/types/organization';
import {
  Activity,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';

interface ViewChurchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church: IOrganizationWithMetadata | null;
}

export function ViewChurchDetailsDialog({
  open,
  onOpenChange,
  church,
}: ViewChurchDetailsDialogProps) {
  if (!church) return null;
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case 'standard':
        return <Badge className="bg-blue-100 text-blue-800">Standard</Badge>;
      case 'basic':
        return <Badge className="bg-gray-100 text-gray-800">Basic</Badge>;
      default:
        return <Badge variant="secondary">{plan}</Badge>;
    }
  };
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Church Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {church.name}
          </DialogDescription>
        </DialogHeader>
        <Tabs className="w-full" defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          <TabsContent className="space-y-4" value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Church Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="bg-blue-100 text-2xl text-blue-600">
                      {church.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-bold text-2xl">{church.name}</h3>
                    <p className="text-muted-foreground">
                      {church?.metadata?.denomination}
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(church?.metadata?.status)}
                      {getPlanBadge(church?.metadata?.subscriptionPlan)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Lead Pastor
                    </label>
                    <p className="font-semibold text-sm">{church.pastor}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Established
                    </label>
                    <p className="text-sm">{church.established}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Last Activity
                    </label>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <p className="text-sm">{church.lastActivity}</p>
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Total Branches
                    </label>
                    <p className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4" />
                      {church.branches}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500 text-sm">
                    Address
                  </label>
                  <div className="mt-1 flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                    <p className="text-sm">{church.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent className="space-y-4" value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Email Address
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        className="text-blue-600 text-sm hover:underline"
                        href={`mailto:${church.email}`}
                      >
                        {church.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Phone Number
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        className="text-blue-600 text-sm hover:underline"
                        href={`tel:${church.phone}`}
                      >
                        {church.phone}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Website
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        className="text-blue-600 text-sm hover:underline"
                        href={`https://${church.website}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {church.website}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent className="space-y-4" value="statistics">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">
                    {church.members.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Active congregation members
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Growth Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-green-600">
                    +{church.growth}%
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Year over year growth
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">
                    ${church.revenue.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Subscription revenue
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    Total Branches
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{church.branches}</div>
                  <p className="text-muted-foreground text-xs">
                    Active church locations
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Average Attendance
                    </span>
                    <span className="text-muted-foreground text-sm">85%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-sm">Active Users</span>
                    <span className="text-muted-foreground text-sm">92%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: '92%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Online Engagement
                    </span>
                    <span className="text-muted-foreground text-sm">78%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent className="space-y-4" value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Current Plan
                    </label>
                    <div className="mt-1">{getPlanBadge(church.plan)}</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500 text-sm">
                      Monthly Cost
                    </label>
                    <p className="font-bold text-green-600 text-lg">
                      ${church.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-500 text-sm">
                    Billing Cycle
                  </label>
                  <p className="text-sm">Monthly - Auto-renewal enabled</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500 text-sm">
                    Next Billing Date
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      {new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-3 font-medium">Plan Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      {church.plan === 'premium'
                        ? 'Unlimited members'
                        : church.plan === 'standard'
                          ? 'Up to 500 members'
                          : 'Up to 100 members'}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Multiple branches support
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Priority support
                    </li>
                  </ul>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-transparent"
                    size="sm"
                    variant="outline"
                  >
                    Change Plan
                  </Button>
                  <Button
                    className="flex-1 bg-transparent"
                    size="sm"
                    variant="outline"
                  >
                    View Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
          <Button>Edit Church</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
