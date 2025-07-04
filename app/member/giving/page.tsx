"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, Calendar, Heart, Target, CreditCard, Download, Plus, Gift } from "lucide-react"

export default function MemberGiving() {
  const [selectedAmount, setSelectedAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [givingType, setGivingType] = useState("tithe")

  const givingStats = {
    totalThisYear: 2450,
    totalLifetime: 8750,
    averageMonthly: 204,
    lastGift: "2024-01-01",
    streak: 12,
    pledgeGoal: 3000,
    pledgeProgress: 2450,
  }

  const recentGifts = [
    {
      id: 1,
      date: "2024-01-01",
      amount: 250,
      type: "Tithe",
      method: "Credit Card",
      status: "Completed",
    },
    {
      id: 2,
      date: "2023-12-24",
      amount: 100,
      type: "Christmas Offering",
      method: "Bank Transfer",
      status: "Completed",
    },
    {
      id: 3,
      date: "2023-12-15",
      amount: 250,
      type: "Tithe",
      method: "Credit Card",
      status: "Completed",
    },
    {
      id: 4,
      date: "2023-12-01",
      amount: 250,
      type: "Tithe",
      method: "Credit Card",
      status: "Completed",
    },
    {
      id: 5,
      date: "2023-11-15",
      amount: 250,
      type: "Tithe",
      method: "Credit Card",
      status: "Completed",
    },
  ]

  const quickAmounts = [25, 50, 100, 250, 500]

  const pledges = [
    {
      id: 1,
      name: "Annual Tithe Commitment",
      goal: 3000,
      current: 2450,
      deadline: "2024-12-31",
      frequency: "Monthly",
    },
    {
      id: 2,
      name: "Building Fund",
      goal: 1000,
      current: 750,
      deadline: "2024-06-30",
      frequency: "One-time",
    },
  ]

  const handleGive = () => {
    const amount = customAmount || selectedAmount
    console.log(`Processing gift of $${amount} for ${givingType}`)
    // Process payment
  }

  return (
    <div className="space-y-6">
      {/* Giving Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${givingStats.totalThisYear.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${givingStats.averageMonthly}</div>
            <p className="text-xs text-muted-foreground">Based on 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giving Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{givingStats.streak}</div>
            <p className="text-xs text-muted-foreground">Consecutive months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${givingStats.totalLifetime.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Since {new Date().getFullYear() - 4}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Give Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>Give Now</span>
              </CardTitle>
              <CardDescription>Make a quick contribution to support the church</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Give Now
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Make a Contribution</DialogTitle>
                  <DialogDescription>Choose an amount and giving type to make your contribution</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="givingType">Giving Type</Label>
                    <Select value={givingType} onValueChange={setGivingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tithe">Tithe</SelectItem>
                        <SelectItem value="offering">General Offering</SelectItem>
                        <SelectItem value="building">Building Fund</SelectItem>
                        <SelectItem value="missions">Missions</SelectItem>
                        <SelectItem value="special">Special Offering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quick Amounts</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount.toString() ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedAmount(amount.toString())
                            setCustomAmount("")
                          }}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customAmount">Custom Amount</Label>
                    <Input
                      id="customAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setSelectedAmount("")
                      }}
                    />
                  </div>

                  <Button onClick={handleGive} className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Give ${customAmount || selectedAmount || "0"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Giving History</TabsTrigger>
          <TabsTrigger value="pledges">Pledges & Goals</TabsTrigger>
          <TabsTrigger value="statements">Tax Statements</TabsTrigger>
        </TabsList>

        {/* Giving History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Contributions</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGifts.map((gift) => (
                  <div key={gift.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{gift.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(gift.date).toLocaleDateString()} • {gift.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${gift.amount}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {gift.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pledges & Goals */}
        <TabsContent value="pledges">
          <div className="space-y-6">
            {pledges.map((pledge) => (
              <Card key={pledge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>{pledge.name}</span>
                      </CardTitle>
                      <CardDescription>
                        Goal: ${pledge.goal.toLocaleString()} • Due: {new Date(pledge.deadline).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{pledge.frequency}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>
                          ${pledge.current.toLocaleString()} of ${pledge.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(pledge.current / pledge.goal) * 100} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {Math.round((pledge.current / pledge.goal) * 100)}% complete
                      </span>
                      <Button size="sm">Contribute to Pledge</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Create New Pledge</h3>
                <p className="text-gray-500 text-center mb-4">
                  Set a giving goal to track your contributions over time
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Pledge
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tax Statements */}
        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Annual Giving Statements</CardTitle>
              <CardDescription>Download your tax-deductible contribution statements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[2023, 2022, 2021].map((year) => (
                  <div key={year} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{year} Annual Statement</p>
                      <p className="text-sm text-gray-500">
                        Total contributions: ${(givingStats.totalThisYear * (year === 2023 ? 1 : 0.8)).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
