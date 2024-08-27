# Description

This Node.js and Express.js router provide various endpoints for interacting with blockchain data, primarily focused on Ethereum and other EVM-compatible networks. It utilizes multiple APIs and SDKs to fetch and process blockchain information.


## Features
- Fetch investment pool details from OKX
- Retrieve token holder information
- Get asset lists for different Aave V3 networks
- Fetch token balances for wallet addresses
- Retrieve transaction histories


## Dependencies
- express
- axios
- alchemy-sdk
- @covalenthq/client-sdk
- ethers
- @bgd-labs/aave-address-book
- xlsx


## Endpoints
1. `/api/pool/list` (POST): Fetches investment pool details from OKX and processes them based on the evm networks.

2. `/api/pool/token_holders` (POST): Retrieves token holder information using the Covalent API (known as GoldRush) using @covalenthq/client-sdk.

3. `/api/pool/get_all_networks` (GET): Returns a list of all available networks from the Aave address book using @bgd-labs/aave-address-book.

4. `/api/pool/get_network_assets` (POST): Fetches assets for a specific Aave V3 network.

5. `/api/pool/get_all_assets` (GET): Retrieves detailed asset information for Aave V3 networks, including token holders and transaction histories.

6. `/api/pool/get_balances` (POST): Fetches token balances for a given wallet address.

7. `/api/pool/get_all_balances` (GET): Retrieves token balances across multiple networks for multiple wallet addresses (reads from an Excel file).


## Usage
To use this router, integrate it into your Express.js application and ensure all required environment variables are set, including API keys for various services (OKX, Alchemy, Covalent, Etherscan).


## Note
This code includes commented-out sections for alternative API calls (e.g., Etherscan, Alchemy) which can be uncommented and used if needed.


## Setup and Installation

1. **Install Node.js:**
   Download and install Node.js (Version 18 or higher) from the [official website](https://nodejs.org/en).

2. **Clone the Repository:**
   git clone https://github.com/thaksheel/dex-sloother1
   cd dex-sloother1

3. **Install Dependencies:**
   Open command and type this:
   npm install

4. **Configure Environment Variables:**
- Copy the `.env.example` file to `.env`:
  ```
  cp .env.example .env
  ```
- Open the `.env` file and add the following information:
  ```
  REACT_APP_PORT_API=4001  # Specify your desired port number
  API_KEY_ALCHEMY=your_alchemy_api_key
  API_KEY_COVALENTHQ=your_covalenthq_api_key
  API_KEY_ETHERSCAN=your_etherscan_api_key
  ```

To obtain the necessary API keys:
- Alchemy API key: Sign in at [Alchemy Dashboard](https://dashboard.alchemy.com/apps)
- CovalentHQ API key: Sign in at [GoldRush Platform](https://goldrush.dev/platform/apikey/)
- Etherscan API key: Sign in at [Etherscan](https://etherscan.io/myapikey)

5. Running the Server
Start the server with the following command:
npm run start

6. Using the API
You can interact with these API endpoints using tools like Postman, cURL, or any HTTP client in your application. Make sure to include any required parameters in your requests as specified in the router implementation.

## Contributing
Contributions to improve the Blockchain API Server are welcome. Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request
