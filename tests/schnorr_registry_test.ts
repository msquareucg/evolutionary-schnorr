import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Verify signature registration process",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const signaturePublicKey = '0x1234567890abcdef';
        const signatureData = '0xabcdef1234567890';
        const metadata = 'Test Signature Metadata';

        const block = chain.mineBlock([
            Tx.contractCall('schnorr-registry', 'register-signature', 
                [types.buff(signaturePublicKey), types.buff(signatureData), types.ascii(metadata)], 
                deployer.address)
        ]);

        assertEquals(block.height, 2);
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk();
    }
});

Clarinet.test({
    name: "Prevent duplicate signature registration",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const signaturePublicKey = '0x1234567890abcdef';
        const signatureData = '0xabcdef1234567890';
        const metadata = 'Test Signature Metadata';

        const block = chain.mineBlock([
            Tx.contractCall('schnorr-registry', 'register-signature', 
                [types.buff(signaturePublicKey), types.buff(signatureData), types.ascii(metadata)], 
                deployer.address),
            Tx.contractCall('schnorr-registry', 'register-signature', 
                [types.buff(signaturePublicKey), types.buff(signatureData), types.ascii(metadata)], 
                deployer.address)
        ]);

        assertEquals(block.receipts.length, 2);
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr();
    }
});