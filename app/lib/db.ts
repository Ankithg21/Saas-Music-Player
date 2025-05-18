
import {PrismaClient} from "@prisma/client";

const prismaClientSinglton = ()=>{
    return new PrismaClient();
};

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient | undefined
};

const prisma = globalForPrisma.prisma ?? prismaClientSinglton();

export default prisma;
