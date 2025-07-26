const urlModel = require('../models/url.model');
const qrcode = require('qrcode');
const IPinfoWrapper = require('node-ipinfo').IPinfoWrapper;
const ipinfo = new IPinfoWrapper(process.env.IPINFO_TOKEN);

async function getShortenList(req, res) {
  try {
    const urls = await urlModel.getAllUrls();
    // res.render('shortenList', { urls });
    res.status(200).send(urls);
  } catch (error) {
    console.error('Error fetching URL list:', error);
    res.status(500).send('Internal server error');
  }
}


async function shortenUrl(req, res) {
  const { originalUrl } = req.body;
  const { port } = req.app.locals;

  if (!originalUrl) {
    return res.render('index', {
      shortUrl: null,
      qrCodeDataUrl: null,
      error: 'originalUrl is required',
    });
  }

  try {
    const shortCode = await urlModel.createShortUrl(originalUrl); // ✅ no callback
    const shortUrl = `http://localhost:${port}/${shortCode}`;
    const qrCodeDataUrl = await qrcode.toDataURL(shortUrl);

    res.render('index', {
      shortUrl,
      qrCodeDataUrl,
      error: null,
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.render('index', {
      shortUrl: null,
      qrCodeDataUrl: null,
      error: 'Error creating short URL',
    });
  }
}

async function redirectUrl(req, res) {
    const { shortCode } = req.params;
    const ipAddress = req.ip;

    try {
        const url = await urlModel.getOriginalUrl(shortCode);
        if (url) {
            res.redirect(url.original_url);
            // Track click asynchronously after redirect
            try {
                const ipInfo = await ipinfo.lookupIp(ipAddress);
                await urlModel.recordClick(url.id, ipAddress, ipInfo.country, ipInfo.city);
            } catch (analyticsError) {
                console.error('Error recording analytics:', analyticsError);
            }
        } else {
            res.status(404).send('Not found');
        }
    } catch (error) {
        console.error('Error redirecting URL:', error);
        res.status(500).send('Internal server error');
    }
}

module.exports = {
    shortenUrl,
    redirectUrl,
    getShortenList
};