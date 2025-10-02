import prisma from "../src/config/db.js"
import z from 'zod'

const getAllQuestions = async (req, res) => {
    try {
        // Pagination params
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;

        // Get total count for pagination
        const total = await prisma.question.count();

        const questions = await prisma.question.findMany({
            skip,
            take: pageSize,
            include: {
                user: {
                    select: {
                        username: true,
                    }
                },
                answers: {
                    include: {
                        votes: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Add total vote count for each question
        const questionsWithVotes = questions.map(q => {
            let voteCount = 0;
            q.answers.forEach(ans => {
                if (ans.votes && Array.isArray(ans.votes)) {
                    voteCount += ans.votes.reduce((acc, v) => acc + (v.value || 0), 0);
                }
            });
            return {
                ...q,
                voteCount
            };
        });
        return res.json({
            questions: questionsWithVotes,
            total,
            page,
            pageSize
        });
    } catch (error) {
        console.error("GetAllQuestions Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await prisma.question.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true,
                    }
                },
                answers: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            }
                        },
                        votes: true,
                    }
                }
            }
        });

        if (!question) {
            return res.status(404).json({ msg: "Question not found" });
        }

        return res.json(question);
    } catch (error) {
        console.error("GetQuestionById Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getTrendingQuestions = async (req, res) => {
    try {
        // Get questions with most answers in last 7 days
        const date = new Date();
        date.setDate(date.getDate() - 7);

        const questions = await prisma.question.findMany({
            where: {
                createdAt: {
                    gte: date
                }
            },
            include: {
                answers: true,
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                answers: {
                    _count: 'desc'
                }
            },
            take: 10
        });

        return res.json(questions);
    } catch (error) {
        console.error("GetTrendingQuestions Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getUnansweredQuestions = async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            where: {
                answers: {
                    none: {}
                }
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json(questions);
    } catch (error) {
        console.error("GetUnansweredQuestions Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getAllQuestionsAdmin = async (req, res) => {
    try {
        // Admin can see all questions with full user details
        const questions = await prisma.question.findMany({
            include: {
                user: true,
                answers: {
                    include: {
                        user: true,
                        votes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json(questions);
    } catch (error) {
        console.error("GetAllQuestionsAdmin Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getQuestionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const questions = await prisma.question.findMany({
            where: {
                userId: userId
            },
            include: {
                answers: true,
                user: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json(questions);
    } catch (error) {
        console.error("GetQuestionsByUser Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const getQuestionsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        
        const questions = await prisma.question.findMany({
            where: {
                tags: {
                    has: tag
                }
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                },
                answers: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json(questions);
    } catch (error) {
        console.error("GetQuestionsByTag Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const askQuestion = async (req, res) => {
    const questionSchema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        tags: z.array(z.string()).min(1, "At least one tag is required"),

    });

    try {

        const validated = questionSchema.parse(req.body);

        // Get userId from authenticated user 
        const userId = req.user.userId;


        //create quest in DB
        const newQuestion = await prisma.question.create({
            data: {
                title: validated.title,
                description: validated.description,
                tags: validated.tags,
                userId,

            },
        });

        return res.status(201).json({ msg: "Question posted", question: newQuestion });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ msg: "Validation error", errors: err.errors });
        }

        console.error("AskQuestion Error:", err);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const updateQuestion = async (req, res) => {
    const questionSchema = z.object({
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().min(1, "Description is required").optional(),
        tags: z.array(z.string()).min(1, "At least one tag is required").optional(),
        acceptedAnswerId: z.string().cuid().optional(),
    });

    try {
        const { id } = req.params;
        const validated = questionSchema.parse(req.body);

        // Check if user owns the question or is admin
        const question = await prisma.question.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!question) {
            return res.status(404).json({ msg: "Question not found" });
        }

        if (question.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ msg: "Not authorized to update this question" });
        }

        const updatedQuestion = await prisma.question.update({
            where: { id },
            data: validated,
        });

        return res.json({ msg: "Question updated", question: updatedQuestion });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ msg: "Validation error", errors: err.errors });
        }
        console.error("UpdateQuestion Error:", err);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if question exists
        const question = await prisma.question.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!question) {
            return res.status(404).json({ msg: "Question not found" });
        }

        // Check if user owns the question or is admin
        if (question.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ msg: "Not authorized to delete this question" });
        }

        // Delete the question and all related answers and votes
        await prisma.$transaction([
            prisma.vote.deleteMany({
                where: {
                    answer: {
                        questionId: id
                    }
                }
            }),
            prisma.answer.deleteMany({
                where: {
                    questionId: id
                }
            }),
            prisma.question.delete({
                where: { id }
            })
        ]);

        return res.json({ msg: "Question deleted successfully" });
    } catch (error) {
        console.error("DeleteQuestion Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

const searchQuestions = async (req, res) => {
    try {
        const { query } = req.query;

        const questions = await prisma.question.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tags: {
                            has: query
                        }
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                },
                answers: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json(questions);
    } catch (error) {
        console.error("SearchQuestions Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};



export {
    getAllQuestions,
    getQuestionById,
    askQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionsByUser,
    getQuestionsByTag,
    searchQuestions,
    getTrendingQuestions,
    getUnansweredQuestions,
    getAllQuestionsAdmin
};