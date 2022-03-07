import { program } from "commander";
import log from "loglevel";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

program.version("0.0.1");
log.setLevel("info");

const programCommand = (name: string) => {
  return program.command(name).option(
    "-e, --env <string>",
    "Solana cluster env name",
    "devnet" // testnet, devnet
  );
};

const maxAirdropAmountPerRequest = LAMPORTS_PER_SOL * 2;
const transactionCostInLamports = 5000;

programCommand("bulk_airdrop")
  .option(
    "-d, --destination <string>",
    "Addrress you want to fund via the airdrop"
  )
  .option("-a, --amount <number>", "Amount of SOL to airdrop")
  .action(async (_, cmd) => {
    const { env, destination, amount } = cmd.opts();

    // bruh
    if (env === 'mainnet-beta') {
        throw new Error('no free lunches');
    }

    const conn: Connection = new Connection(clusterApiUrl(env));
    const _destination: PublicKey = new PublicKey(destination);
    let _amount = +amount * LAMPORTS_PER_SOL;

    while (_amount > 0) {
      const transientReceiver = Keypair.generate();
      console.log(
        `airdropping funds to intermediary: ${transientReceiver.publicKey.toString()}`
      );

      let transientReceiverFunds = 0;
      try {
        // add transaction cost of transferring airdropped funds to the destination wallet
        _amount += transactionCostInLamports;

        // hard-coded 20 SOL airdrop per wallet? not
        for (let j = 0; j < 5; j++) {
          const amountToAirdrop = Math.min(_amount, maxAirdropAmountPerRequest);

          // break early if no more funds to send
          if (amountToAirdrop <= 0) {
            break;
          }

          const signature = await conn.requestAirdrop(
            transientReceiver.publicKey,
            amountToAirdrop
          );
          await conn.confirmTransaction(signature);

          console.log(
            `airdropped ${amountToAirdrop} lamports to [${transientReceiver.publicKey.toBase58()}]. tx signature: ${signature}`
          );

          _amount -= amountToAirdrop;
          transientReceiverFunds += amountToAirdrop;
        }
      } catch (e: any) {
        // no-op
        console.log("airdrop error: ", e);
      } finally {
        // airdrop lamports less transaction fees
        transientReceiverFunds -= transactionCostInLamports;

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: transientReceiver.publicKey,
            toPubkey: _destination,
            lamports: transientReceiverFunds,
          })
        );

        const signature = await sendAndConfirmTransaction(conn, transaction, [
          transientReceiver,
        ]);
        await conn.confirmTransaction(signature);

        console.log(
          `sent ${transientReceiverFunds} lamports to wallet [${_destination.toString()}]: ${signature}`
        );
      }
    }
  });

program.parse(process.argv);
