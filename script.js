const CLIENT_ID = '275651621298-olt1jq4m86q7eq2fpu0ahdhe7umq41hp.apps.googleusercontent.com';
const API_KEY = 'AIzaSyA-SC7BLxz3O6E8ujhcm-DNzw2OID7pP_8';
const SPREADSHEET_ID = '1UxbmDQ07EWTADuFcecBe180Snxai4DFGgm6P8jJyTC8';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.display = 'none';
document.getElementById('signout_button').style.display = 'none';

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        document.getElementById('signout_button').style.display = 'block';
        document.getElementById('authorize_button').style.display = 'none';
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to log in
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip the login flow
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken(null);
        document.getElementById('authorize_button').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
    }
}

async function appendData(expense) {
    try {
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
            'Failed to add expense.';
    }
}

document.getElementById('expense_form').addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const expenseName = document.getElementById('expense_name').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;

    appendData([date, expenseName, category, amount]);
});

gapiLoaded();
gisLoaded();
