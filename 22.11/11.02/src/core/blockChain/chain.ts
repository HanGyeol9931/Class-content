import {Block} from "@core/blockChain/block";
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from "@core/config";

export class Chain {
    private blockchain : Block[];
    constructor(){
        this.blockchain = [Block.getGENESIS()];
    }
    public getChain() : Block[]{
        return this.blockchain;
    }
    public getLength() : number {
        return this.blockchain.length
    }
    public getLatestBlock() : Block {
        return this.blockchain[this.blockchain.length-1]
    }
    public addBlock(data:string[]) : Failable<Block,string>{
        const previousBlock  = this.getLatestBlock();
        const adjustmentBlock :Block = this.getAdjustmentBlock();
        const newBlock = Block.generateBlock(previousBlock,data,adjustmentBlock)
        const isValid = Block.isValidNewBlock(newBlock,previousBlock)
        if(isValid.isError) return {isError:true,value: "에러남"}
        this.blockchain.push(newBlock);
        return{isError:false,value :newBlock}
    }
    // 체인 검증 코드
    public isValidChain(chain : Block[]) : Failable<undefined,string>{
        // 최초 블록 검사 하는 코드
        const genesis = chain[0]

        for (let i = 0; i < chain.length; i++) {
            const newBlcok = chain[i];
            const previousBlock = chain[i-1];
            const isValid =Block.isValidNewBlock(newBlcok,previousBlock);
            if(isValid.isError) return{isError:true,value : isValid.value}
        }
        return { isError : false , value :undefined};
    }
    
    public replaceChain(receivedChain : Block[]):Failable<undefined,string>{
        // 본인 체인과 상대방 체인을 검사하는 과정
        const latestReceiveBlock : Block = receivedChain[receivedChain.length-1]
        const latestBlock : Block = this.getLatestBlock();
        if(latestReceiveBlock.height === 0){
            return {isError : true ,value : "받은 블록이 최초 블록"}
        }
        if(latestReceiveBlock.height <= latestBlock.height){
            return {isError : true, value : "본인의 블록보다 길거나 같은 블록"}
        }
        if(latestReceiveBlock.previousHash === latestBlock.hash){
            return {isError : true,value: "블록이 하나 만큼 모자라다"}
        }

        // 체인을 갱신 해준다.
        this.blockchain = receivedChain;

        return {isError : false, value : undefined}
    }

    // 생성 시점기준으로 블록 높이  -10인 블록 구하기

    // 현재 높이 값 < DIFFICULTY_ADJUSTMENT_INTERVAL 보다 크면 최초 블록 반환하고
    // 현재 높이 값이 DIFFICULTY_ADJUSTMENT_INTERVAL 보다 작으면 -10번째 블록 반환
    public getAdjustmentBlock(){
        const currentLength = this.getLength();
        const adjustmentBlock : Block = 
        this.getLength() < DIFFICULTY_ADJUSTMENT_INTERVAL ? 
        Block.getGENESIS() 
        : 
        this.blockchain[currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL];
        return adjustmentBlock; // 최초블록 or -10번째 블록 반환
    }
}