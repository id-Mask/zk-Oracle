const jwt = require('jsonwebtoken')
const { GoogleAuth } = require('google-auth-library')
require('dotenv').config()


class GoogleWallet {
  constructor() {
    this.issuerId = process.env.GOOGLE_ISSUER_ID;
    this.classId = `${this.issuerId}.id_mask_pass_v0`;
    this.baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';
    this.credentials = require('../.googleCreds.json');
    this.httpClient = new GoogleAuth({
      credentials: this.credentials,
      scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
    });
  }

  async createPassClass() {
    let genericClass = {
      'id': `${this.classId}`,
    };

    try {
      // Check if the class exists already
      await this.httpClient.request({
        url: `${this.baseUrl}/genericClass/${this.classId}`,
        method: 'GET'
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Class does not exist, create it
        await this.httpClient.request({
          url: `${this.baseUrl}/genericClass`,
          method: 'POST',
          data: genericClass
        });
      }
    }
  }

  async createPassObject(identifier, qrCodeData) {
    let objectId = `${this.classId}.${identifier}`;

    const proofNameMap = {
      proofOfAge: 'Proof of Age',
      proofOfSanctions: 'Proof of OFAC non-Sanctions',
      proofOfUniqueHuman: 'Proof of Unique Human',
      proofOfUniqueHuman: 'Proof of Unique Human',
      proofOfNationality: 'Proof of Nationality',
    }
    console.log(proofNameMap[qrCodeData.proof])

    let genericObject = {
      'id': `${objectId}`,
      'classId': this.classId,
      'genericType': 'GENERIC_TYPE_UNSPECIFIED',
      'hexBackgroundColor': '#5F5FEA',
      'logo': {
        'sourceUri': {
          'uri': 'https://avatars.githubusercontent.com/u/144892177?s=200&v=4'
        }
      },
      'cardTitle': {
        'defaultValue': {
          'language': 'en',
          'value': 'Id-mask'
        }
      },
      'subheader': {
        'defaultValue': {
          'language': 'en',
          'value': 'Providing identity proofs'
        }
      },
      'header': {
        'defaultValue': {
          'language': 'en',
          'value': proofNameMap[qrCodeData.proof]
        }
      },
      'barcode': {
        'type': 'QR_CODE',
        'value': `${JSON.stringify(qrCodeData)}`
      },
    };

    // Create the signed JWT and link
    const claims = {
      iss: this.credentials.client_email,
      aud: 'google',
      origins: [],
      typ: 'savetowallet',
      payload: {
        genericObjects: [genericObject]
      }
    };

    const token = jwt.sign(claims, this.credentials.private_key, { algorithm: 'RS256' });
    return token;
  }
}

module.exports = {
  GoogleWallet
}