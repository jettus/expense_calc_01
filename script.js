const CLIENT_ID = '275651621298-olt1jq4m86q7eq2fpu0ahdhe7umq41hp.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = '1UxbmDQ07EWTADuFcecBe180Snxai4DFGgm6P8jJyTC8'; // Your Google Sheet ID

// Global variables to track authentication state
let gapiInited = false;
let gisInited = false;
let tokenClient;

// Initialize the Google API Client
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

// Initialize Google API Client with OAuth2 (no API key needed)
async function initializeGapiClient() {
    await gapi.client.init({
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
        callback: (resp) => {
            if (resp.error !== undefined) {
                throw resp;
            }
            document.getElementById('signout_button').style.display = 'block';
            document.getElementById('authorize_button').style.display = 'none';
        },
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
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
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
        const token = gapi.client.getToken();
        if (!token) {
            document.getElementById('status_message').textContent = 'Please authorize first.';
            return;
        }

        // Ensure token is valid before making request
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
