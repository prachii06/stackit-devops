import prisma from "../src/config/db.js"

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                questions: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        _count: {
                            select: {
                                answers: true
                            }
                        }
                    }
                },
                answers: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        _count: {
                            select: {
                                votes: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        console.error("GetCurrentUser Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                createdAt: true,
                questions: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        _count: {
                            select: {
                                answers: true
                            }
                        }
                    }
                },
                answers: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        _count: {
                            select: {
                                votes: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        console.error("GetUserProfile Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                _count: {
                    select: {
                        questions: true,
                        answers: true,
                    }
                },
                answers: {
                    select: {
                        votes: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Calculate total reputation from votes
        const reputation = user.answers.reduce((total, answer) => {
            return total + answer.votes.reduce((voteTotal, vote) => voteTotal + vote.value, 0);
        }, 0);

        return res.json({
            questionCount: user._count.questions,
            answerCount: user._count.answers,
            reputation
        });
    } catch (error) {
        console.error("GetUserStats Error:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
};
