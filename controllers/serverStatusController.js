exports.serverStaus = (req, res)=>{
    try {
        res.status(200).json({
            success:true,
            details:req.headers,
            port:process.env.PORT,
            message:"Server is working properly."
        })

    }catch (e) {
        res.status(e.status).json({
            success:false,
            message:e.message
        })

    }
}