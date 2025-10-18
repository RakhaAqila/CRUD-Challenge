import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//PUT
export async function PUT(req: Request, { params }: { params: { id: string }}) {
    try {
        const id = parseInt(params.id);
        const { status } = await req.json();

        if (!["COMPLETE", "INCOMPLETE"].includes(status)) {
            return NextResponse.json({ error: "Status invalid" }, { status: 400 });
        }

        const updated = await prisma.task.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal update task" }, { status: 500 });
    }
}

//DELETE
export async function DELETE(req: Request, { params }: { params: { id: string}}) {
    try {
        const id = parseInt(params.id);

        await prisma.task.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Task berhasil dihapus" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal delete task" }, { status: 500 })
    }
}