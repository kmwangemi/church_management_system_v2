"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Globe,
  Shield,
  Mail,
  Database,
  Server,
  CreditCard,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

export default function GlobalSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleSave = async () => {
    setIsLoading(true)
    setSaveStatus("saving")

    // Simulate API call
    setTimeout(() => {
      setSaveStatus("saved")
      setIsLoading(false)
      setTimeout(() => setSaveStatus("idle"), 3000)
    }, 2000)
  }

  const systemSettings = {
    siteName: "ChurchFlow Global",
    siteUrl: "https://churchflow.com",
    adminEmail: "admin@churchflow.com",
    timezone: "America/New_York",
    language: "en",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxChurchesPerUser: 5,
    sessionTimeout: 30,
    backupFrequency: "daily",
  }

  const securitySettings = {
    twoFactorRequired: true,
    passwordMinLength: 8,
    passwordComplexity: true,
    loginAttempts: 5,
    lockoutDuration: 15,
    sessionSecurity: "high",
    ipWhitelisting: false,
    auditLogging: true,
  }

  const emailSettings = {
    smtpHost: "smtp.churchflow.com",
    smtpPort: 587,
    smtpUsername: "noreply@churchflow.com",
    smtpSecurity: "tls",
    fromName: "ChurchFlow System",
    fromEmail: "noreply@churchflow.com",
    replyToEmail: "support@churchflow.com",
  }

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 29,
      features: ["Up to 100 members", "Basic reporting", "Email support"],
      active: true,
    },
    {
      id: "standard",
      name: "Standard Plan",
      price: 59,
      features: ["Up to 500 members", "Advanced reporting", "Priority support", "Multiple branches"],
      active: true,
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 99,
      features: ["Unlimited members", "Custom reporting", "24/7 support", "API access", "White-label"],
      active: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {saveStatus === "saved" && (
            <Alert className="w-auto border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Settings saved successfully</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Basic system settings and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" defaultValue={systemSettings.siteName} placeholder="Enter site name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input id="siteUrl" defaultValue={systemSettings.siteUrl} placeholder="https://example.com" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    defaultValue={systemSettings.adminEmail}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={systemSettings.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue={systemSettings.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxChurches">Max Churches per User</Label>
                  <Input
                    id="maxChurches"
                    type="number"
                    defaultValue={systemSettings.maxChurchesPerUser}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent user access</p>
                  </div>
                  <Switch defaultChecked={systemSettings.maintenanceMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registration Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow new church registrations</p>
                  </div>
                  <Switch defaultChecked={systemSettings.registrationEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification Required</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                  </div>
                  <Switch defaultChecked={systemSettings.emailVerificationRequired} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>Configure security policies and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passwordLength">Minimum Password Length</Label>
                  <Input
                    id="passwordLength"
                    type="number"
                    defaultValue={securitySettings.passwordMinLength}
                    min="6"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    defaultValue={securitySettings.loginAttempts}
                    min="3"
                    max="10"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    defaultValue={securitySettings.lockoutDuration}
                    min="5"
                    max="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    defaultValue={systemSettings.sessionTimeout}
                    min="15"
                    max="120"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication Required</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch defaultChecked={securitySettings.twoFactorRequired} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">Require uppercase, lowercase, numbers, and symbols</p>
                  </div>
                  <Switch defaultChecked={securitySettings.passwordComplexity} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">Restrict admin access to specific IP addresses</p>
                  </div>
                  <Switch defaultChecked={securitySettings.ipWhitelisting} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all administrative actions</p>
                  </div>
                  <Switch defaultChecked={securitySettings.auditLogging} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure SMTP settings and email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" defaultValue={emailSettings.smtpHost} placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" type="number" defaultValue={emailSettings.smtpPort} placeholder="587" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    defaultValue={emailSettings.smtpUsername}
                    placeholder="username@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpSecurity">Security</Label>
                  <Select defaultValue={emailSettings.smtpSecurity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input id="fromName" defaultValue={emailSettings.fromName} placeholder="Your Organization" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    defaultValue={emailSettings.fromEmail}
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyToEmail">Reply-To Email</Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  defaultValue={emailSettings.replyToEmail}
                  placeholder="support@example.com"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Subscription Plans
              </CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{plan.name}</h4>
                        <Badge className="bg-green-100 text-green-800">${plan.price}/month</Badge>
                        {plan.active && <Badge className="bg-blue-100 text-blue-800">Active</Badge>}
                      </div>
                      <ul className="text-sm text-muted-foreground mt-2">
                        {plan.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Switch defaultChecked={plan.active} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts for system issues and maintenance</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Church Registrations</Label>
                    <p className="text-sm text-muted-foreground">Notify when new churches register</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications for payment events</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Send weekly system usage reports</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  defaultValue="admin@churchflow.com"
                  placeholder="notifications@example.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>Advanced system settings and database configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Warning: These settings can affect system performance. Only modify if you understand the implications.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue={systemSettings.backupFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select defaultValue="info">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea id="customCss" placeholder="/* Add custom CSS here */" className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customJs">Custom JavaScript</Label>
                <Textarea id="customJs" placeholder="// Add custom JavaScript here" className="min-h-[100px]" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Backup Database
                </Button>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
