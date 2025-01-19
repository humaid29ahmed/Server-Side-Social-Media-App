import jwt from"jsonwebtoken";

const authMiddleware = async(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const whichToken = token.length < 500;
        let decoded;
        if(token && whichToken)
        {
            decoded = jwt.verify(token,'humaid');
            req.userId = decoded?.id;
            console.log(req.userId);
        }else{
            decoded = jwt.decode(token);
            req.userId = decoded?.id;
            console.log(req.userId);
        }
    } catch (error) {

        console.log(error);
        
    }

    next();
    
};

export default authMiddleware;