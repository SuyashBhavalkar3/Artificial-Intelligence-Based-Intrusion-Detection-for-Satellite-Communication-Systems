import os
import json
import logging
import time
from web3 import Web3
from solcx import compile_standard, install_solc

logger = logging.getLogger(__name__)

# Default Ganache URL
GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:8545")
CONTRACT_PATH = os.path.join(os.path.dirname(__file__), "..", "blockchain", "contracts", "SatelliteLedger.sol")
DEPLOYMENT_INFO = os.path.join(os.path.dirname(__file__), "deployment_info.json")

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
        self.contract = None
        self.contract_address = None
        
        # Load existing deployment if available
        if os.path.exists(DEPLOYMENT_INFO):
            with open(DEPLOYMENT_INFO, "r") as f:
                data = json.load(f)
                self.contract_address = data.get("address")
                self.abi = data.get("abi")
                if self.contract_address and self.abi:
                    self.contract = self.w3.eth.contract(address=self.contract_address, abi=self.abi)
        
        # Default Ganache Key #0
        self.private_key = os.getenv("ETHEREUM_PRIVATE_KEY", "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d") 
        self.account = self.w3.eth.account.from_key(self.private_key)

    def is_connected(self):
        return self.w3.is_connected()

    def compile_and_deploy(self):
        if not self.is_connected():
            logger.error("Not connected to Ethereum node")
            return None

        with open(CONTRACT_PATH, "r") as f:
            content = f.read()

        compiled_sol = compile_standard(
            {
                "language": "Solidity",
                "sources": {"SatelliteLedger.sol": {"content": content}},
                "settings": {
                    "outputSelection": {
                        "*": {
                            "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                        }
                    }
                },
            },
            solc_version="0.8.0",
        )

        bytecode = compiled_sol["contracts"]["SatelliteLedger.sol"]["SatelliteLedger"]["evm"]["bytecode"]["object"]
        abi = compiled_sol["contracts"]["SatelliteLedger.sol"]["SatelliteLedger"]["abi"]

        SatelliteLedger = self.w3.eth.contract(abi=abi, bytecode=bytecode)
        
        nonce = self.w3.eth.get_transaction_count(self.account.address)
        transaction = SatelliteLedger.constructor().build_transaction({
            "chainId": 1337, # Ganache default
            "gasPrice": self.w3.eth.gas_price,
            "from": self.account.address,
            "nonce": nonce,
        })
        
        signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        self.contract_address = tx_receipt.contractAddress
        self.abi = abi
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi)
        
        # Save deployment info
        with open(DEPLOYMENT_INFO, "w") as f:
            json.dump({"address": self.contract_address, "abi": self.abi}, f)

        logger.info(f"Contract deployed at {self.contract_address}")
        return self.contract_address, abi

    def record_threat(self, threat_id, threat_type, severity, timestamp, event_hash):
        if not self.contract:
            logger.error("Contract not deployed")
            return None

        nonce = self.w3.eth.get_transaction_count(self.account.address)
        
        # Convert timestamp to int if it's a datetime
        if not isinstance(timestamp, int):
            timestamp = int(timestamp.timestamp())

        transaction = self.contract.functions.recordThreat(
            threat_id, 
            threat_type, 
            severity, 
            timestamp, 
            event_hash
        ).build_transaction({
            "chainId": 1337,
            "gasPrice": self.w3.eth.gas_price,
            "from": self.account.address,
            "nonce": nonce,
        })

        signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return tx_receipt

    def get_threat(self, threat_id):
        if not self.contract:
            return None
        try:
            return self.contract.functions.getThreat(threat_id).call()
        except Exception as e:
            logger.error(f"Error fetching threat from blockchain: {e}")
            return None

blockchain_service = BlockchainService()
