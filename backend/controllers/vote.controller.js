import prisma from "../src/config/db.js";

// POST /vote/:answerId
export const voteAnswer = async (req, res) => {
	try {
		const { answerId } = req.params;
		const userId = req.user.userId;

		// Check if user already voted for this answer
		const existingVote = await prisma.vote.findFirst({
			where: { userId, answerId }
		});

		if (existingVote) {
			return res.status(400).json({ msg: "You have already voted for this answer." });
		}

		// Create a new vote (value: 1 for star)
		await prisma.vote.create({
			data: {
				value: 1,
				userId,
				answerId
			}
		});

		// Get updated vote count
		const votes = await prisma.vote.findMany({ where: { answerId } });
		const voteCount = votes.reduce((acc, v) => acc + v.value, 0);

		return res.json({ msg: "Vote registered!", voteCount });
	} catch (err) {
		console.error("Vote Error:", err);
		return res.status(500).json({ msg: "Internal server error" });
	}
};
