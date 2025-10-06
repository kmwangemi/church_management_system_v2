'use client';

import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { IOrganizationWithMetadata } from '@/lib/types/organization';
import { Building2, Edit, MapPin, Upload } from 'lucide-react';
import { useState } from 'react';

interface EditChurchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church: IOrganizationWithMetadata | null;
  onSave: (church: IOrganizationWithMetadata) => void;
}

export function EditChurchDialog({
  open,
  onOpenChange,
  church,
  onSave,
}: EditChurchDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: church?.name || '',
    denomination: church?.denomination || '',
    pastor: church?.pastor || '',
    email: church?.email || '',
    phone: church?.phone || '',
    website: church?.website || '',
    address: church?.address || '',
    status: church?.status || 'active',
    plan: church?.plan || 'standard',
    established: church?.established || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (church) {
        onSave({
          ...church,
          ...formData,
        });
      }

      alert('Church updated successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating church:', error);
      alert('Failed to update church. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!church) return null;

  const denominations = [
    'Baptist',
    'Methodist',
    'Presbyterian',
    'Pentecostal',
    'Lutheran',
    'Episcopal',
    'Catholic',
    'Non-denominational',
    'Assembly of God',
    'Church of Christ',
    'Other',
  ];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Church
          </DialogTitle>
          <DialogDescription>
            Update church information and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs onValueChange={setCurrentTab} value={currentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Basic Church Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4 flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" />
                      <AvatarFallback className="bg-blue-100 text-2xl text-blue-600">
                        {formData.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button size="sm" type="button" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Logo
                      </Button>
                      <p className="mt-1 text-gray-500 text-xs">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-medium text-sm">
                        Church Name *
                      </label>
                      <Input
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Grace Community Church"
                        required
                        value={formData.name}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">
                        Denomination *
                      </label>
                      <Select
                        onValueChange={(value) =>
                          handleChange('denomination', value)
                        }
                        value={formData.denomination}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select denomination" />
                        </SelectTrigger>
                        <SelectContent>
                          {denominations.map((denomination) => (
                            <SelectItem
                              key={denomination}
                              value={denomination.toLowerCase()}
                            >
                              {denomination}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-medium text-sm">
                        Lead Pastor *
                      </label>
                      <Input
                        onChange={(e) => handleChange('pastor', e.target.value)}
                        placeholder="Rev. John Smith"
                        required
                        value={formData.pastor}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">
                        Established Date *
                      </label>
                      <Input
                        onChange={(e) =>
                          handleChange('established', e.target.value)
                        }
                        required
                        type="date"
                        value={formData.established}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-medium text-sm">
                        Church Email *
                      </label>
                      <Input
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="info@church.com"
                        required
                        type="email"
                        value={formData.email}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">
                        Phone Number *
                      </label>
                      <Input
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                        value={formData.phone}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-sm">Website</label>
                    <Input
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="www.church.com"
                      value={formData.website}
                    />
                  </div>

                  <div>
                    <label className="font-medium text-sm">
                      Full Address *
                    </label>
                    <Textarea
                      className="min-h-[80px]"
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="123 Faith Street, Springfield, IL 62701"
                      required
                      value={formData.address}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Church Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-medium text-sm">Status</label>
                      <Select
                        onValueChange={(value) => handleChange('status', value)}
                        value={formData.status}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-medium text-sm">
                        Total Branches
                      </label>
                      <Input
                        className="bg-gray-50"
                        disabled
                        type="number"
                        value={church.branches}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-sm">Total Members</label>
                    <Input
                      className="bg-gray-50"
                      disabled
                      type="number"
                      value={church.members}
                    />
                    <p className="mt-1 text-gray-500 text-xs">
                      This value is automatically calculated
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h4 className="mb-2 font-medium text-amber-900">
                      Important Settings
                    </h4>
                    <p className="text-amber-700 text-sm">
                      Changing the church status may affect access to the system
                      for all users associated with this church. Please proceed
                      with caution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="space-y-6" value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="font-medium text-sm">Current Plan</label>
                    <Select
                      onValueChange={(value) => handleChange('plan', value)}
                      value={formData.plan}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - $29/month</SelectItem>
                        <SelectItem value="standard">
                          Standard - $79/month
                        </SelectItem>
                        <SelectItem value="premium">
                          Premium - $149/month
                        </SelectItem>
                        <SelectItem value="enterprise">
                          Enterprise - Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="font-medium text-sm">
                        Monthly Revenue
                      </label>
                      <Input
                        className="bg-gray-50"
                        disabled
                        type="number"
                        value={church.revenue}
                      />
                    </div>
                    <div>
                      <label className="font-medium text-sm">Growth Rate</label>
                      <Input
                        className="bg-gray-50"
                        disabled
                        value={`${church.growth}%`}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium text-blue-900">
                      Plan Change Notice
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Changing the subscription plan will take effect
                      immediately. The church will be charged the prorated
                      amount for the remainder of the billing cycle.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-between border-t pt-6">
            <Button
              disabled={currentTab === 'basic'}
              onClick={() => {
                const tabs = ['basic', 'contact', 'settings', 'subscription'];
                const currentIndex = tabs.indexOf(currentTab);
                if (currentIndex > 0) {
                  setCurrentTab(tabs[currentIndex - 1]);
                }
              }}
              type="button"
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              {currentTab !== 'subscription' ? (
                <Button
                  onClick={() => {
                    const tabs = [
                      'basic',
                      'contact',
                      'settings',
                      'subscription',
                    ];
                    const currentIndex = tabs.indexOf(currentTab);
                    if (currentIndex < tabs.length - 1) {
                      setCurrentTab(tabs[currentIndex + 1]);
                    }
                  }}
                  type="button"
                >
                  Next
                </Button>
              ) : (
                <Button disabled={isLoading} type="submit">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
