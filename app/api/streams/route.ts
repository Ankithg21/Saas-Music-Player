import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/lib/db";
//@ts-expect-error
import youtubesearchapi from "youtube-search-api";
const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
});

const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export async function POST(req: NextRequest){
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const isYoutube = data.url.match(YT_REGEX);
        if(!isYoutube){
            return NextResponse.json(
                {message: "Wrong URL format"},
                {status: 411},
            );
        }
        const extractedId = data.url.split("?v=")[1];
        const res = await youtubesearchapi.GetVideoDetails(extractedId);

        if (!res || !res.title || !res.thumbnail?.thumbnails?.length) {
        return new Response(JSON.stringify({ message: "Invalid YouTube data." }), { status: 400 });
        }

        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a:{width: number}, b:{width: number}) => a.width < b.width ? -1 : 1);

        const smallImg = thumbnails[0].url ?? "";
        const bigImage = thumbnails[thumbnails.length - 1].url ?? "";

        const stream = await prisma.stream.create({
        data: {
            userId: data.creatorId,
            url: data.url,
            extractedId: extractedId,
            type: "Youtube",
            title: res.title,
            smallImg,
            bigImage
        }
        });

        return NextResponse.json(
            {message: "Stream added Successfully", stream},
            {status: 200},
        );
    } catch (error: any) {
        console.log(error);
        return NextResponse.json({
            message: "Error while adding a stream."
        },{
            status: 411,
        });
    }
}