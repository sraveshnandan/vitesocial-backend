exports.ThrowError = (res, err)=>{
     return res.status(500).json({
        success:false,
        message:err.message
    })
}