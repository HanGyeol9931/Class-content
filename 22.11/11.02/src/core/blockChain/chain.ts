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