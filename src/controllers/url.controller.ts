import type { Request, Response } from "express";
import Url from "../models/url.model.js";
import redis from "../lib/client.js";

export const createURL = async (req: Request, res: Response) => {

    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    // Generate a random string using base62 encoding
    const generateShortUrl = () => {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };

    const urlCode = generateShortUrl();

    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    const savedURL = await Url.create({
        originalUrl,
        shortUrl: urlCode,
    });

    if (!savedURL) {
        return res.status(400).json({
            success: false,
            error: "Error while saving user in database"
        })
    }

    return res.render("home", {
        url: shortUrl
    });
};

export const redirectURL = async (req: Request, res: Response) => {
    const { urlCode } = req.params;

    if (!urlCode) {
        return res.status(400).json({ error: 'URL code is required' });
    }

    try {
        // Check Redis cache first
        const cachedUrl = await redis.get(urlCode);
        if (cachedUrl) {
            console.log("Cache hit ", urlCode);
            return res.status(302).redirect(cachedUrl);
        }
        console.log("Cache miss", urlCode);
        const existingUrl = await Url.findOne({ shortUrl: urlCode });
        if (!existingUrl) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        const originalUrl = existingUrl.originalUrl;
        // Store in Redis cache for future requests
        await redis.set(urlCode, originalUrl, 'EX', 60 * 60); // 1 Hour
        return res.status(302).redirect(originalUrl);
    } catch (error) {
        console.error("Error occurred while redirecting URL:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

