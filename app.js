const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');


const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// const botToken = '7201865706:AAFL1-MLtGqpvqDsnO2GoaIqB_qcpTwsd0I';
// const bot = new TelegramBot(botToken, {polling: true});
mongoose.connect('mongodb+srv://fawazogunleye:Aabimbola2022@cluster0.caz9xfe.mongodb.net/hon?retryWrites=true&w=majority&appName=Cluster0');
const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true
    },
    nextClaimTime: {
        type: Date,
        default: Date.now()
    },
    completedTasks: {
        type: Array        
    },
    referredBy: {
        type: String
    },
    referredUsers: [{type: String}]
});
const User = mongoose.model('User', userSchema);
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/send-telegram-data', (req, res) => {
    const { initData } = req.body;

    if (verifyTelegramData(initData)) {
        const user = JSON.parse(req.body.user);

        // Redirect to the dashboard with user data as query parameters
        res.redirect(`/dashboard?telegramId=${user.id}&firstName=${user.first_name}&lastName=${user.last_name || 'N/A'}&username=${user.username || 'N/A'}&languageCode=${user.language_code || 'N/A'}`);
    } else {
        res.status(400).send('Invalid data');
    }
});
app.get('/dashboard', (req, res) => {
    const { telegramId, firstName, lastName, username, languageCode } = req.query;
    res.render('dashboard', {
        telegramId: telegramId,
        firstName: firstName,
        lastName: lastName,
        username: username,
        languageCode: languageCode
    });
});

// bot.onText(/\start (.+)/, async(msg, match) => {
//     const chatId = msg.chat.id;
//     const referralCode = match[1];
//     let user = await User.findOne({telegramId: chatId});

//     if(!user){
//         user = new User({telegramId: chatId, referredBy: referralCode})
//     if(referralCode){
//         const referrer = await User.findOne({telegramId: referralCode})
//         if(referralCode){
//             referrer.referredUsers.push(chatId);
//             await referrer.save();
//         }
//     }
//     await user.save();
//     bot.sendMessage(chatId, `Welcome! you were referred by ${referralCode}`)
// }
// else{
//    bot.sendMessage(chatId, `Welcome back!`); 
// }
// })
app.listen('3000', ()=>{
    console.log('send!')
})