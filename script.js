const CLIENT_ID = '275651621298-olt1jq4m86q7eq2fpu0ahdhe7umq41hp.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = '1UxbmDQ07EWTADuFcecBe180Snxai4DFGgm6P8jJyTC8';

// Global variables to track authentication state
let gapiInited = false;
let gisInited = false;
let tokenClient;

// Elements to show authorization buttons
document.getElementById('authorize_button').style.display = 'none';
document.getElementById('signout_button').style.display = 'none';

// Initialize the Google API Client
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

// Initialize Google API Client with API key and discover the Sheets API
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: 'AIzaSyA-SC7BLxz3O6E8ujhcm-DNzw2OID7pP_8', // API Key, still needed for some purposes
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    gapiInited = true;
    maybeEnableButtons();
}

// Initialize Google Identity Services for OAuth2
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // This will be set during authentication request
    });
    gisInited = true;
    maybeEnableButtons();
}

// Enable authentication buttons when both APIs are ready
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

// Handle click to authorize and initiate OAuth2 flow
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        document.getElementById('signout_button').style.display = 'block';
        document.getElementById('authorize_button').style.display = 'none';
    };

    if (gapi.client.getToken() === null) {
        // Prompt user for login and authorization if no token is available
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Token is already available; request access token
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

// Handle sign-out functionality
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken(null);
        document.getElementById('authorize_button').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
    }
}

// Append data to Google Sheets
async function appendData(expense) {
    try {
        // Ensure access token is valid before making request
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Daily_Expenses!A:D',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [expense],
            },
        });
        document.getElementById('status_message').textContent =
            'Expense added successfully!';
    } catch (err) {
        console.error(err);
        document.getElementById('status_message').textContent =
            'Failed to add expense. Check the console for errors.';
    }
}

// Form submission handling to append expense data to sheet
document.getElementById('expense_form').addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const expenseName = document.getElementById('expense_name').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;

    appendData([date, expenseName, category, amount]);
});

// Load both Google API and Identity services on page load
gapiLoaded();
gisLoaded();
