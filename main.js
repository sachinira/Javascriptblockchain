const SHA256 = require('crypto-js/sha256');

class Transaction{

    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    } 



}


class Block{

    constructor(timestamp, transactions, previousHash=''){
        //index - where the block sits on the chain
        //timestamp - when th block was created
        //data-any type of data that has to associate with the block how much money,receiver,sender etc
        //previousHash-
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; //this value is added to change the hash 
        //generation when mining using proof of work algorithm


    }

    calculateHash(){
        //sha256 is not available as a function in javascript
        return SHA256(this.index+this.previousHash+this.timestamp+JSON.stringify(this.data)+this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")){
            //Array(difficulty+1).join(0) means ex difficulty=5 
            //then Array(6).join(0) = 000000
            //where Array(6) gives an array of length 6
            this.nonce++;
            this.hash = this.calculateHash();    
        }
        //hashes doesn't change if we don't change the content of our block so we could get an endless loop

        console.log("Block mined: "+ this.hash);


    }

}


class BlockChain{
    //initialize the chain
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;//as we may need  to change the difficulty in future
        //first block of the blockchain is called a genesis block and it must be added manually
        this.pendingTransactions = []; //this stores the transactions which are 
        //pending due to the proof of work algorithm
        this.miningReward =100;
    }

    createGenesisBlock(){
        //it returns a genesis block and its previous hash doesn't exist so we assign our own one
        return new Block("01/01/2018","Genesis block","0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    /*addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        //newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }*/

    minePendingTransactions(miningRewardAddress){
        //miner calles this function passing along his walet address to send 
        //rewards if a block was mined successfully
        //here we are putting all the pending transactions to one block
        // but in real world blockchain there are many of them & blocksize 
        //cannot exceed 1mb, so miners can choose which transaction they include 
        //and which are not
        
        let block = new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log("Block successfully mined");
        this.chain.push(block);

        //we reset te pending tranaction along we reward the miner
        this.pendingTransactions = [
            new Transaction(null,miningRewardAddress,this.miningReward)
        ];

        //this can be altered to reward more coins but blockchain has a 
        //peer-to-peer network so others will simply ignore the payment
        
    }

    createTransaction(tranaction){
        this.pendingTransactions.push(tranaction);
    }


    //checks the balance of an address
    //truely yo don't have a balance 
    //transactions are just stored in blockchain so if we ask the balance we have to go through 
    //all the transactions related to our address and calculate
    getBalanceOfAddress(address){
        let balance =0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    //blockchains cannot be altered without altering the previous blocks so we should have a way to 
    //checkoout the intergrity of the blockchain
    isChainValid(){
        //loop over the whole chain
        for(let i = 1;i< this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }

            return true;
        }
    }
}


let sachi = new BlockChain();
sachi.createTransaction(new Transaction('address1','address2',100));
sachi.createTransaction(new Transaction('address2','address1',50));

console.log("Starting a miner...");
sachi.minePendingTransactions("sachi-address");

console.log("Starting a miner...");
sachi.minePendingTransactions("sachi-address");


console.log("\nBalance of sachi is",sachi.getBalanceOfAddress("sachi-address"));




/*
console.log("Mining block 1...");
sachi.addBlock(new Block(1,"08/01/2018",{amount: 4}));

console.log("Mining block 2...");
sachi.addBlock(new Block(2,"09/01/2018",{amount: 10}));*/


/*console.log(JSON.stringify(sachi,null,4));
console.log('is blockchain valid? ' + sachi.isChainValid());

sachi.chain[1].data = {amount: 100};
sachi.chain[1].hash = sachi.chain[1].calculateHash();

console.log('is blockchain valid? ' + sachi.isChainValid());*/


//pt 2
//as we can create new blocks really quickly anyone 
//can spam the blockchain by blooding with blocks or 
//change each and every hash of the blokchain begining to end
// to have a valid blockchain

//proof of work must prove that you have put many computing 
//power to crate a block

//bitcoin requires a hash to begin with certain amount of zeros
//as we can't influence the output of a hash function
//so we must try a large no of combinations to find a hash 
//which has the sufficient amount of zeros to create a new block
//this is called difficulty and it is maintained so to have
//steady amount of blocks are added 1block/10min


//pt3
//reward miners
//block can cointain multiple transacions
//to set up an own cryptocurrency