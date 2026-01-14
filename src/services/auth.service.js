import logger from "#config/logger.js"
import bcrypt from 'bcrypt'
import {db} from './../config/db.js'
import { users} from './../models/user.model.js'
import { eq } from "drizzle-orm"


export const hashPassword = async (password) =>{
    try {
      return await bcrypt.hash(password, 10)
    }catch(e){
        logger.error(`Error hashing the password:${e}`)
        throw new Error ('Error hashing')
    }
}



export const createUser = async ({name, email, password, role='user'})=>{

    try{
        const existingUser = await db.select().from(users)
        .where(eq(users.email, email)).limit(1)

        if(existingUser.length >0){
            throw new Error('User already exists')
        }

        const passwordHash= await hashPassword(password)

        const [newUser] = await db.insert(users)

        .values({
            name, 
            email, 
            password: passwordHash,
            role
        }).returning({
            id: users.id, 
            name: users.name,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt
        })

        logger.info(`User ${newUser.email} created successfully`)
        return newUser

    }catch(e){
        logger.error(`Error creating the user: ${e}`)
        throw new Error('Error creating the user')
    }

}



export const comparePassword = async (password, hashedPassword)=>{
    try {
        return await bcrypt.compare(password, hashedPassword)

    }catch(e){
        logger.error(`Error comparing password:${e}`)
        throw new Error ('Error comparing password')
    }
}

export const authenticateUser = async ({ email, password }) => {
    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (result.length === 0) {
            throw new Error('Invalid email or password')
        }

        const user = result[0]

        const isMatch = await comparePassword(password, user.password)

        if (!isMatch) {
            throw new Error('Invalid email or password')
        }

        // Return safe user data (never return password)
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }

    } catch (e) {
        logger.error(`Authentication error: ${e}`)
        throw e
    }
}
