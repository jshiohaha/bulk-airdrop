# Bulk Airdrop

Tired of repeatedly typing solana airdrop? Well, now you don't have to 🤝

You can use this script to make the process a little less painful. Still, please be mindful and don't infinitely airdrop yourself devnet/testnet SOL.

Note: this might be obvious to some, but you cannot airdrop yourself SOL on mainnet-beta. If you try, we will throw an error.

## Installation

1. Clone the repo
2. Run `yarn`
3. Done! That wasn't too painful.

Now, you should be able to run the following command to get some SOL:

```
ts-node src/index.ts bulk_airdrop --env [network] --amount [amount] --destination [destination]
```

where

* network = on which network to request airdrops. This script is really only useful on devnet or testnet. You can't airdrop SOL on mainnet-beta, and you can airdrop an unlimited amount on localnet.
* amount = the amount of SOL to airdrop in SOL, not lamports
* destination = public key of the wallet you want to fund via the airdrop

## License

There is no license. Do whatever you want with this script.
