import express from 'express';
import { signJWT, readJWT } from './jwt.js'
import { getGroqChatCompletion } from './groqService.js'

const app = express();

const initApp = () => {
    const maxAge = 24 * 60 * 60;
    const setToken = (res, token) => {
        res.setHeader('Set-Cookie', `token=${token}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`);
    };
    const payloadIsValid = (payload) => {
        return !(!payload || !payload.email || !payload.password || !payload.service);
    };
    const parseBody = (payload) => {
        if (!payloadIsValid(payload)) {
            throw new Error("Invalid Payload!");
        }

        return {
            email: payload.email,
            password: payload.password,
            service: payload.service,
        };
    };
    app.use(express.json());

    app.post("/login", (req, res) => {
        try {
            const token = signJWT(parseBody(req.body));

            setToken(res, token);
            res.send({ message: "Logged In!" });
        } catch (err) {
            setToken(res, "");
            res.status(400).send({ message: "Invalid body!" });
        }
    });
    app.post("/logout", (req, res) => {
        setToken(res, "token");
        res.send({ message: "Logged Out!" });
    });
    app.get("/credentials", (req, res) => {
        const cookieHeader = req.headers.cookie;

        if (!cookieHeader) {
            return res.send('Token not found');
        }

        const cookies = cookieHeader.split(';').reduce((cookies, cookie) => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = value;
            return cookies;
        }, {});

        if (!cookies.token) {
            return res.send('Token not found');
        }

        try {
            const payload = readJWT(cookies.token);

            res.send(parseBody(payload));
        } catch (e) {
            res.status(400).send({ message: "Invalid Token!" });
        }
    });
    app.post("/prompt", async (req, res) => {
        let messages = req.body;

        if (!messages || !messages.length) {
            res.status(400).send({ message: "Body prompt messages empty!" });
        }

        try {
            const response = await getGroqChatCompletion(messages);

            res.send(response.choices.map(choice => choice.message));
        } catch (err) {
            res.status(500).send({ message: "Server error not enable to run promtp! Body must be a array of messages with {role: string, content: string}" });
        }

    });

    const port = process.env.PORT ?? 8080;
    app.listen(port, async () => {
        console.log(`EmailChatbot server listening on port ${port}!`);
    }
    );
};

initApp();
