import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//GET
export async function GET (req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const filters: any = {};

    if (status && (status === "COMPLETE" || status === "INCOMPLETE")) {
        filters.status = status;
    }
    if (priority && ["HIGH", "MEDIUM", "LOW"].includes(priority)) {
        filters.priority = priority;
    }

    const tasks = await prisma.task.findMany({
        where: filters,
        orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(tasks);
}

//POST
export async function POST (req: Request) {
    try {
        const { title, priority} = await req.json();

        if (!title || !priority) {
            return NextResponse.json({ error: "Title dan Prioritas wajib diisi"}, {status: 400});
        }

        const task = await prisma.task.create({
            data: {
                title,
                priority
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal create task"}, { status: 500})
    }
}