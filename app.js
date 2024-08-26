const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');


const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

const botToken = '7303777188:AAEKEQ0ELLi8YV7tFsQrlTgcrnRY-Xh-AdE';
const bot = new TelegramBot(botToken, {polling: true});
mongoose.connect('mongodb+srv://fawazogunleye:Aabimbola2022@cluster0.caz9xfe.mongodb.net/heirstonhon?retryWrites=true&w=majority&appName=Cluster0');
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
        const user = req.body.user;
        if(user){
                // Redirect to the dashboard with user data as query parameters
        res.redirect(`/dashboard?telegramId=${user.id}&firstName=${user.first_name}&lastName=${user.last_name || 'N/A'}&username=${user.username || 'N/A'}&languageCode=${user.language_code || 'N/A'}`);
        }
        else {
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

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id.toString(); // Convert to string for MongoDB consistency
    const referralCode = match[1]; // Capture the referral code, if provided
    const username = msg.chat.username;
    try {
        // Check if the user already exists in the database
        let user = await User.findOne({ telegramId: chatId });

        if (!user) {
            // If the user doesn't exist, create a new user
            user = new User({ telegramId: chatId, username: username, referredBy: referralCode || null });

            if (referralCode) {
                // If there is a referral code, find the referrer and add this user to their referredUsers list
                const referrer = await User.findOne({ telegramId: referralCode });

                if (referrer) {
                    referrer.referredUsers.push(chatId);
                    await referrer.save();
                }
            }

            await user.save();
            bot.sendMessage(chatId, referralCode ? `Welcome! You were referred by user ${referralCode}.` : 'Welcome!');
        } else {
            bot.sendMessage(chatId, `Welcome back!: ${chatId}`);
        }
    } catch (error) {
        console.error('Error handling /start command:', error);
        bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
});

app.listen('3000', ()=>{
    console.log('start!')
})