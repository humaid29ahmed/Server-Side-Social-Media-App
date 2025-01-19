import express from "express";
import db from "../index.js"

export const getPosts = async(req,res)=>{
    const {page} = req.query;
    try{
        const LIMIT = 4;
        const offset = (Number(page) - 1) * LIMIT;
        let countRows = await db.query('SELECT COUNT(*) FROM post');
        let result  = await db.query("SELECT * FROM post ORDER BY id DESC LIMIT $1 OFFSET $2",[LIMIT,offset]);
        res.status(200).json({data:result.rows, currentPage:Number(page), noOfPages:Math.ceil(countRows.rows[0].count/LIMIT)});

    } catch(error)
    {
         res.status(404).json({message:error.message});
    }
};

export const getPost = async(req,res)=>{
    const {id}=req.params;
    try {

        const result = await db.query('SELECT * FROM post where id = $1',[Number(id)]);
        res.status(200).json(result.rows[0]);
        
    } catch (error) {
        console.log(error);
    }
};

export const getPostsBySearch = async(req,res)=>{
    let{search,tags} = req.query;
    if(search === '') search = 'NoMatch';
    try {
        const result = await db.query("SELECT * FROM post WHERE ARRAY(SELECT LOWER(unnest(tags))) && ARRAY(SELECT LOWER(unnest($1 ::text[]))) OR title like '%'||$2||'%' ",[tags.split(','),search]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
    }
};

export const createPost = async(req,res)=>{
    let name = req.body.name;
    let tags=req.body.tags.split(',');
    let creator = req.body.creator;
    let title = req.body.title;
    let selectedFile = req.body.selectedFile;
    let message = req.body.message;
    try{
     const result = await db.query("INSERT INTO post(title, message, creator, tags, selectedFile, createdate,name ) VALUES ($1, $2, $3,$4,$5,$6,$7) RETURNING *",[title, message,req.userId,tags, selectedFile, new Date().toISOString(),name]);
    res.status(200).json(result.rows[0]);
    }catch(error){
        console.log(error.message);
    }

};

export const updatePost = async(req,res)=>{

    const id =parseInt(req.params.id);
    try {
        const result = await db.query("SELECT * FROM post WHERE id=$1",[id]);
    if(!result.rows.length) return res.status(404).send("USER DOES NOT EXIST!");
    const title = req.body.title || result.rows[0].title;
    const message = req.body.message || result.rows[0].message;
    const creator = req.body.creator || result.rows[0].creator;
    const tags = Array.isArray(req.body.tags)?req.body.tags:req.body.tags.split(',') || result.rows[0].tags;
    const selectedfile = req.body.selectedfile || result.rows[0].selectedfile;

    const updatedPost = await db.query("UPDATE post SET title=$1, message=$2, creator=$3, tags=$4, selectedfile=$5 WHERE id = $6 RETURNING *",[title, message, creator, tags, selectedfile, id]);
    const newPost = updatedPost.rows[0];

    res.status(200).json(newPost);
    } catch (error) {
        console.log(error);
    }
};

export const deletePost = async(req,res)=>{
    const id = parseInt(req.params.id);
    try {
        await db.query("DELETE FROM post where id=$1",[id]);
        res.status(200).json({message:"The post has been deleted successfully!"});
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async(req,res)=>{
    try {
        const id = parseInt(req.params.id);
        const {userId} = req;
        let updatedLikesIds = [];
        if(! userId) return res.status(404).json({message: 'User Unauthenticated !'});
        const response = await db.query('SELECT likes FROM post WHERE id = $1 ',[id]);
        const likesIds = response.rows[0].likes;
        const index = likesIds.findIndex((like_id)=>{return like_id == userId});
        if(index == -1)
        {  const newLikesId = [...likesIds, userId];
           const updatedLikesId = await db.query('UPDATE post SET likes = $1 WHERE id = $2 RETURNING *',[newLikesId, id]);
           updatedLikesIds= updatedLikesId.rows[0];
        } else {
          const newLikesId = likesIds.filter((id)=>{return id != userId});
          const updatedLikesId = await db.query('UPDATE post SET likes = $1 WHERE id = $2 RETURNING *',[newLikesId, id]);
          updatedLikesIds= updatedLikesId.rows[0];
        }
        res.status(200).json(updatedLikesIds);
        
    } catch (error) {
        console.log(error);
    }

};

export const commentPost = async(req,res)=>{
    let {id} = req.params;
    let {comment} = req.body;
    let {userId} = req;
    try {
        if(!userId) return res.status(401).json({message:'User is Unauthorized!'});
        const postComments = await db.query('SELECT comments FROM post WHERE id = $1',[Number(id)] )
        let newUpdatedCommentsArray = [...postComments.rows[0].comments,comment]
        const updatedComments = await db.query('UPDATE post SET comments=$1 WHERE id=$2 RETURNING comments',[newUpdatedCommentsArray,Number(id)]);
        res.status(200).json(updatedComments.rows[0].comments);

    } catch (error) {
        console.log(error);
    }
};

