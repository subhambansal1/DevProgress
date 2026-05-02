const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");

router.get("/:email", async (req,res)=>{

const data = await Certificate.find({
userEmail: req.params.email
});

res.json(data);

});

router.post("/", async (req,res)=>{

const cert = new Certificate(req.body);

await cert.save();

res.json(cert);

});

router.delete("/:id", async (req,res)=>{

await Certificate.findByIdAndDelete(req.params.id);

res.json({message:"deleted"});

});

module.exports = router;