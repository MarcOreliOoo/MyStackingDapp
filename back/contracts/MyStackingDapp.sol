// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

//["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"],[100,100],2
//1000000000000000000

contract SharedWallet{

	//List of owners of the contract, only those can call some of the functions
	address[] public owners; 
	mapping(address => bool) public isOwner;
	uint8 public confirmationNeeded;
	
	uint256 public totalShares; //Total of shares 
	uint256 public totalAlreadyWithdrawed; //Total of ethers already withdrawed
	
	mapping(address => uint256) public sharePerUser; //Share per user
	mapping(address => uint256) public withdrawPerUser; //Amount of withdrawed ethers per user

    mapping(address => uint256) public erc20AmountBought; //Amount per ERC20 bought
    mapping(address => uint256) public erc721AmountBought; //Amount per ERC721 NFT Bought;
    //Todo buy theses token types


	//Todo : Emit event multiWallet built
	constructor(address[] memory _owners, uint256[] memory _shares, uint8 _confirmationNeeded){
		require(_owners.length == _shares.length, "owners and shares length mismatch");
		require(_owners.length > 0, "owners required");
		require(_confirmationNeeded > 0 && _confirmationNeeded <= _owners.length, "confirmation number invalid");
		
		for(uint i;i<_owners.length; i++){
			require(_owners[i] != address(0),"owner is address(0)");
			require(!isOwner[_owners[i]],"owner is already listed");
			require(_shares[i] > 0,"share is <= 0");
			
			owners.push(_owners[i]);
			isOwner[_owners[i]] = true;
			sharePerUser[_owners[i]] = _shares[i];
			totalShares += _shares[i];			
		}
		confirmationNeeded = _confirmationNeeded;
	}

	//Todo : Emit event receive Eth
	//Owners can send ethers, a contract, a sell can send ethers...
	receive() external payable {}

	//Todo : Emit event withdrawal
	//Todo : To Test 
	function withdraw() public {
		require(isOwner[msg.sender],"not an owner");
	
		uint256 toPay = ((address(this).balance + totalAlreadyWithdrawed) * sharePerUser[msg.sender]) / totalShares - withdrawPerUser[msg.sender];
		require(toPay>0,"Nothing to pay");

		totalAlreadyWithdrawed += toPay;
		withdrawPerUser[msg.sender] += toPay;

		(bool success,) = payable(msg.sender).call{value:toPay}("");
		require(success,"transaction failed");
	}


	/* ========== HELPERS ========== */
	function getBalance() external view returns (uint) {
		return address(this).balance;
	}


}

contract EtherWallet {
	address payable public owner;

	constructor() {
		owner = payable(msg.sender);
	}

	receive() external payable {}

	function withdraw(uint _amount) external {
		require(msg.sender == owner, "caller is not owner");
		payable(msg.sender).transfer(_amount);
	}

	function getBalance() external view returns (uint) {
		return address(this).balance;
	}
}

contract MultiSigWallet {
	event Deposit(address indexed sender, uint amount, uint balance);
	event SubmitTransaction(address indexed owner, uint indexed txIndex, address indexed to, uint value, bytes data);
	event ConfirmTransaction(address indexed owner, uint indexed txIndex);
	event RevokeConfirmation(address indexed owner, uint indexed txIndex);
	event ExecuteTransaction(address indexed owner, uint indexed txIndex);

	address[] public owners;
	mapping(address => bool) public isOwner;
	uint public numConfirmationsRequired;

	struct Transaction {
		address to;
		uint value;
		bytes data;
		bool executed;
		uint numConfirmations;
	}

	// mapping from tx index => owner => bool
	mapping(uint => mapping(address => bool)) public isConfirmed;

	Transaction[] public transactions;

	modifier onlyOwner() {
		require(isOwner[msg.sender], "not owner");
		_;
	}

	modifier txExists(uint _txIndex) {
		require(_txIndex < transactions.length, "tx does not exist");
		_;
	}

	modifier notExecuted(uint _txIndex) {
		require(!transactions[_txIndex].executed, "tx already executed");
		_;
	}

	modifier notConfirmed(uint _txIndex) {
		require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
		_;
	}

	constructor(address[] memory _owners, uint _numConfirmationsRequired) {
		require(_owners.length > 0, "owners required");
		require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,"invalid number of required confirmations");

		for (uint i = 0; i < _owners.length; i++) {
			address owner = _owners[i];

			require(owner != address(0), "invalid owner");
			require(!isOwner[owner], "owner not unique");

			isOwner[owner] = true;
			owners.push(owner);
		}

		numConfirmationsRequired = _numConfirmationsRequired;
	}

	receive() external payable {
		emit Deposit(msg.sender, msg.value, address(this).balance);
	}

	function submitTransaction(address _to, uint _value, bytes memory _data) public onlyOwner {
		uint txIndex = transactions.length;

		transactions.push(Transaction({to: _to, value: _value, data: _data, executed: false, numConfirmations: 0}));

		emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
	}

	function confirmTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex){
		Transaction storage transaction = transactions[_txIndex];
		transaction.numConfirmations += 1;
		isConfirmed[_txIndex][msg.sender] = true;

		emit ConfirmTransaction(msg.sender, _txIndex);
	}

	function executeTransaction(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
		Transaction storage transaction = transactions[_txIndex];

		require(transaction.numConfirmations >= numConfirmationsRequired, "cannot execute tx");

		transaction.executed = true;

		(bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
		require(success, "tx failed");

		emit ExecuteTransaction(msg.sender, _txIndex);
	}

	function revokeConfirmation(uint _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex){
		Transaction storage transaction = transactions[_txIndex];

		require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

		transaction.numConfirmations -= 1;
		isConfirmed[_txIndex][msg.sender] = false;

		emit RevokeConfirmation(msg.sender, _txIndex);
	}

	function getOwners() public view returns (address[] memory) {
		return owners;
	}

	function getTransactionCount() public view returns (uint) {
		return transactions.length;
	}

	function getTransaction(uint _txIndex) public view returns (address to, uint value, bytes memory data, bool executed, uint numConfirmations){
		Transaction storage transaction = transactions[_txIndex];

		return (transaction.to, transaction.value, transaction.data, transaction.executed, transaction.numConfirmations);
	}
}

contract TestContract {
    uint public i;
	string public str;

	function callMe(uint x) public {
        i += x;
    }

    function getData(uint x) public pure returns (bytes memory) {
        return abi.encodeWithSignature("callMe(uint256)", x);
    }


    function callMe1(uint j, uint y) public {
        i += j+y;
    }

    function getData1(uint x, uint y) public pure returns (bytes memory) {
        return abi.encodeWithSignature("callMe1(uint256,uint256)", x, y);
    }

	
    function callMe2(uint x, string memory y) public {
        i=x;
		str=y;
    }

    function getData2(uint x, string memory y) public pure returns (bytes memory) {
        return abi.encodeWithSignature("callMe2(uint256,string)", x, y);
    }
}
