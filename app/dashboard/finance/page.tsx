"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Smartphone,
  Download,
  Plus,
  PiggyBank,
  Target,
} from "lucide-react"
import { AddOfferingForm } from "@/components/forms/add-offering-form"
import { AddPledgeForm } from "@/components/forms/add-pledge-form"

// Mock data
const financialSummary = {
  totalOfferings: 45231,
  totalTithes: 32450,
  totalPledges: 15600,
  monthlyGoal: 50000,
  expenses: 28750,
  netIncome: 64531,
}

const recentTransactions = [
  {
    id: 1,
    date: "2024-01-07",
    type: "Tithe",
    amount: 450,
    method: "M-Pesa",
    member: "John Smith",
    reference: "MP240107001",
    status: "Completed",
  },
  {
    id: 2,
    date: "2024-01-07",
    type: "Offering",
    amount: 2450,
    method: "Cash",
    member: "Sunday Service",
    reference: "CS240107001",
    status: "Completed",
  },
  {
    id: 3,
    date: "2024-01-06",
    type: "Pledge",
    amount: 1000,
    method: "Bank Transfer",
    member: "Sarah Johnson",
    reference: "BT240106001",
    status: "Pending",
  },
  {
    id: 4,
    date: "2024-01-05",
    type: "Special Offering",
    amount: 750,
    method: "Card",
    member: "David Wilson",
    reference: "CD240105001",
    status: "Completed",
  },
]

const pledges = [
  {
    id: 1,
    member: "John Smith",
    amount: 5000,
    paid: 3500,
    remaining: 1500,
    dueDate: "2024-12-31",
    purpose: "Building Fund",
    status: "Active",
  },
  {
    id: 2,
    member: "Sarah Johnson",
    amount: 3000,
    paid: 3000,
    remaining: 0,
    dueDate: "2024-06-30",
    purpose: "Mission Trip",
    status: "Completed",
  },
  {
    id: 3,
    member: "Emily Davis",
    amount: 2500,
    paid: 1200,
    remaining: 1300,
    dueDate: "2024-09-30",
    purpose: "Youth Program",
    status: "Active",
  },
]

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [isOfferingOpen, setIsOfferingOpen] = useState(false)
  const [isPledgeOpen, setIsPledgeOpen] = useState(false)

  const filteredTransactions = recentTransactions.filter(
    (transaction) =>
      transaction.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "m-pesa":
        return <Smartphone className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "Completed" ? (
      <Badge className="bg-green-100 text-green-800">Completed</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Track tithes, offerings, and church finances</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isPledgeOpen} onOpenChange={setIsPledgeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="mr-2 h-4 w-4" />
                Add Pledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Pledge</DialogTitle>
                <DialogDescription>Record a new member pledge or commitment</DialogDescription>
              </DialogHeader>
              <AddPledgeForm onSuccess={() => setIsPledgeOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={isOfferingOpen} onOpenChange={setIsOfferingOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Offering
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record Offering</DialogTitle>
                <DialogDescription>Record tithes, offerings, and donations</DialogDescription>
              </DialogHeader>
              <AddOfferingForm onSuccess={() => setIsOfferingOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Offerings</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${financialSummary.totalOfferings.toLocaleString()}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tithes</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <PiggyBank className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${financialSummary.totalTithes.toLocaleString()}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pledges</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${financialSummary.totalPledges.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Active commitments</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Goal</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${financialSummary.monthlyGoal.toLocaleString()}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${(financialSummary.totalOfferings / financialSummary.monthlyGoal) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((financialSummary.totalOfferings / financialSummary.monthlyGoal) * 100)}% achieved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="pledges">Pledges</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Member/Source</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{transaction.member}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(transaction.method)}
                            <span className="text-sm">{transaction.method}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">${transaction.amount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">{transaction.reference}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pledges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Pledges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pledges.map((pledge) => (
                      <TableRow key={pledge.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="font-medium">{pledge.member}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{pledge.purpose}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${pledge.amount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600">${pledge.paid.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className={pledge.remaining > 0 ? "text-orange-600" : "text-green-600"}>
                            ${pledge.remaining.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(pledge.dueDate).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={pledge.status === "Completed" ? "default" : "secondary"}
                            className={
                              pledge.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {pledge.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tithes</span>
                    <span className="text-sm text-gray-600">$32,450 (50%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Offerings</span>
                    <span className="text-sm text-gray-600">$45,231 (70%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Special Offerings</span>
                    <span className="text-sm text-gray-600">$8,750 (13%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "13%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Utilities</span>
                    <span className="text-sm text-gray-600">$8,500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maintenance</span>
                    <span className="text-sm text-gray-600">$12,250</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "43%" }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ministry Programs</span>
                    <span className="text-sm text-gray-600">$8,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
