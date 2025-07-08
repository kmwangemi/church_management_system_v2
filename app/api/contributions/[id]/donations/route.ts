// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Donation from "@/models/Donation"
// import Contribution from "@/models/Contribution"
// import { verifyToken } from "@/lib/auth"

// export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const donationData = await request.json()

//     // Verify contribution exists
//     const contribution = await Contribution.findOne({
//       _id: params.id,
//       churchId: user.churchId,
//     })

//     if (!contribution) {
//       return NextResponse.json({ error: "Contribution not found" }, { status: 404 })
//     }

//     const donation = new Donation({
//       ...donationData,
//       contributionId: params.id,
//       churchId: user.churchId,
//     })

//     await donation.save()

//     // Update contribution current amount
//     contribution.currentAmount += donation.amount
//     await contribution.save()

//     await donation.populate("donorId", "firstName lastName")

//     return NextResponse.json(donation, { status: 201 })
//   } catch (error) {
//     console.error("Create contribution donation error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
