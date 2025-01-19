import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import db from "../index.js";
export const googleAuth=async(req,res)=>{
    const {accessToken} = req.body;
    try {
        const {data} = await axios.get('https://www.googleapis.com/userinfo/v2/me',{headers:{Authorization:`Bearer ${accessToken}`}});
        console.log(data);
        const {email, id} = data;
        const token = jwt.sign({email:email, id:id},'humaid',{expiresIn:"1h"});
        res.status(200).json({result:data,token:token});
    } catch (error) {
        console.log(error);
    } 
};

export const signIn = async(req,res)=>{

    const {email, password }= req.body;
    try {
        const result = await db.query('SELECT * FROM userlist WHERE email=$1', [email]);
        const userData = result.rows[0];
        if(!userData.email) return res.status(400).json({message:'User does not exist !'});
        const checkPassword = await bcrypt.compare(password, userData.password);
        if(! checkPassword) return res.status(400).json({message:'Invalid Credentials !'});
        const token = jwt.sign({email:email, id:userData.id},'humaid',{expiresIn:"1h"});
        res.status(200).json({result:userData,token});

    } catch (error) {
        console.log(error);
    }

};

export const signUp = async(req,res)=>{
    const {firstName, lastName, email, password, confirmPassword} = req.body;

    try {
        console.log(`${firstName} ${lastName}`);
        console.log(email);
        const userData = await db.query('SELECT * FROM userlist WHERE email = $1',[email]);
        if(userData.rows[0]) return res.status(400).json({message:'The user already exist !'});
        if(password != confirmPassword) return res.status(400).json({message:'Passwords are not the same!'});
        const hashedPassword = await bcrypt.hash(password,12);
        const addUserDataIntoDatabase = await db.query('INSERT INTO userlist (name, email, password) VALUES ($1,$2,$3) RETURNING *',[`${firstName} ${lastName}`, email, hashedPassword]);
        const returnedUserData = addUserDataIntoDatabase.rows[0];
        const token = await jwt.sign(returnedUserData, 'humaid',{expiresIn:"1h"});

        res.status(200).json({result:returnedUserData, token});
        
    } catch (error) {
        res.status(500).json({message: 'Something went wrong!'});
    }

};