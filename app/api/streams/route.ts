import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/db";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
});

const YT_REGEX = new RegExp("")

export async function POST(req: NextRequest){
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const isYoutube = YT_REGEX.test(data.url);
        if(!isYoutube){
            return NextResponse.json(
                {message: "Wrong URL format"},
                {status: 411},
            );
        }
        const extractedId = data.url.split("?v=")[1];
        await prisma.stream.create({
            data:{
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
            }
        });
        return NextResponse.json(
            {message: "Stream added Successfully"},
            {status: 200},
        );
    } catch (error: any) {
        return NextResponse.json({
            message: "Error while adding a stream."
        },{
            status: 411,
        });
    }
    
}