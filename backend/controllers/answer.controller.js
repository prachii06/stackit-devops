import prisma from "../src/config/db.js"
import z from 'zod'



const createAnswer = async (req, res) => {
    const answerSchema = z.object({
        content: z.string().min(1, "Answer content is required"),
        questionId: z.cuid("Invalid question ID")
    });

    try {
        const validated = answerSchema.parse(req.body);

        // Check if question exists
        const question = await prisma.question.findUnique({
            where: { id: validated.questionId }
        });


        if (!question) {
            return res.status(404).json({ msg: "Question not found" });
        }

        // Get userId from authenticated user
        const userId = req.user.userId;

        // Create the answer
        const newAnswer = await prisma.answer.create({
            data: {
                content: validated.content,
                userId,
                questionId: validated.questionId
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });



        return res.status(201).json({
            msg: "Answer posted successfully",
            answer: newAnswer
        });

    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                msg: "Validation error",
                errors: err.errors
            });
        }
        console.error("CreateAnswer Error:", err);
        return res.status(500).json({ msg: "Internal server error" });
    }
}

const deleteAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Check if answer exists
        const answer = await prisma.answer.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!answer) {
            return res.status(404).json({ msg: "Answer not found" });
        }

        // Check if user owns the answer or is admin
        if (answer.userId !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ msg: "Not authorized to delete this answer" });
        }

        // Delete votes first due to foreign key constraints
        await prisma.vote.deleteMany({
            where: { answerId: id }
        });

        // Delete the answer
        await prisma.answer.delete({
            where: { id }
        });

        return res.json({ msg: "Answer deleted successfully" });
    } catch (error) {
        console.error("DeleteAnswer Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getAllAnswerAdmin = async (req, res) => {
    try {
        const answers = await prisma.answer.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                },
                question: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                votes: {
                    include: {
                        user: {
                            select: {
                                username: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const answersWithStats = answers.map(answer => ({
            ...answer,
            voteCount: answer.votes.reduce((acc, vote) => acc + vote.value, 0)
        }));

        return res.json({
            totalAnswers: answers.length,
            answers: answersWithStats
        });
    } catch (error) {
        console.error("GetAllAnswersAdmin Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export {
    createAnswer,
    deleteAnswer,
    getAllAnswerAdmin,

}