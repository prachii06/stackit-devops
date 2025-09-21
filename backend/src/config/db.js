import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


// const addTestUser = async () => {
//     const user = await prisma.user.create({
//         data: {
//             id: '123',
//             username: 'testUser',
//             email: 'testuser@1234',
//             password: 'test123',

//         }
//     })

//     console.log(user);

// }
// addTestUser();

// const getTestUser = async () => {
//     const user = await prisma.user.findMany();
//     console.log(user);

// }
// getTestUser();
export default prisma;