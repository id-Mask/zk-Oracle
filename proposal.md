# **Pitch; TLDR;**

Consider the feasibility of proving the absence of financial sanctions or specific criminal records without disclosing any personal details; or proving that you are of legal drinking age without disclosing your birthdate; or proving online that you're a distinct human being coupled with a unique identifier linked to you, as opposed to a bot, allowing for equal representation in voting. Using these proofs could be exceptionally useful for people, businesses as well as government, regulatory and other organizations.

The proposal is to develop an app that enables the creation of zero-knowledge proofs, empowering individuals to verify statements about their identity without disclosing any personal information. The solution integrates Mina blockchain, zero knowledge proofs, and the widely renowned app in the Baltic States - Smart-ID.

# **The problem**

In the world of blockchain, identities are basically distilled to nothing more than public addresses. Take for instance this address [0x61b03…e976D2](https://etherscan.io/address/0x61b03d08530f6be861a72f9bb66ba9d998e976d2); we do not know who controls it; it could be your neighbor or prime minister of Lithuania. While intentional and welcomed, anonymity in the blockchain world has eventually led to numerous challenges. The inability to link a blockchain address to a real-world identity poses the following problems:

- **Financial sanctions and inability to enforce it.** How do we know that the person using an address is not related to money laundering, terrorist financing and is not financially sanctioned? Currently, there's not way to know this when transactions are made on [DEX](https://en.wikipedia.org/wiki/Decentralized_finance#Decentralized_exchanges)'es. DEX creators are starting to face pressure from governments to put in place controls to make sure that blockchain could not be used for transactions made by sanctioned individuals, even if such transactions would be permissible within the default rules of the blockchain system. Currently there's no blockchain native mechanism to enforce it and sanctioned individuals are free to transact on-chain.

- **Proof of adulthood.** How do we enforce age restrictions on visiting websites, or buying alcohol and tobacco online? Imagine a crypto currency-based app that sells age restricted goods online. There's no way to enforce compliance other than employ traditional KYC (Know Your Customer) services which expose your personal data to additional party and generally are too burdensome for this use-case. As a result of this most of the age restricted websites rely on a simple button press to acknowledge one's status as an adult. And [kids lie](https://www.bbc.com/news/technology-63204605) about their age.

- **Proof of unique human.** How do we prove online, that you're not a bot, or do not participate in discourse posing as multiple identities?The absence of a robust and unique digital identities facilitates fraudulent online and on-chain identities; facilitates swarms of bots; prevents blockchain communities from properly implementing equal representation in voting (one-person-one-vote); poses issues implementing blockchain based UBI and similar initiatives.

# **The solution**

We propose to build an app that allows users to prove statements about themselves using zero knowledge proofs (i.e. not sharing any personal information except for the proof) and link them to their blockchain address. The proposed solution combines two underlying technologies: Mina blockchain that enables the use of zero knowledge proofs and Smart-ID that helps streamline personal information.

## **Explaining the details of the proofs**

First, let's illustrate the solution by explaining how would a zero-knowledge-proof of a person being over 21 years of age would be generated. Note that the personal identification information received from smart-ID never leaves the client side, i.e. the user's computer device. Only the generated proof is being submitted to the blockchain. This is the core idea behind the zero-knowledge-proof.

Besides being a simple example, the diagram also explains the app architecture and how Client side, Mina blockchain and smart-ID interaction will play out.

![](https://i.imgur.com/pFa3Gj5.jpg)

_Full size diagram:_ [_https://miro.com/app/board/uXjVMqJ2miM=/_](https://miro.com/app/board/uXjVMqJ2miM=/)

Once the transaction (proof) is included into the next block, the user behind the address can use it to prove his/her age is \> 21 by referencing his blockchain address. In other words, login with the wallet to a website and all the proofs generated are available for the website to check.

Generating the proof of unique human being follows the same steps showed in the diagram. The key feature of this proof is unique human identifier that is a hash value of the persons name, surname and personal identification number. This unique identifier will be stored on chain and will be the primary tool to prove unique human being. Single person can associate this unique identifier with multiple addresses. Anyone will be able to browse and analyze unique identifiers in various ways, for example draw connections between unique humans, count the number of addresses single unique human has, etc.

The generation of proof of not being on a list of sanctioned individuals again follows the same steps as showed in the diagram. Albeit for the purpose of simplicity, one core part of the process is not showed in the diagram. To prove the absence of sanctions, the app will make an additional request to open sanctions API wrapped with zk-Oracle. The request to check if person is sanctioned or not requires name, surname and date of birth which is provided by smart-ID exactly as in other proofs. The response of the API, together with other relevant data (data signature created inside zk-Oracle) will be processed further inside the zero-knowledge powered smart contract.

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

Through this service, people can log in to government e-services, banks, authorize bank transfers, digitally sign official documents, and more. The interaction is equivalent to physically presenting a physical ID card or passport. Nationally accepted, it has become the prevailing method of verifying one's identity online.

# **The users**

| **User group** | **Needs** | **Potential size** |
| --- | --- | --- |
| **Blockchain Users** | Secure and private way to prove their identity and attributes without revealing sensitive personal information. They need to comply with regulations and ensure their transactions aren't associated with illicit activities. | This group is substantial and continues to grow with the adoption of blockchain and cryptocurrencies. Potential size: [**\>30 million**](https://triple-a.io/crypto-ownership-data/) |
| **DEX'es and their users** | DEX developers and users need a simple and straightforward mechanism to prevent transactions involving sanctioned individuals and adhere to regulatory requirements by the governments. | DEX users are a significant subset of the broader blockchain user base, likely in the hundreds of thousands to millions. Number of DEX'es: [**\>100**](https://www.alchemy.com/best/decentralized-exchanges-dexs) Number of DEX users: [**\>5 million**](https://www.statista.com/statistics/1297745/defi-user-number/) |
| **DAOs and their users** | DAO participants require a secure way to verify their identity when participating in governance processes, voting, and decision-making. Ensuring one-person-one-vote is essential for maintaining fairness and preventing manipulation. | The size of this group varies depending on the popularity of DAOs, but it's a growing segment within the blockchain community. Number of DAOs: [**\>1000**](https://blog.cfte.education/top-daos-projects-2023/#:~:text=As%20of%20January%202023%2C%20the,to%20explore%20about%20its%20projects!) Number of DAO users: [**\>6 million**](https://www.lifespan.io/news/dao-funding-facts-and-future-2023/#:~:text=As%20of%20April%202023%2C%20the,active%20voters%20and%20proposal%20makers.) |
| **Government and Regulatory Institutions** | Government agencies and regulatory bodies need efficient tools to verify the identity of individuals engaging in blockchain-related activities, prevent money laundering, and enforce age restrictions or other regulations in online interactions. | This group consists of government entities at various levels and sizes. The potential size is significant but specific to each jurisdiction. |

# **Long term vision**

The practice of directly sharing plain personal information will be eliminated, except when securely stored within government infrastructure or services like Smart-ID. Instead, personal information will be shared and utilized in the form of zero knowledge proofs stored on the blockchain. Zero knowledge proofs about individuals' identities will be stored on the blockchain in a form of [soul-bound-tokens](https://vitalik.ca/general/2022/01/26/soulbound.html).

Every transaction (up from some value?) will require the account to hold a proofs of individual behind the address not being financially sanctioned internationally. Voting and governance processes on chain that wants equal representation will require the account to hold a proof that represents unique human being. Proving your age online will be done by connecting a wallet to the website.

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

## **What other companies are solving this problem today or could if they wanted to?**

As far as we are aware, this proposal is totally unique and new. No other products like this currently exist. There's no product or service that offers users to prove they are not sanctioned or prove their age using zero knowledge environment.

Various initiatives, such as World Coin, Proof of Humanity, Human Protocol, Humanode have sought to address the digital identity problem (more on this in [Vitalik's interview in Time magazine](https://time.com/6142810/proof-of-humanity/)). However, a combination of smart-ID and Minas' zero-knowledge-powered smart contracts, presents a simple, unique, and powerful solution to this problem.

## **Product name**

🌌 **ShadowCloak** : zk-powered-identity

🐦 **anonBird:** zk-powered-identity

## **Pre-prototype experiments:**

[https://github.com/RaidasGrisk/mina-smart-ID](https://github.com/RaidasGrisk/mina-smart-ID)

[https://smart-id-oracle-2qz4wkdima-uc.a.run.app/api-docs/](https://smart-id-oracle-2qz4wkdima-uc.a.run.app/api-docs/)
