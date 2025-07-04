"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Building,
  Car,
  Home,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Wrench,
} from "lucide-react"
import { AddAssetForm } from "@/components/forms/add-asset-form"

// Mock data
const assets = [
  {
    id: 1,
    name: "Church Bus #1",
    type: "Vehicle",
    category: "Transportation",
    value: 45000,
    purchaseDate: "2022-03-15",
    condition: "Good",
    location: "Main Campus",
    status: "Active",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
    serialNumber: "CB001-2022",
    warranty: "3 years",
  },
  {
    id: 2,
    name: "Grace Christian School",
    type: "Property",
    category: "Education",
    value: 850000,
    purchaseDate: "2018-08-01",
    condition: "Excellent",
    location: "Downtown Campus",
    status: "Active",
    lastMaintenance: "2023-12-01",
    nextMaintenance: "2024-06-01",
    serialNumber: "GCS-2018",
    warranty: "N/A",
  },
  {
    id: 3,
    name: "Sound System - Main Sanctuary",
    type: "Equipment",
    category: "Audio/Visual",
    value: 25000,
    purchaseDate: "2023-01-10",
    condition: "Excellent",
    location: "Main Sanctuary",
    status: "Active",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-05-01",
    serialNumber: "SS-MS-2023",
    warranty: "2 years",
  },
  {
    id: 4,
    name: "Church Van #2",
    type: "Vehicle",
    category: "Transportation",
    value: 32000,
    purchaseDate: "2021-11-20",
    condition: "Fair",
    location: "Main Campus",
    status: "Maintenance",
    lastMaintenance: "2024-02-20",
    nextMaintenance: "2024-03-20",
    serialNumber: "CV002-2021",
    warranty: "Expired",
  },
  {
    id: 5,
    name: "Fellowship Hall Tables",
    type: "Furniture",
    category: "Furniture",
    value: 8000,
    purchaseDate: "2020-05-15",
    condition: "Good",
    location: "Fellowship Hall",
    status: "Active",
    lastMaintenance: "2023-11-01",
    nextMaintenance: "2024-11-01",
    serialNumber: "FHT-2020",
    warranty: "N/A",
  },
]

const getAssetIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "vehicle":
      return <Car className="h-5 w-5" />
    case "property":
      return <Building className="h-5 w-5" />
    case "equipment":
      return <Wrench className="h-5 w-5" />
    default:
      return <Home className="h-5 w-5" />
  }
}

const getConditionBadge = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "excellent":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
    case "good":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    case "fair":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair</Badge>
    case "poor":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Poor</Badge>
    default:
      return <Badge variant="secondary">{condition}</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    case "maintenance":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Maintenance
        </Badge>
      )
    case "retired":
      return <Badge variant="secondary">Retired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase())

    if (selectedTab === "all") return matchesSearch
    if (selectedTab === "vehicles") return matchesSearch && asset.type === "Vehicle"
    if (selectedTab === "property") return matchesSearch && asset.type === "Property"
    if (selectedTab === "equipment") return matchesSearch && asset.type === "Equipment"

    return matchesSearch
  })

  const stats = {
    total: assets.length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    vehicles: assets.filter((a) => a.type === "Vehicle").length,
    properties: assets.filter((a) => a.type === "Property").length,
    equipment: assets.filter((a) => a.type === "Equipment").length,
    maintenance: assets.filter((a) => a.status === "Maintenance").length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-1">Manage church assets, properties, and equipment</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>Add a new asset to the church inventory</DialogDescription>
              </DialogHeader>
              <AddAssetForm onSuccess={() => setIsAddAssetOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All registered assets</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Combined asset value</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vehicles</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Car className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.vehicles}</div>
            <p className="text-xs text-gray-500 mt-1">Transportation assets</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Maintenance Due</CardTitle>
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
            <p className="text-xs text-gray-500 mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assets by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles ({stats.vehicles})</TabsTrigger>
              <TabsTrigger value="property">Properties ({stats.properties})</TabsTrigger>
              <TabsTrigger value="equipment">Equipment ({stats.equipment})</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab} className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-100 p-2 rounded-lg">{getAssetIcon(asset.type)}</div>
                            <div>
                              <div className="font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-500">{asset.location}</div>
                              <div className="text-sm text-gray-500">Serial: {asset.serialNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${asset.value.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(asset.nextMaintenance).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Asset
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Maintenance
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Wrench className="mr-2 h-4 w-4" />
                                Maintenance History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
