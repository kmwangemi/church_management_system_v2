// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Volunteer from "@/models/Volunteer"
// import { verifyToken } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const { searchParams } = new URL(request.url)
//     const page = Number.parseInt(searchParams.get("page") || "1")
//     const limit = Number.parseInt(searchParams.get("limit") || "10")
//     const search = searchParams.get("search") || ""
//     const skill = searchParams.get("skill") || ""

//     const query: any = { churchId: user.churchId }

//     if (skill) {
//       query.skills = { $in: [skill] }
//     }

//     const skip = (page - 1) * limit

//     const [volunteers, total] = await Promise.all([
//       Volunteer.find(query)
//         .populate("memberId", "firstName lastName email phone")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Volunteer.countDocuments(query),
//     ])

//     // Filter by search after population
//     let filteredVolunteers = volunteers
//     if (search) {
//       filteredVolunteers = volunteers.filter(
//         (volunteer) =>
//           volunteer.memberId.firstName.toLowerCase().includes(search.toLowerCase()) ||
//           volunteer.memberId.lastName.toLowerCase().includes(search.toLowerCase()) ||
//           volunteer.memberId.email?.toLowerCase().includes(search.toLowerCase()),
//       )
//     }

//     return NextResponse.json({
//       volunteers: filteredVolunteers,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Get volunteers error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const volunteerData = await request.json()

//     const volunteer = new Volunteer({
//       ...volunteerData,
//       churchId: user.churchId,
//     })

//     await volunteer.save()
//     await volunteer.populate("memberId", "firstName lastName email phone")

//     return NextResponse.json(volunteer, { status: 201 })
//   } catch (error) {
//     console.error("Create volunteer error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
