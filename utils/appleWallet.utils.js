// verify https://pkpassvalidator.azurewebsites.net/
// render https://pkvd.app/creator
// try    https://appetize.io/demo

const express = require('express');
const path = require('path');
const { Template } = require('@walletpass/pass-js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '.')));
app.use(express.json());

// Constants
const CERTIFICATES_PATH = './AppleCerts';
const CERT_FILE = 'signerCert.pem';
const KEY_FILE = 'signerKey.pem';
const PASS_TYPE_ID = process.env.APPLE_WALLET_TYPE_ID;
const TEAM_ID = process.env.APPLE_WALLET_TEAM_ID;
const KEY_PASSWORD = process.env.APPLE_WALLET_KEY_PASSWORD;

app.get('/', async (req, res) => {
  try {
    // const { data } = req.body;
    const data = {
      ipfs: {
        IpfsHash: 'Qmf9JUihuyKCcroRBQLDmVKqjjJ1fZVs44NcbvUbYFFerr',
        PinSize: 42832,
        Timestamp: '2024-07-19T17:26:11.682Z',
      },
      secretKey: 'kmJF^uwSgq59oPfF_)qvnLqXp1ini7j1',
      proof: 'proofOfAge',
    };

    const template = new Template('generic', {
      passTypeIdentifier: PASS_TYPE_ID,
      teamIdentifier: TEAM_ID,
      organizationName: 'Ethenticator',
      description: 'IPFS Data Pass',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(60, 65, 76)',
      labelColor: 'rgb(255, 255, 255)',
    });

    const certPath = path.join(CERTIFICATES_PATH, CERT_FILE);
    const keyPath = path.join(CERTIFICATES_PATH, KEY_FILE);

    // Check files
    await fs.access(certPath);
    await fs.access(keyPath);

    const cert = await fs.readFile(certPath, 'utf-8');
    const key = await fs.readFile(keyPath, 'utf-8');

    // Load certificate and private key separately
    template.setCertificate(cert);
    template.setPrivateKey(key, KEY_PASSWORD); // omit password if not encrypted

    // icon
    await template.images.add('icon', './icon.png');
    await template.images.add('logo', './icon.png');

    const pass = template.createPass({
      serialNumber: uuidv4(),
    });

    pass.logoText = 'ID-Mask';
    pass.barcodes = [
      {
        message: JSON.stringify(data),
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'utf-8',
        altText: 'Hello QR',
      },
    ];

    pass.primaryFields.add({
      key: 'title',
      label: 'Providing identity proofs',
      value: data.proof,
    });

    pass.secondaryFields.add({
      key: 'timestamp',
      label: 'Created',
      value: new Date(data.ipfs.Timestamp).toLocaleDateString(),
    });

    const passBuffer = await pass.asBuffer();

    res.set({
      'Content-Type': 'application/vnd.apple.pkpass',
      'Content-Disposition': `attachment; filename=pass-${uuidv4()}.pkpass`,
      'Content-Length': passBuffer.length,
    });

    res.send(passBuffer);
  } catch (error) {
    console.error('Error creating pass:', error);
    res
      .status(500)
      .json({ error: 'Failed to create pass', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
