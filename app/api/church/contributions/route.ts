// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Contribution from "@/models/Contribution"
// import ContributionDonation from "@/models/ContributionDonation"
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
//       query.$or = [{ title: { $regex: search, $options: "i" } }, { beneficiary: { $regex: search, $options: "i" } }]
//     }

//     if (category) {
//       query.category = category
//     }

//     if (status) {
//       query.status = status
//     }

//     const skip = (page - 1) * limit

//     const [contributions, total] = await Promise.all([
//       Contribution.find(query)
//         .populate("organizerId", "firstName lastName")
//         .populate("branchId", "name")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Contribution.countDocuments(query),
//     ])

//     // Get donation counts for each contribution
//     const contributionsWithStats = await Promise.all(
//       contributions.map(async (contribution) => {
//         const donationCount = await ContributionDonation.countDocuments({
//           contributionId: contribution._id,
//           churchId: user.churchId,
//         })
//         return {
//           ...contribution.toObject(),
//           donationCount,
//         }
//       }),
//     )

//     return NextResponse.json({
//       contributions: contributionsWithStats,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Get contributions error:", error)
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

//     const contributionData = await request.json()

//     const contribution = new Contribution({
//       ...contributionData,
//       churchId: user.churchId,
//     })

//     await contribution.save()
//     await contribution.populate(["organizerId", "branchId"])

//     return NextResponse.json(contribution, { status: 201 })
//   } catch (error) {
//     console.error("Create contribution error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
