# Box Demo

The purpose of this app is to demonstrate generating app user tokens for the Box API.

## Setup

The setup in box is somewhat convoluted. 

1. Go to the Box Developer Console (https://app.box.com/developers/console) and go to the Configuration tab for your App
2. Enable "OAuth 2.0 with JWT (Server Authentication)"
3. Generate a Pubic/Private Keypair
4. Optionally configure the CORS Domains if you plan to call the Box Platform from the browser (eg: http://localhost:7001)
5. Download the "App Settings" as a JSON file ("Download as JSON")
6. Go to https://app.box.com/master/settings/openbox (the Admin console)
7. Under `Custom Applications` click Authorize New App.
8. For the API Key, enter the Client ID of the app you defined above.