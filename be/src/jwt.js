import jwt from 'jsonwebtoken'

const secretKey = process.env.JWT_TOKEN;
export function signJWT(payload) {
    const options = {
        expiresIn: '24h'
    };

    const token = jwt.sign(payload, secretKey, options);
    return token;
}
export function readJWT(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
      } catch (err) {
        throw new Error("Invalid Token!");
      }
}


