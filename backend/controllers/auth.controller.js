import prisma from "../src/config/db.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import z from 'zod'

const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req, res) => {
    const userSchema = z.object({
        username: z.string(),
        email: z.email(),
        password: z.string().min(6),
    })

    const validate = userSchema.safeParse(req.body)

    if (!validate.success) {
        return res.status(400).json({
            msg: "Validation failed",
            errors: validate.error.errors
        })
    }

    const { email, password, username } = req.body;

    try {
        // check if user already exists in db
        const doesExistEmail = await prisma.user.findUnique({ where: { email } })
        if (doesExistEmail) {
            return res.status(400).json({
                msg: "email already exists. Login instead"
            })
        }

         const doesExistUsername = await prisma.user.findUnique({ where: { username } })
        if (doesExistUsername) {
            return res.status(400).json({
                msg: "Username already exists. Login instead"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Always create new users with USER role, admin role can only be set via database
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'USER' 
            }
        })

        res.status(201).json({ 
            msg: 'User added successfully',
            username: user.username,
            email: user.email,
            role: user.role
        })

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ msg: 'Server error', error: error.message })
    }
}

export const login = async (req, res) => {
    const userSchema = z.object({
        email: z.email(),
        password: z.string().min(1),
    })

    const validate = userSchema.safeParse(req.body)

    if (!validate.success) {
        return res.status(400).json({
            msg: "Validation failed",
            errors: validate.error
        })
    }

    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                role: true
            }
        })

        if (!user) {
            return res.status(400).json({
                msg: "User does not exist"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                msg: "Invalid credentials"
            })
        }

        // Create JWT token with user's actual role from database
        const token = jwt.sign({
            username: user.username,
            userId: user.id,
            userEmail: user.email,
            role: user.role // This will be ADMIN if set in database, otherwise USER
        }, JWT_SECRET, {
            expiresIn: '7d'
        })

        res.json({
            msg: "Login successful",
            authToken: token,
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ msg: 'Server error', error: error.message })
    }
}