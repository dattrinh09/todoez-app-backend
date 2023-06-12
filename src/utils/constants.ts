export const jwtConstants = {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES,
};

export const rtConstants = {
    secret: process.env.RT_SECRET,
    expires: process.env.RT_EXPIRES,
};

export const mailerConstants = {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
};

export const googleOauthConstants = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
};