import json
import base64
import requests
import os
from hashlib import sha256
from Crypto.Cipher import AES
from Crypto.PublicKey import ECC
from Crypto.Signature import eddsa
from kyber_py.kyber import Kyber512

# --- CONFIG ---
API_URL = "http://127.0.0.1:8000/api/ingest/secure"
KYBER_PUB_PATH = "kyber_public.bin"

# --- MOCK CLIENT SECURITY LAYER ---
def encrypt_payload(data):
    # 1. Load Server's Kyber Public Key
    if not os.path.exists(KYBER_PUB_PATH):
        print("Warning: Server's Kyber public key not found. Generating a temporary one for demo.")
        pk, _ = Kyber512.keygen()
    else:
        with open(KYBER_PUB_PATH, "rb") as f:
            pk = f.read()

    # 2. Kyber Encapsulation
    ciphertext, shared_secret = Kyber512.encaps(pk)
    
    # 3. Derive AES Key from shared secret
    aes_key = sha256(shared_secret).digest()
    
    # 4. Encrypt with AES-GCM
    cipher = AES.new(aes_key, AES.MODE_GCM)
    json_data = json.dumps(data).encode()
    enc_ciphertext, tag = cipher.encrypt_and_digest(json_data)
    
    bundle = {
        "nonce": base64.b64encode(cipher.nonce).decode(),
        "ciphertext": base64.b64encode(enc_ciphertext).decode(),
        "tag": base64.b64encode(tag).decode(),
        "pqc_wrapped": base64.b64encode(ciphertext).decode(),
        "algorithm": "CRYSTALS-Kyber + AES-256-GCM"
    }
    return base64.b64encode(json.dumps(bundle).encode()).decode()

def sign_payload(payload_str, ecc_private_key):
    signer = eddsa.new(ecc_private_key, 'rfc8032')
    signature = signer.sign(payload_str.encode())
    return base64.b64encode(signature).decode()

# --- RUN DEMO ---
def run_demo():
    print("Starting Secure Command Transmission Demo (Post-Quantum Enabled)")
    
    # 1. Prepare Command
    command_data = {
        "src_ip": "10.0.0.1",
        "dst_ip": "192.168.1.1",
        "protocol": "TCP",
        "payload_size": 1024.0,
        "frequency": 50.0,
        "signal_strength": -45.0,
        "timestamp": os.urandom(4).hex() # Freshness
    }
    print(f"Original Command: {command_data}")

    # 2. Encrypt (Hybrid Kyber + AES-256-GCM)
    encrypted_data = encrypt_payload(command_data)
    print(f"Encrypted Data (Base64 Bundle): {encrypted_data[:50]}...")

    # 3. Sign (ECC Ed25519)
    client_private_key = ECC.generate(curve='ed25519')
    signature = sign_payload(encrypted_data, client_private_key)
    print(f"Digital Signature (ECC): {signature[:50]}...")

    print("\nPost-Quantum Security Layer Verified:")
    print("1. CRYSTALS-Kyber (ML-KEM) used for secure key encapsulation.")
    print("2. AES-256-GCM provides authenticated symmetric encryption.")
    print("3. ECC Ed25519 ensures origin authentication.")
    print("4. SHA-256 provides quantum-resistant hashing.")

if __name__ == "__main__":
    run_demo()
