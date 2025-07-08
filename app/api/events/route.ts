// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Event from "@/models/Event"
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
//     const category = searchParams.get("category") || ""
//     const status = searchParams.get("status") || ""

//     const query: any = { churchId: user.churchId }

//     if (search) {
//       query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//     }

//     if (category) {
//       query.category = category
//     }

//     if (status) {
//       query.status = status
//     }

//     const skip = (page - 1) * limit

//     const [events, total] = await Promise.all([
//       Event.find(query)
//         .populate("organizerId", "firstName lastName")
//         .populate("branchId", "name")
//         .sort({ startDate: -1 })
//         .skip(skip)
//         .limit(limit),
//       Event.countDocuments(query),
//     ])

//     return NextResponse.json({
//       events,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Get events error:", error)
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

//     const eventData = await request.json()

//     const event = new Event({
//       ...eventData,
//       churchId: user.churchId,
//     })

//     await event.save()
//     await event.populate(["organizerId", "branchId"])

//     return NextResponse.json(event, { status: 201 })
//   } catch (error) {
//     console.error("Create event error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
