import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/db";

const UpvoteSchema = z.object({
    streamId: z.string(),
});

export async function POST(req: NextRequest){
    const session = await getServerSession();
    if(!session?.user?.email){
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403,
        });
    }
    const user = await prisma.user.findFirst({
        where:{
            email: session.user.email ?? ""
        },

    });
    if(!user){
        return NextResponse.json({
            message: "Unauthenticated",
        }, {
            status: 403,
        });
    }
    try {
        const data = UpvoteSchema.parse(await req.json());
        await prisma.upvote.delete({
            where:{
                userId_streamId:{
                    userId: user.id,
                    stream: data.streamId,
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            message: "Error while upvoting",
        }, {
            status: 403,
        });
    }

}