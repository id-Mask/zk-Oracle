# Digital Identity: Introducing a Zero-Knowledge-Powered Solution
#

## Pitch; TLDR;

Consider the feasibility of proving the absence of financial sanctions without disclosing any personal details; or proving that you are of legal drinking age without disclosing your birthdate; or proving online that you’re a distinct human being coupled with a unique identifier linked to you, as opposed to a bot, allowing for equal representation in voting. Using these proofs could be exceptionally useful for people, businesses as well as government, regulatory and other organizations. 

The proposal is to develop an app that enables the creation of zero-knowledge proofs, empowering individuals to verify statements about their identity without disclosing any personal information. The solution integrates Mina blockchain, zero knowledge proofs, and the widely renowned app in the Baltic States - Smart-ID (with a prospect to expand to other countries/regions and their smart-ID-like-counterparts).

## Problem

In the world of blockchain, identities are basically distilled to nothing more than public addresses. Take for instance this address [0x61b03…e976D2](https://etherscan.io/address/0x61b03d08530f6be861a72f9bb66ba9d998e976d2); we do not know who controls it; it could be your neighbor or prime minister of Lithuania. While intentional and welcomed, pseudonymity in the blockchain world has eventually led to numerous challenges. The inability to link a blockchain address to a real-world identity poses the following problems:

- **Inability to enforce financial sanctions.** How do we know that the person using an address is not related to money laundering, terrorist financing and is not financially sanctioned? Currently, there's no way to know this when transactions are made on [DEX](https://en.wikipedia.org/wiki/Decentralized_finance#Decentralized_exchanges)'es. DEX creators are starting to face [pressure from governments](https://home.treasury.gov/system/files/136/DeFi-Risk-Full-Review.pdf) to put in place controls to make sure that blockchain could not be used for transactions made by sanctioned individuals, even if such transactions would be permissible within the default rules of the blockchain system. Currently there's no blockchain native mechanism to enforce it and sanctioned individuals are free to transact on-chain. The significance of this issue is underscored by a [recent paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364) published just a few weeks ago, co-authored by industry titans.

- **Proof of adulthood.** How do we enforce age restrictions on visiting websites, or buying alcohol, tobacco or other age-restricted items online? Imagine an age restricted content website or a crypto currency-based app that sells age restricted goods online. There's no mechanism to enforce compliance other than employ traditional KYC (Know Your Customer) services which expose your personal data to additional party and generally are too burdensome for this use-case. As a result of this most of the age restricted websites rely on a simple button press to acknowledge one's status as an adult. And [kids lie](https://www.bbc.com/news/technology-63204605) about their age. In the real world, we use ID or passport to prove adulthood, but this has side effect of revealing additional information present in the ID not related to birthdate. Wouldn't it be fair if we were able to prove adulthood by simply providing a QR code on our phone and not revealing any information whatsoever?

- **Proof of unique human.** How do we prove online, that you're not a bot, or do not participate in discourse posing as multiple identities?The absence of a robust and unique digital identities facilitates fraudulent online and on-chain identities; facilitates swarms of bots; prevents blockchain communities from properly implementing equal representation in voting (one-person-one-vote); poses issues implementing blockchain based UBI (Universal Basic Income) and similar initiatives. Without such proofs the internet will likely sprawl with AI-generated misinformation posted by pretenders with intent to deceive and spread disinformation at scale. The scale of the problem including a very detailed explanation is provided in this very recent [blogpost](https://vitalik.ca/general/2023/07/24/biometric.html) by Vitalik Buterin.

The simplest imaginable solution to the problems listed would be to force blockchain users to tie their real-world-identity data like name, surname, birthdate and/or personal identification number to a public address on-chain. Just like we do it with traditional banks and KYC. That would instantly solve this. But this would be a terrible solution, because by default blockchains are public and this would mean that private data is publicly available for anyone to explore. That is why these problems must be tacked differently.

# Solution

The proposal is to develop an app that enables the creation of zero-knowledge proofs, empowering individuals to verify statements about their identity without disclosing any personal information and link them to their blockchain address. The proposed solution combines these underlying technologies: zero-knowledge proofs, Mina blockchain and Smart-ID that helps streamline personal information.
Explaining the details of the proofs

First, let’s illustrate the solution by explaining how would a zero-knowledge-proof of a person being over 21 years of age would be generated. Note that the personal identification information received from smart-ID never leaves the client side, i.e. the user’s computer device. Only the generated proof is being submitted to the blockchain. This is the core idea behind the zero-knowledge-proof. Besides being a simple example, the diagram also explains the app architecture and how Client side, Mina blockchain and smart-ID interaction will play out.  

![](https://i.imgur.com/z3Z35dF.jpg)
<img src="https://i.imgur.com/ED9QG1f.jpg"  width="400">
_Full size diagram: https://miro.com/app/board/uXjVMqJ2miM=/_

Once the transaction (proof) is included into the next block and proof is stored on the blockchain, the user behind the address can use it to prove his/her age is > 21 by referencing his blockchain address. In other words, login with the wallet to a website and all the proofs generated are available for the website to check. Keep in mind, that blockchain is used to store proofs; it is possible to store it on other mediums; the app is not dependent on a single blockchain and is expandable to other mediums of storage; for example, users can even store proofs on their own devices easily because they're just cryptographic text.

Generating the proof of unique human being follows the same steps showed in the diagram. The key feature of this proof is unique human identifier that is a hash value of the person’s name, surname and personal identification number. This unique identifier will be stored on chain and will be the primary tool to prove unique human being. A single person can link this unique identifier to multiple addresses. Anyone will be able to browse and analyze unique identifiers in various ways, for example draw connections between unique humans, count the number of addresses single unique human has, etc.

The generation of proof of not being on a list of sanctioned individuals again follows the same steps as showed in the diagram. Albeit for the purpose of simplicity, one core part of the process is not showed in the diagram. To prove the absence of sanctions, the app will make an additional request to open sanctions API wrapped with zk-Oracle (zk-Oracle is a tool used to securely access external information and provide it in a tamper-proof way on the blockchain). The request to check if person is sanctioned or not requires name, surname and date of birth which is provided by smart-ID exactly as in other proofs. The response of the API, together with other relevant data (data signature created inside zk-Oracle) will be processed further inside the zero-knowledge powered smart contract. 
To better understand the technologies involved and shown in the diagram, let’s tackle them one by one.

# Similar projects

|   | **Proposed solution** | [**zkPass**](https://zkpass.org/) | [**Polygon ID**](https://polygon.technology/polygon-id) | [**Semaphore**](https://semaphore.pse.dev/) | [**Iden3**](https://iden3.io/) | [**WorldCoin**](https://worldcoin.org/) | [**Proof of humanity**](https://proofofhumanity.id/) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Is tied to a proper real-world identity, as opposed to digital identity** | ✅ | ✅ | ❌ | ❌(new digital identity) | ❌(new digital identity) | ✅ | ❌(only partly) |
| **Real-world-identities are unlimited in terms of geographical reach** | ❌Baltic States(potential to expand to other regions) | ❌Australia, Nepal(potential to expand to other regions) | - | - | - | ✅ | ✅ |
| **Works out of the box in the web browser without a need to set up additional infrastructure** | ✅ | ✅ | ❌([issuers](https://0xpolygonid.github.io/tutorials/issuer/issuer-overview/) must set up their own) | ✅ | - | ❌(works using the orb) | ✅ |
| **No requirements for additional software or extensions (besides crypto-wallets)** | ✅ | ❌(zkPass TransGate) | ❌(Polygon ID Wallet) | ✅ | ❌ | ❌(works using the orb) | ✅ |
| **Out of the box communication with other major blockchains** | ❌(will be available soon after Mina-Ethereum bridge) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Provide nearly cost-free immediate proof verification** | ✅ | ❌(other must verify themselves) | ✅ | ✅ | ❌ | -(does not use zero knowledge proofs) | -(does not use zero knowledge proofs) |
| **Data related to proofs is accessible for exploration, statistics and other data science endeavors** | ✅ | ✅(maybe) | ❌(some is private or hardly accessible) | Partly | - | ✅ | ✅ |
| **Offers functionality to create other proofs, not related to the three proofs below** | ❌(limited to listed proofs with prospects to expand) | ✅ (many, many other proofs) | ✅(this is more of a set of tools, rather than product) | ✅(proof of being part of a group identity) | ✅(this is more of a set of tools, rather than product) | ❌ | ❌ |
| **Proof of adulthood** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Proof of unique human-being** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Proof of non-sanctioned individual** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

# Long term vision

The practice of directly sharing plain personal information will be eliminated, except when securely stored within government infrastructure or services like Smart-ID. Instead, personal information will be shared and utilized in the form of zero knowledge proofs stored on the blockchain in the form of SBTs.
