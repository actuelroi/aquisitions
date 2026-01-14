import logger from "#config/logger.js"
import { createUser, authenticateUser } from "#services/auth.service.js";
import { formatValidationError } from "#utils/format.js";
import { signupSchema, signInSchema } from "#validations/auth.validation.js";
import { jwtToken } from "#utils/jwt.js";
import { cookies } from "./../utils/cookies.js"


export const signup = async (req, res, next) => {
    try {

        const validationResult = signupSchema.safeParse(req.body)

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            })
        }

        const { name, email, role, password } = validationResult.data

        const user = await createUser({ name, email, password, role })



        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        })

        cookies.set(res, 'token', token)

        logger.info(`User registered successfully: ${email}`);

        res.status(201).json({
            message: "user register",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (e) {
        logger.error('Sign up error', e);

        if (e.message === 'User with this email already exists') {
            return res.status(409).json({ error: 'Email already exist' })
        }

        next(e)
    }
}



export const signIn = async (req, res, next) => {
    try {

        const validationResult = signInSchema.safeParse(req.body)

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            })
        }

        const { email, password } = validationResult.data

        const user = await authenticateUser({ email, password })

        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        })

        cookies.set(res, 'token', token)

        logger.info(`User signed successfully: ${email}`);

        res.status(200).json({
            message: "user signed successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (e) {
        logger.error('Sign in error', e);

        if (e.message === 'User not found' || e.message ==='Invalid password') {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        next(e)

    }
}


export const signOut = async (req, res, next)=>{
    try{

        cookies.clear(res, 'token')
        logger.info('User signed out successfully')

        res.status(200).json({
            message: 'User signed out successfully'
        })

    }catch (e){
        logger.error('Sign out error', e)
        next(e)
    }
}