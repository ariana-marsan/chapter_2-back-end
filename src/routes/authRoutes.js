
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password} = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);

    try{
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        const defaultTodo = 'Add your first todo!';
        await prisma.todo.create({
            data: {
                task: defaultTodo,
                user_id: user.id
            }
        })

        const token = jwt.sign({ id: user.id}, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });
        res.json({ token });
        
    } catch (e){
        console.log(e.message);
        res.sendStatus(503);
    }

})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try{
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user){
            return res.status(404).json({ message: 'User not found'});
        }

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword){
            return res.status(401).json({ message: 'Invalid password'});
        }

        const token = jwt.sign({ id: user.id}, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });
        res.json({ token });
        
    } catch (e){
        console.log(e.message);
        res.sendStatus(503);
    }
})



export default router;