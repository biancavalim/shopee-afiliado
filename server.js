const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 SUAS CREDENCIAIS
const APP_ID = "18383580742";
const SECRET_KEY = "SVKIDYM7SDFMF6DRRKMWHSKGOOITWSAS";

// 🔥 ENDPOINT
app.post("/gerar-link", async (req, res) => {

try {

const { url } = req.body;

if(!url){
return res.status(400).json({ error: "URL obrigatória" });
}

const timestamp = Math.floor(Date.now() / 1000);

// 🔥 FORMATO CORRETO DA ASSINATURA
const payload = `${APP_ID}${timestamp}`;

const signature = crypto
.createHmac("sha256", SECRET_KEY)
.update(payload)
.digest("hex");

// 🔥 REQUEST CORRETO
const response = await axios.post(
"https://open-api.affiliate.shopee.com.br/graphql",
{
query: `
mutation generateLink($url: String!) {
generateAffiliateLink(input: { originUrl: $url }) {
shortLink
}
}
`,
variables: {
url: url
}
},
{
headers: {
"Content-Type": "application/json",
"Authorization": `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`
}
}
);

const link = response.data?.data?.generateAffiliateLink?.shortLink;

if(!link){
throw new Error("Shopee não retornou link");
}

res.json({ link });

} catch (err) {

console.log("ERRO:", err.response?.data || err.message);

res.status(500).json({ error: "erro ao gerar link" });

}

});

app.get("/", (req,res)=>{
res.send("API rodando 🚀");
});

app.listen(3000, () => console.log("Servidor rodando"));