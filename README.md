# smart-ID

[Smart-id](https://www.smart-id.com/) is the most prelevant authentication service used among the people in the baltic countries (and scandinavia?). The core idea of smart-id is that you can securely provide your personal information to services online by approving and signing the data request on your phone (this way proving that you are who you claim to be).

To put it simple, when I want to connect to my bank, I provide it with my personal identification number, then a push notification appears on my phone and by inputing my secret PIN I aprove the bank to access my personal data (name and surname, personal identification number and date of birth). This data is deemed to be correct and is equivalent to showing my ID-card or passport.

Using this service people can log into all the government e-services, banks, approve bank transfers, officially sign documents and so on. This interaction is equivalent to phisically signing a document, phisically showing personal ID card or passport and is accepted country wide (Estonia, Latvia, Lithuania, and some scandinavian countries) as prelevant way of proving your identity online.

# What is the catch? smart-ID + Mina

By combining oracles and smart-ID we can allow people to bring correct and verified personal data into smart contracts. In other words, the smart contracts can use this data as private input into various methods.

For example, using this data it is possible to:
1. **Prove unique human**. This is useful for online voting, UBI, etc. Essentially achieving the same as Word Coin, but using other much simpler means (no need for Orb) that are already available and widely used.
2. **Prove adulthood**. This is useful online for services that are age restricted. Already done a couple of times on Mina, but never using an official and verified data source that is accepted by the government as valid.
3. **Prove that the person is non sancioned**. This is useful for DEX'es that are required by regulations to make sure no illegal activity happens on the DEX. The only reason it would be possible to get this, is because *we're sure we've got correct and verified name, surname and DoB* which we can used to officially check if the individual is sancioned or not. [OpenSancionsAPI](https://api.opensanctions.org/)

# End result

By leveraging the interaction between smart-ID, oracles and zk smart contracts, it is possible to store various useful proofs on Mina blockhain. This service would be ready to be used by basically all of the population of the Baltic States.

# What else?

What other usecases are there to be created by having officially accepted and verified personal data available for zk smart contracts? Currently the following data can be fetched: 
- name and surname, 
- personal identification number, 
- date of birth.

# Other

I've build a somewhat similar service during cohort 0. But it is much more limited in terms of use and data. Instead of using officially approved data provided by smart-ID, it uses GitHub as its main data provider.

[Github account proof on Mina](https://zk-mina-github.vercel.app/)
