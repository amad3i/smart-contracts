// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is Ownable {
    address public lastMember;
    uint public lastTimeStamp;
    uint8 public denominator = 100;
    uint8 public percentageReward = 90;

    event Participation(
        address sender, 
        uint value, 
        uint timeStamp
    );
    event Victory(
        address sender, 
        uint prise, 
        uint timeStamp
    );

    function participate() public payable {
        require(
            msg.value > (address(this).balance / denominator), 
            "More than 1% required from the amount of the contract"
        );
        
        lastMember = msg.sender;
        lastTimeStamp = block.timestamp;
        
        emit Participation(
            msg.sender, 
            msg.value, 
            lastTimeStamp
        );
    }

    function reward() public {
        require(
            msg.sender == lastMember,
            "You are not the last member"
        );
        require(
            block.timestamp - lastTimeStamp >= 1 hours, 
            "Its not time yet"
        );
        
        
        uint prise = (address(this).balance / denominator) * percentageReward;
        
        lastMember = address(0);
        payable(msg.sender).transfer(prise);

        emit Victory(
            msg.sender, 
            prise, 
            lastTimeStamp
        );
    }

    function currentBalance() public view returns(uint){
        return address(this).balance;
    }
}