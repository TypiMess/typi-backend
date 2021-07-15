const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a random string [A-Za-z0-9]
 * @param length the length of random string
 * @returns a random string
 */
export function GenerateRandomString(length: number) {
    
    let result = "";
    
    for (let i = 0; i < length; i++)
    {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
 * Check if username and password matches predefined criteria
 * @param username a string contains username
 * @param password a string contains raw text password
 * @returns true if valid, false otherwise
 */
export function CheckCredsValid(username: string, password: string)
{
    return (username && password && RegExp("^(\\w|\\d){3,32}$").test(username) && password.length >= 7);
}