# **Revolutionizing Digital Identity: Introducing a Zero-Knowledge-Powered Solution**
#

# **Pitch; TLDR;**

Consider the feasibility of proving the absence of financial sanctions or specific criminal records without disclosing any personal details; or proving that you are of legal drinking age without disclosing your birthdate; or proving online that you're a distinct human being coupled with a unique identifier linked to you, as opposed to a bot, allowing for equal representation in voting. Using these proofs could be exceptionally useful for people, businesses as well as government, regulatory and other organizations.

The proposal is to develop an app that enables the creation of zero-knowledge proofs, empowering individuals to verify statements about their identity without disclosing any personal information. The solution integrates Mina blockchain, zero knowledge proofs, and the widely renowned app in the Baltic States - Smart-ID (with a prospect to expand to other countries/regions and their smart-ID-like-counterparts).

# **The problem**

In the world of blockchain, identities are basically distilled to nothing more than public addresses. Take for instance this address [0x61b03…e976D2](https://etherscan.io/address/0x61b03d08530f6be861a72f9bb66ba9d998e976d2); we do not know who controls it; it could be your neighbor or prime minister of Lithuania. While intentional and welcomed, [pseudonymity](https://dictionary.cambridge.org/dictionary/english/pseudonymity) in the blockchain world has eventually led to numerous challenges. The inability to link a blockchain address to a real-world identity poses the following problems:

- **Financial sanctions and inability to enforce it.** How do we know that the person using an address is not related to money laundering, terrorist financing and is not financially sanctioned? Currently, there's no way to know this when transactions are made on [DEX](https://en.wikipedia.org/wiki/Decentralized_finance#Decentralized_exchanges)'es. DEX creators are starting to face [pressure from governments](https://home.treasury.gov/system/files/136/DeFi-Risk-Full-Review.pdf) to put in place controls to make sure that blockchain could not be used for transactions made by sanctioned individuals, even if such transactions would be permissible within the default rules of the blockchain system. Currently there's no blockchain native mechanism to enforce it and sanctioned individuals are free to transact on-chain. The significance of this issue is underscored by a [recent paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364) published just a few weeks ago, co-authored by industry titans.

- **Proof of adulthood.** How do we enforce age restrictions on visiting websites, or buying alcohol, tobacco or other age-restricted items online? Imagine an age restricted content website or a crypto currency-based app that sells age restricted goods online. There's no mechanism to enforce compliance other than employ traditional KYC (Know Your Customer) services which expose your personal data to additional party and generally are too burdensome for this use-case. As a result of this most of the age restricted websites rely on a simple button press to acknowledge one's status as an adult. And [kids lie](https://www.bbc.com/news/technology-63204605) about their age. In the real world, we use ID or passport to prove adulthood, but this has side effect of revealing additional information present in the ID not related to birthdate. Wouldn't it be fair if we were able to prove adulthood by simply providing a QR code on our phone and not revealing any information whatsoever?

- **Proof of unique human.** How do we prove online, that you're not a bot, or do not participate in discourse posing as multiple identities?The absence of a robust and unique digital identities facilitates fraudulent online and on-chain identities; facilitates swarms of bots; prevents blockchain communities from properly implementing equal representation in voting (one-person-one-vote); poses issues implementing blockchain based UBI (Universal Basic Income) and similar initiatives. Without such proofs the internet will likely sprawl with AI-generated misinformation posted by pretenders with intent to deceive and spread disinformation at scale. The scale of the problem including a very detailed explanation is provided in this very recent [blogpost](https://vitalik.ca/general/2023/07/24/biometric.html) by Vitalik Buterin.

The simplest imaginable solution to the problems listed would be to force blockchain users to tie their real-world-identity data like name, surname, birthdate and/or personal identification number to a public address on-chain. Just like we do it with traditional banks and KYC. That would instantly solve this. But this would be a terrible solution, because by default blockchains are public and this would mean that private data is publicly available for anyone to explore. That is why these problems must be tacked differently.

# **The solution**

We propose to build an app that allows users to prove statements about themselves using zero knowledge proofs (i.e. not sharing any personal information except for the proof) and link them to their blockchain address. The proposed solution combines these underlying technologies: zero-knowledge proofs, Mina blockchain and Smart-ID that helps streamline personal information.

## **Explaining the details of the proofs**

First, let's illustrate the solution by explaining how would a zero-knowledge-proof of a person being over 21 years of age would be generated. Note that the personal identification information received from smart-ID never leaves the client side, i.e. the user's computer device. Only the generated proof is being submitted to the blockchain. This is the core idea behind the zero-knowledge-proof.

Besides being a simple example, the diagram also explains the app architecture and how Client side, Mina blockchain and smart-ID interaction will play out.

![](https://i.imgur.com/pFa3Gj5.jpg)

_Full size diagram:_ [_https://miro.com/app/board/uXjVMqJ2miM=/_](https://miro.com/app/board/uXjVMqJ2miM=/)or [https://i.imgur.com/pFa3Gj5.jpg](https://i.imgur.com/pFa3Gj5.jpg)

Once the transaction (proof) is included into the next block and proof is stored on the blockchain, the user behind the address can use it to prove his/her age is \> 21 by referencing his blockchain address. In other words, login with the wallet to a website and all the proofs generated are available for the website to check.

Generating the proof of unique human being follows the same steps showed in the diagram. The key feature of this proof is unique human identifier that is a hash value of the person's name, surname and personal identification number. This unique identifier will be stored on chain and will be the primary tool to prove unique human being. A single person can link this unique identifier to multiple addresses. Anyone will be able to browse and analyze unique identifiers in various ways, for example draw connections between unique humans, count the number of addresses single unique human has, etc.

The generation of proof of not being on a list of sanctioned individuals again follows the same steps as showed in the diagram. Albeit for the purpose of simplicity, one core part of the process is not showed in the diagram. To prove the absence of sanctions, the app will make an additional request to open sanctions API wrapped with zk-Oracle (zk-Oracle is a tool used to securely access external information and provide it in a tamper-proof way on the blockchain). The request to check if person is sanctioned or not requires name, surname and date of birth which is provided by smart-ID exactly as in other proofs. The response of the API, together with other relevant data (data signature created inside zk-Oracle) will be processed further inside the zero-knowledge powered smart contract.

To better understand the technologies involved and shown in the diagram, let's tackle them one by one.

## **What are zero knowledge proofs and what is Mina protocol?**

In case the readers are not familiar with it, first let's understand what zero knowledge proofs are (skip this part if you already know). The formal definition is as follows: a zero-knowledge proof is a method by which one party (the prover) can prove to another party (the verifier) that a given statement is true, while avoiding conveying to the verifier any information beyond the mere fact of the statement's truth.

Imagine this: you're sharing a spreadsheet, let's say it's about a financial calculation, with a friend. They're going to put in some secret numbers and then tell you the result of the calculation. If you send them a regular spreadsheet, they could easily change the formulas, mess with the numbers, and then give you the wrong answer. This lack of security makes the process vulnerable.

But, if you give them a zero-knowledge program instead of a spreadsheet, the dynamics change. This program is designed in a way that no one can mess with it. It's like having a built-in system that checks for any changes and stops anyone from tampering with it. This keeps the program safe and any attempts to cheat are instantly caught.

In this situation, your friend can run the special program on their own computer, keeping their secret numbers safe. They'll get the right answer without being able to mess with the secret calculations inside. This not only protects the accuracy of your calculations but also keeps their secret numbers private. Basically, zero-knowledge proofs are a super strong and safe way to share private information and do important calculations without any worries.

How does [Mina Protocol](https://docs.minaprotocol.com/about-mina) come into play? It is an L1 blockchain that integrates the power of zero-knowledge proofs into the blockchain. Zero-knowledge proofs are not just an add-on but are deeply ingrained as a fundamental feature of the Mina blockchain itself. Leveraging the tools Mina offers, it becomes feasible to run smart contracts powered by zero knowledge proofs and store the proofs on Mina blockchain.

_The technologies and tools discussed here are technically heavy and not easy to grasp. For better and more in-depth explanations of zero knowledge proofs and related concepts please see_ [_this video_](https://www.youtube.com/watch?v=fOGdb1CTu5c) _by a famous professor and computer scientist or this_ [_blogpost_](https://ethereum.org/en/zero-knowledge-proofs/) _from Ethereum's foundation. For more in-depth explanations of Mina smart contracts and how zero knowledge proofs are related to it see this_ [_blogpost_](https://0xhegemon.substack.com/p/smart-contracts-coming-to-mina)_, or this_ [_blogpost_](https://docs.staketab.com/academy/mina/zkapps)_. For more information on what are zk-Oracles see this_ [_blogpost_](https://minaprotocol.com/blog/what-are-zkoracles)_._

## **What is smart-ID?**

[Smart-ID](https://www.smart-id.com/) has emerged as the single dominant authentication service among people in the Baltic countries. It boasts widespread adoption with the absolute majority of the adult population (aged 15-64 years) - over 3.3 million people - utilizing this service. The fundamental concept behind Smart-ID is to securely provide personal information to online services by approving and digitally signing data requests through a mobile phone, thereby proving one's identity beyond doubt.

To illustrate, ** ** when I wish to log in to my bank account, I provide my personal identification number. Subsequently, a push notification appears on my phone, and by entering my secret PIN, I authorize the bank to access my personal data, including my name, surname, nationality, personal identification number, and date of birth.

Smart-ID provides a secure way to authenticate and authorize online activities using your mobile phone. Through this service, people can log in to government e-services, banks, authorize bank transfers, digitally sign official documents, and more. The interaction is equivalent to physically presenting a physical ID card or passport. Nationally accepted, it has become the prevailing method of verifying one's identity online.

# **The users**

| **User group** | **Needs** | **Potential size** |
| --- | --- | --- |
| **Blockchain Users** | Secure and private way to prove their identity and attributes without revealing sensitive personal information. They need to comply with regulations and ensure their transactions aren't associated with illicit activities. | This group is substantial and continues to grow with the adoption of blockchain and cryptocurrencies. Potential size:[**\>420 million**](https://triple-a.io/crypto-ownership-data/) |
| **DEX'es and their users** | DEX developers and users need a simple and straightforward mechanism to prevent transactions involving sanctioned individuals and adhere to regulatory requirements by the governments. | DEX users are a significant subset of the broader blockchain user base, likely in the hundreds of thousands to millions. Number of DEX'es: [**\>100**](https://www.alchemy.com/best/decentralized-exchanges-dexs)Number of DEX users: [**\>5 million**](https://www.statista.com/statistics/1297745/defi-user-number/) |
| **DAOs and their users** | DAO participants require a secure way to verify their identity when participating in governance processes, voting, and decision-making. Ensuring one-person-one-vote is essential for maintaining fairness and preventing manipulation. | The size of this group varies depending on the popularity of DAOs, but it's a growing segment within the blockchain community. Number of DAOs: [**\>1000**](https://blog.cfte.education/top-daos-projects-2023/#:~:text=As%20of%20January%202023%2C%20the,to%20explore%20about%20its%20projects!)Number of DAO users: [**\>6 million**](https://www.lifespan.io/news/dao-funding-facts-and-future-2023/#:~:text=As%20of%20April%202023%2C%20the,active%20voters%20and%20proposal%20makers.) |
| **Government and Regulatory Institutions** | Government agencies and regulatory bodies need efficient tools to verify the identity of individuals engaging in blockchain-related activities, prevent money laundering, and enforce age restrictions or other regulations in online interactions. | This group consists of government entities at various levels and sizes. The potential size is significant but specific to each jurisdiction. |

# **Comparison with competitors**

Not only the problems are relatively new, but only recent technical developments allow for implementing solutions. Therefore, the market has just started to form and currently is at the very early stages. The solutions vary widely in their functionality and what they offer. Due to these conditions, the comparison of different solutions is not trivial.

Important fact: none of the solutions are fully developed; at most in pre-alpha. All of the players are currently building their products or toolkits. Therefore, no proper user statistics exist and comparison is done by other features only. In practice, currently there is only one general and indirect competitor – zkPass. Note that the set of proofs they offer is completely different and solve other problems.

|   | **Our proposed solution** | [**zkPass**](https://zkpass.org/) | [**Polygon ID**](https://polygon.technology/polygon-id) | [**Semaphore**](https://semaphore.pse.dev/) | [**Iden3**](https://iden3.io/) | [**WorldCoin**](https://worldcoin.org/) | [**Proof of humanity**](https://proofofhumanity.id/) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Is tied to a proper real-world identity, as opposed to digital identity** | ✅ | ✅ | ❌ | ❌(new digital identity) | ❌(new digital identity) | ✅ | ❌(only partly) |
| **Real-world-identities are unlimited in terms of geographical reach** | ❌Baltic States (potential to expand to other regions) | ❌Australia, Nepal (potential to expand to other regions) | - | - | - | ✅ | ✅ |
| **Works out of the box in the web browser without a need to set up additional infrastructure** | ✅ | ✅ | ❌([issuers](https://0xpolygonid.github.io/tutorials/issuer/issuer-overview/) must set up their own) | ✅ | - | ❌(works using the orb) | ✅ |
| **No requirements for additional software or extensions (besides crypto-wallets)** | ✅ | ❌(zkPass TransGate) | ❌(Polygon ID Wallet) | ✅ | ❌ | ❌(works using the orb) | ✅ |
| **Out of the box communication with other major blockchains** | ❌(will be available soon after Mina-Ethereum bridge) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Provide nearly cost-free immediate proof verification** | ✅ | ❌(other must verify themselves) | ✅ | ✅ | ❌ | -(does not use zero knowledge proofs) | -(does not use zero knowledge proofs) |
| **Data related to proofs is accessible for exploration, statistics and other data science endeavors** | ✅ | ✅(maybe) | ❌(some is private or hardly accessible) | Partly | - | ✅ | ✅ |
| **Offers functionality to create other proofs, not related to the three proofs below** | ❌(limited to listed proofs with prospects to expand) | ✅ (many, many other proofs) | ✅ (this is more of a set of tools, rather than product) | ✅ (proof of being part of a group identity) | ✅ (this is more of a set of tools, rather than product) | ❌ | ❌ |
| **Proof of adulthood** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Proof of unique human-being** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Proof of non-sanctioned individual** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

The proposed app solves all of the problems explained before. The proposed solution would be limited to the citizens of the Baltic States with a very viable prospect of expanding into other regions of the world in the later stages of development. Also, besides the three proofs discussed previously, the proposed solution allow to include other proofs related to real-world-identity in the future. As for the user perspective, the proposed solutions offer simple and straightforward interface to create and use the proofs. In the Baltic States, the product is the first to offer such solution. On the world stage, this product is unique in terms of providing proofs related to unique human being and being a non-sanctioned individual. Competitors offer no such solution.

# **Oslo guide innovation criteria**

1. **Novelty:** To determine if the proposed app is a new innovation, consider whether it introduces a novel solution to a problem or a new way of doing things. In this case, the app combines a number of emerging technologies (zero knowledge proofs, blockchain and Smart-ID) to create a unique solution for verifying identity statements without sharing personal information. This combination of technologies is not common and is completely new, making it a novel approach.

1. **Significant Improvement:** Assess whether the proposed app represents a significant improvement over existing solutions or processes. In this case, the use of zero knowledge proofs and blockchain technology for verifying statements is a significant improvement over traditional methods that often require sharing sensitive personal information. This innovation enhances privacy and security, representing a significant improvement.

1. **Market Impact:** Consider the potential impact of the proposed app on the market and users. Does it address a pressing need or solve a critical problem? The app's ability to preserve privacy and trust in digital interactions is likely to have a substantial impact, as it can be applied in various sectors, such as identity verification, online transactions, and much more.

1. **Technological Advancement:** Evaluate whether the proposed app leverages advanced or cutting-edge technologies. Zero knowledge proofs and blockchain technology are considered advanced and are at the forefront of digital innovation. Combining these technologies demonstrates a high level of technological advancement.

In summary, the proposed app that utilizes cutting edge technology and exhibits characteristics of innovation not only in the local market but on a global scale. It introduces a novel approach (streamline real-world-identity data), leverages advanced technologies (zero knowledge proofs and blockchains), and has the potential to make a substantial impact worldwide. The level of innovation can be considered high, given the combination of emerging technologies and the potential to transform how personal information is verified and managed in digital interactions on a global scale.

# **Long term vision**

The practice of directly sharing plain personal information will be eliminated, except when securely stored within government infrastructure or services like Smart-ID. Instead, personal information will be shared and utilized in the form of zero knowledge proofs stored on the blockchain. Zero knowledge proofs about individuals' identities will be stored on the blockchain in a form of [soul-bound-tokens](https://vitalik.ca/general/2022/01/26/soulbound.html).

Every transaction (once a certain threshold is reached) will require the account to hold a proofs of individual behind the address not being financially sanctioned internationally. Voting and governance processes on chain that wants equal representation will require the account to hold a proof that represents unique human being. Proving your age online will be done by connecting a wallet to the website.

# **Monetization**

Charge a fee for proofs created. Users could be allowed to generate proofs for a single address at no cost. However, if an individual wants to associate proofs with two or more addresses, they would be required to pay a fee.

# **Additional information**

## **What changed recently that makes this feasible right now?**

Two reasons:

1. Mina protocol offers breaking new technology with zero-knowledge-proofs baked into the protocol, allowing for zero-knowledge-proofs to be generated as part of the smart contracts. No other blockchain or service offers such functionalities.
2. Smart-ID has become very popular and is used by majority of the population in the Baltic states which makes it very accessible and easy to utilize. No other place has embraced digital authentication such as smart-ID as much as the Baltic states.

## **What is your unfair advantage in solving this problem?**

Knowledge and understanding of two seemingly totally unrelated technologies: smart-ID and Mina protocol with zero-knowledge-proofs baked in into smart contracts. Another unique advantage point is being in the Baltic states where an easy-to-use and the most prevalent online authentication service smart-ID is so popular that absolute majority of the total population is using it every day. There are not many countries, where a single online authentication service has gained so much popularity. Having access to whole population that is available to create the proofs give us an advantage.

Also:

1. **Technological knowledge** empowers us to comprehend the intricacies of the problem and come up with innovative solutions.
2. **Bravery in tackling complex issues** allows us to approach the problem with a fresh perspective and the willingness to explore unconventional avenues.
3. **First mover advantage** because no one or unknown teams are solving this problem using the means proposed. The proposed product/service does not exist today.

## **Product name**

🌌 **ShadowCloak** : zk-powered-identity

🐦 **anonBird:** zk-powered-identity

🦸 **CloakMask** : zk-powered-identity

🦰 **idMask** : zk-powered-identity

## **Pre-prototype experiments:**

[https://github.com/RaidasGrisk/mina-smart-ID](https://github.com/RaidasGrisk/mina-smart-ID)

[https://smart-id-oracle-2qz4wkdima-uc.a.run.app/api-docs/](https://smart-id-oracle-2qz4wkdima-uc.a.run.app/api-docs/)
