import type { Request,Response } from "express";
import Url from "../models/url.model.js";

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
    
    if(!savedURL){
        return res.status(400).json({
            success: false,
            error: "Error while saving user in database"
        })
    }
    
    return res.render("home", {
        url: shortUrl
    });
    // return res.status(201).json({
    //     originalUrl,
    //     shortUrl,   
    //     message: 'Short URL created successfully'
    // });
};

export const redirectURL = async (req: Request, res: Response) => {
    const { urlCode } = req.params;
    if (!urlCode) {
        return res.status(400).json({ error: 'URL code is required' });
    }

   const existingUrl = await Url.findOne({ shortUrl: urlCode });
    if (!existingUrl) {
        return res.status(404).json({ error: 'Short URL not found' });
    }
    const originalUrl = existingUrl.originalUrl;
    if (!originalUrl) {
        return res.status(404).json({ error: 'Original URL not found' });
    }
    res.status(302).redirect(originalUrl);
};

