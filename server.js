const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const APP_ID = "18383580742";
const SECRET_KEY = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

app.post("/gerar-link", async (req, res) => {

try{

const { url } = req.body;

const timestamp = Math.floor(Date.now() / 1000);

const baseString = `${APP_ID}${url}${timestamp}`;

const signature = crypto
.createHmac("sha256", SECRET_KEY)
.update(baseString)
.digest("hex");

const response = await axios.post(
"https://open-api.affiliate.shopee.com.br/graphql",
{
query: `
mutation {
generateAffiliateLink(
input: { originUrl: "${url}" }
) {
shortLink
}
}
`
},
{
headers:{
"Content-Type":"application/json",
"Authorization":`SHA256 Credential=${APP_ID},Timestamp=${timestamp},Signature=${signature}`
}
}
);

res.json({
link: response.data.data.generateAffiliateLink.shortLink
});

}catch(e){
res.status(500).json({error:"erro"});
}

});

app.listen(3000, () => console.log("rodando"));